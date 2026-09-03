import { describe, it, expect } from 'vitest';
import { encryptData, decryptData } from './crypto';

describe('AES-GCM Encryption Service', () => {
  it('encrypts and decrypts with a passphrase', async () => {
    const text = 'Confidential CEO notes regarding Q4 roadmap';
    const passphrase = 'SuperSecretVaultPass123!';

    const encrypted = await encryptData(text, passphrase);
    expect(encrypted.startsWith('ENC:')).toBe(true);
    expect(encrypted).not.toContain('Confidential');

    const decrypted = await decryptData(encrypted, passphrase);
    expect(decrypted).toBe(text);
  });

  it('fails decryption with wrong passphrase', async () => {
    const text = 'Secret strategic deal terms';
    const encrypted = await encryptData(text, 'CorrectPass');

    await expect(decryptData(encrypted, 'WrongPass')).rejects.toThrow();
  });
});
