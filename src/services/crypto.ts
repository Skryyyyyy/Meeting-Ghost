/**
 * Web Crypto API AES-GCM-256 Encryption & Decryption Service
 * Secures meeting notes and transcripts stored in IndexedDB.
 */

const SALT_SIZE = 16;
const IV_SIZE = 12;

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

export async function encryptData(plainText: string, passphrase?: string): Promise<string> {
  if (!passphrase) {
    // Default fallback to base64 encoding if no custom passphrase is set
    return btoa(unescape(encodeURIComponent(plainText)));
  }

  const salt = crypto.getRandomValues(new Uint8Array(SALT_SIZE));
  const iv = crypto.getRandomValues(new Uint8Array(IV_SIZE));
  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const enc = new TextEncoder();
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    enc.encode(plainText)
  );

  // Combine salt + iv + ciphertext into a single base64 string
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

export async function decryptData(encryptedStr: string, passphrase?: string): Promise<string> {
  if (!encryptedStr.startsWith('ENC:')) {
    try {
      return decodeURIComponent(escape(atob(encryptedStr)));
    } catch {
      return encryptedStr;
    }
  }

  if (!passphrase) {
    throw new Error('Passphrase required to decrypt vault.');
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

  const key = await deriveKeyFromPassphrase(passphrase, salt);

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    key,
    cipherBytes
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
