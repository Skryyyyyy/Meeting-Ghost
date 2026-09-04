/**
 * Web Crypto API AES-GCM-256 Encryption & Decryption Service
 * Secures meeting notes and transcripts stored in IndexedDB and Firestore.
 */

const SALT_SIZE = 16;
const IV_SIZE = 12;

// In-memory active CryptoKey cache (never written to disk or sessionStorage)
let activeVaultCryptoKey: CryptoKey | null = null;

export function setActiveCryptoKey(key: CryptoKey | null): void {
  activeVaultCryptoKey = key;
}

export function getActiveCryptoKey(): CryptoKey | null {
  return activeVaultCryptoKey;
}

export function clearActiveCryptoKey(): void {
  activeVaultCryptoKey = null;
}

export async function deriveKeyFromPassphrase(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
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
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptData(plainText: string, passphraseOrKey?: string | CryptoKey): Promise<string> {
  let key: CryptoKey;
  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));

  if (passphraseOrKey instanceof CryptoKey) {
    key = passphraseOrKey;
  } else if (typeof passphraseOrKey === 'string' && passphraseOrKey.trim().length > 0) {
    key = await deriveKeyFromPassphrase(passphraseOrKey, salt);
  } else if (activeVaultCryptoKey) {
    key = activeVaultCryptoKey;
  } else {
    // Generate a secure ephemeral session key if none provided (never static fallback)
    key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    activeVaultCryptoKey = key;
  }

  const enc = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    enc.encode(plainText)
  );

  // Combine salt + iv + ciphertext into a single base64 payload
  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

  let binary = '';
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return 'ENC:' + btoa(binary);
}

export async function decryptData(encryptedStr: string, passphraseOrKey?: string | CryptoKey): Promise<string> {
  if (!encryptedStr.startsWith('ENC:')) {
    try {
      return decodeURIComponent(escape(atob(encryptedStr)));
    } catch {
      return encryptedStr;
    }
  }

  const rawBase64 = encryptedStr.slice(4);
  const binary = atob(rawBase64);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    combined[i] = binary.charCodeAt(i);
  }

  const salt = combined.slice(0, SALT_SIZE);
  const iv = combined.slice(SALT_SIZE, SALT_SIZE + IV_SIZE);
  const cipherBytes = combined.slice(SALT_SIZE + IV_SIZE);

  let key: CryptoKey;
  if (passphraseOrKey instanceof CryptoKey) {
    key = passphraseOrKey;
  } else if (typeof passphraseOrKey === 'string' && passphraseOrKey.trim().length > 0) {
    key = await deriveKeyFromPassphrase(passphraseOrKey, salt);
  } else if (activeVaultCryptoKey) {
    key = activeVaultCryptoKey;
  } else {
    throw new Error('Vault is locked. Valid decryption key or Master PIN required.');
  }

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
