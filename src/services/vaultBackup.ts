import { getAllMeetings, saveMeeting } from './storage';
import { getCurrentUser, updateUserProfile, UserProfile } from './auth';
import { MeetingData } from '../types/meeting';

export interface GhostVaultBackupContainer {
  version: 1;
  format: 'GHOST_VAULT_BACKUP';
  createdAt: number;
  salt: string; // Base64
  iv: string;   // Base64
  encryptedData: string; // Base64 AES-GCM ciphertext
}

interface DecryptedPayload {
  user: UserProfile | null;
  meetings: MeetingData[];
  exportedAt: number;
}

/**
 * Derive AES-GCM encryption key from user PIN/Passphrase using PBKDF2
 */
async function deriveBackupKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 150000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export complete vault into a secure, encrypted .ghostvault backup file
 */
export async function createEncryptedVaultBackup(pinOrPass: string): Promise<Blob> {
  const meetings = await getAllMeetings();
  const user = getCurrentUser();

  const payload: DecryptedPayload = {
    user,
    meetings,
    exportedAt: Date.now(),
  };

  const plainTextBytes = new TextEncoder().encode(JSON.stringify(payload));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await deriveBackupKey(pinOrPass, salt);
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    plainTextBytes
  );

  const toBase64 = (arr: Uint8Array) => {
    let bin = '';
    for (let i = 0; i < arr.length; i++) {
      bin += String.fromCharCode(arr[i]);
    }
    return btoa(bin);
  };

  const container: GhostVaultBackupContainer = {
    version: 1,
    format: 'GHOST_VAULT_BACKUP',
    createdAt: Date.now(),
    salt: toBase64(salt),
    iv: toBase64(iv),
    encryptedData: toBase64(new Uint8Array(encryptedBuf)),
  };

  const json = JSON.stringify(container, null, 2);
  return new Blob([json], { type: 'application/json' });
}

/**
 * Restore vault from a .ghostvault backup file with PIN verification
 */
export async function restoreEncryptedVaultBackup(
  backupFile: File,
  pinOrPass: string
): Promise<{ success: boolean; restoredCount: number; error?: string }> {
  try {
    const text = await backupFile.text();
    const container: GhostVaultBackupContainer = JSON.parse(text);

    if (container.format !== 'GHOST_VAULT_BACKUP' || container.version !== 1) {
      return { success: false, restoredCount: 0, error: 'Invalid or unsupported backup format.' };
    }

    const fromBase64 = (b64: string) => {
      const bin = atob(b64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) {
        arr[i] = bin.charCodeAt(i);
      }
      return arr;
    };

    const salt = fromBase64(container.salt);
    const iv = fromBase64(container.iv);
    const encryptedData = fromBase64(container.encryptedData);

    const key = await deriveBackupKey(pinOrPass, salt);

    let decryptedBuf: ArrayBuffer;
    try {
      decryptedBuf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as any },
        key,
        encryptedData
      );
    } catch {
      return { success: false, restoredCount: 0, error: 'Incorrect PIN / Passphrase for this backup.' };
    }

    const jsonStr = new TextDecoder().decode(decryptedBuf);
    const payload: DecryptedPayload = JSON.parse(jsonStr);

    // Restore meetings
    let restoredCount = 0;
    if (Array.isArray(payload.meetings)) {
      for (const meeting of payload.meetings) {
        await saveMeeting(meeting);
        restoredCount++;
      }
    }

    // Restore user profile if available
    if (payload.user?.displayName) {
      await updateUserProfile({
        displayName: payload.user.displayName,
        email: payload.user.email,
        photoURL: payload.user.photoURL,
      });
    }

    return { success: true, restoredCount };
  } catch (err: any) {
    return { success: false, restoredCount: 0, error: err.message || 'Failed to parse backup file.' };
  }
}
