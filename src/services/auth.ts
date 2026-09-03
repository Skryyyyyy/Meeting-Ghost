/**
 * On-Device Vault Authentication & PIN Security Service
 * 100% Client-Side using Web Crypto API (PBKDF2 + SHA-256)
 */

interface VaultProfile {
  username: string;
  pinHash: string; // Base64 PBKDF2 hash of user PIN
  salt: string;    // Base64 salt
  createdAt: number;
}

const VAULT_PROFILE_KEY = 'ghost_vault_profile';
const SESSION_AUTH_KEY = 'ghost_vault_unlocked';
const FAILED_ATTEMPTS_KEY = 'ghost_failed_attempts';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30s lockout after 5 fails

async function hashPin(pin: string, salt: Uint8Array): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  let binary = '';
  const bytes = new Uint8Array(derivedBits);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function isVaultSetup(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(VAULT_PROFILE_KEY) !== null;
}

export function isVaultUnlocked(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(SESSION_AUTH_KEY) === 'true';
}

export async function setupVault(username: string, pin: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const pinHash = await hashPin(pin, salt);

  let saltBinary = '';
  for (let i = 0; i < salt.length; i++) {
    saltBinary += String.fromCharCode(salt[i]);
  }

  const profile: VaultProfile = {
    username: username.trim() || 'Vault Owner',
    pinHash,
    salt: btoa(saltBinary),
    createdAt: Date.now(),
  };

  localStorage.setItem(VAULT_PROFILE_KEY, JSON.stringify(profile));
  sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
  sessionStorage.setItem('ghost_vault_key', pin);
  resetFailedAttempts();
}

export async function verifyVaultPin(enteredPin: string): Promise<{ success: boolean; error?: string }> {
  // Check lockout
  const lockoutStatus = checkLockout();
  if (lockoutStatus.locked) {
    return {
      success: false,
      error: `Too many failed attempts. Locked for ${lockoutStatus.remainingSecs}s.`,
    };
  }

  const rawProfile = localStorage.getItem(VAULT_PROFILE_KEY);
  if (!rawProfile) {
    // If no vault is setup yet, default demo PIN '0000' allows entry
    if (enteredPin === '0000') {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      sessionStorage.setItem('ghost_vault_key', '0000');
      return { success: true };
    }
    return { success: false, error: 'Vault not initialized. Enter 0000 or create an account.' };
  }

  try {
    const profile: VaultProfile = JSON.parse(rawProfile);
    const saltBinary = atob(profile.salt);
    const salt = new Uint8Array(saltBinary.length);
    for (let i = 0; i < saltBinary.length; i++) {
      salt[i] = saltBinary.charCodeAt(i);
    }

    const computedHash = await hashPin(enteredPin, salt);
    if (computedHash === profile.pinHash) {
      sessionStorage.setItem(SESSION_AUTH_KEY, 'true');
      sessionStorage.setItem('ghost_vault_key', enteredPin);
      resetFailedAttempts();
      return { success: true };
    }
  } catch (err) {
    console.error('Vault verification error:', err);
  }

  recordFailedAttempt();
  const currentFails = getFailedAttempts();
  const remaining = MAX_ATTEMPTS - currentFails;

  if (remaining <= 0) {
    return { success: false, error: 'Too many failed attempts. Vault locked for 30 seconds.' };
  }

  return { success: false, error: `Invalid PIN. ${remaining} attempt(s) remaining.` };
}

export function lockVault(): void {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(SESSION_AUTH_KEY);
    sessionStorage.removeItem('ghost_vault_key');
  }
}

export function getVaultUsername(): string {
  if (typeof localStorage === 'undefined') return 'Vault Owner';
  const raw = localStorage.getItem(VAULT_PROFILE_KEY);
  if (!raw) return 'Vault Owner';
  try {
    return JSON.parse(raw).username || 'Vault Owner';
  } catch {
    return 'Vault Owner';
  }
}

function recordFailedAttempt(): void {
  const current = getFailedAttempts() + 1;
  const data = {
    count: current,
    lastFail: Date.now(),
  };
  localStorage.setItem(FAILED_ATTEMPTS_KEY, JSON.stringify(data));
}

function resetFailedAttempts(): void {
  localStorage.removeItem(FAILED_ATTEMPTS_KEY);
}

function getFailedAttempts(): number {
  const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  if (!raw) return 0;
  try {
    return JSON.parse(raw).count || 0;
  } catch {
    return 0;
  }
}

function checkLockout(): { locked: boolean; remainingSecs: number } {
  const raw = localStorage.getItem(FAILED_ATTEMPTS_KEY);
  if (!raw) return { locked: false, remainingSecs: 0 };
  try {
    const data = JSON.parse(raw);
    if (data.count >= MAX_ATTEMPTS) {
      const elapsed = Date.now() - (data.lastFail || 0);
      if (elapsed < LOCKOUT_DURATION_MS) {
        const remainingSecs = Math.ceil((LOCKOUT_DURATION_MS - elapsed) / 1000);
        return { locked: true, remainingSecs };
      } else {
        resetFailedAttempts();
      }
    }
  } catch {
    resetFailedAttempts();
  }
  return { locked: false, remainingSecs: 0 };
}
