import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  setupVault,
  verifyVaultPin,
  isVaultSetup,
  isVaultUnlocked,
  lockVault,
  updateUserProfile,
  updateMasterPin,
} from './auth';

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

  it('updates user profile and display name', async () => {
    await setupVault('Original User', '1234', 'orig@test.com');
    const updated = await updateUserProfile({
      displayName: 'New Username',
      email: 'new@test.com',
      photoURL: 'https://images.unsplash.com/test.jpg',
    });
    expect(updated.displayName).toBe('New Username');
    expect(updated.email).toBe('new@test.com');
    expect(updated.photoURL).toBe('https://images.unsplash.com/test.jpg');
  });

  it('updates master PIN after verifying current PIN', async () => {
    await setupVault('Alice', '1234');
    
    // Wrong current PIN fails
    const failRes = await updateMasterPin('9999', '5678');
    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain('Current Master PIN is incorrect');

    // Correct current PIN succeeds
    const successRes = await updateMasterPin('1234', '5678');
    expect(successRes.success).toBe(true);

    // Verify new PIN works
    lockVault();
    const verifyNew = await verifyVaultPin('5678');
    expect(verifyNew.success).toBe(true);
  });
});
