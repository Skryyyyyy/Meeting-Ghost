import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { setupVault, verifyVaultPin, isVaultSetup, isVaultUnlocked, lockVault } from './auth';

describe('On-Device Auth & PIN Service', () => {
  const store: Record<string, string> = {};
  const sessionStore: Record<string, string> = {};

  beforeAll(() => {
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };

    (global as any).sessionStorage = {
      getItem: (key: string) => sessionStore[key] || null,
      setItem: (key: string, value: string) => { sessionStore[key] = value; },
      removeItem: (key: string) => { delete sessionStore[key]; },
      clear: () => { Object.keys(sessionStore).forEach(k => delete sessionStore[k]); },
    };
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('sets up vault and verifies correct PIN', async () => {
    expect(isVaultSetup()).toBe(false);
    await setupVault('Alice', '1234');
    expect(isVaultSetup()).toBe(true);
    expect(isVaultUnlocked()).toBe(true);

    lockVault();
    expect(isVaultUnlocked()).toBe(false);

    const result = await verifyVaultPin('1234');
    expect(result.success).toBe(true);
    expect(isVaultUnlocked()).toBe(true);
  });

  it('rejects invalid PIN', async () => {
    await setupVault('Bob', '4321');
    lockVault();

    const result = await verifyVaultPin('9999');
    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid PIN');
    expect(isVaultUnlocked()).toBe(false);
  });

  it('allows default PIN 0000 when vault not initialized', async () => {
    const result = await verifyVaultPin('0000');
    expect(result.success).toBe(true);
    expect(isVaultUnlocked()).toBe(true);
  });
});
