import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import 'fake-indexeddb/auto';
import { createEncryptedVaultBackup, restoreEncryptedVaultBackup } from './vaultBackup';
import { saveMeeting, getAllMeetings, clearAllMeetings } from './storage';
import { deriveKeyFromPassphrase, setActiveCryptoKey } from './crypto';
import { MeetingData } from '../types/meeting';

describe('Vault Backup & Restore Service', () => {
  const store: Record<string, string> = {};

  beforeAll(async () => {
    (global as any).localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); },
    };

    const key = await deriveKeyFromPassphrase('0000', new Uint8Array(16));
    setActiveCryptoKey(key);
  });

  beforeEach(async () => {
    localStorage.clear();
    await clearAllMeetings();
  });

  const sampleMeeting: MeetingData = {
    id: 'backup-test-1',
    title: 'Architecture Review',
    createdAt: 1700000000000,
    durationSeconds: 60,
    participants: ['Security Team'],
    summary: {
      overview: 'Reviewed AES-GCM vault architecture',
      keyPoints: ['Zero cloud telemetry'],
      decisions: ['Approved backup container spec'],
    },
    actionItems: [{ id: 'a1', task: 'Sign-off on backup schema', owner: 'Lead', completed: false }],
    transcript: {
      text: 'Backup encryption is ready.',
      chunks: [{ timestamp: [0, 5], speaker: 'Lead', text: 'Backup encryption is ready.' }],
    },
    followUpDraft: 'Thanks everyone for the review.',
  };

  it('creates an encrypted backup and successfully restores it with correct PIN', async () => {
    await saveMeeting(sampleMeeting);
    const initialMeetings = await getAllMeetings();
    expect(initialMeetings.length).toBe(1);

    // Create backup with PIN 5678
    const backupBlob = await createEncryptedVaultBackup('5678');
    expect(backupBlob.size).toBeGreaterThan(0);

    // Read blob text into File mock
    const text = await backupBlob.text();
    const backupFile = new File([text], 'test.ghostvault', { type: 'application/json' });

    // Clear meetings database
    await clearAllMeetings();
    const cleared = await getAllMeetings();
    expect(cleared.length).toBe(0);

    // Restore with wrong PIN -> fails
    const failRes = await restoreEncryptedVaultBackup(backupFile, '9999');
    expect(failRes.success).toBe(false);
    expect(failRes.error).toContain('Incorrect PIN');

    // Restore with correct PIN -> succeeds
    const successRes = await restoreEncryptedVaultBackup(backupFile, '5678');
    expect(successRes.success).toBe(true);
    expect(successRes.restoredCount).toBe(1);

    const restoredMeetings = await getAllMeetings();
    expect(restoredMeetings.length).toBe(1);
    expect(restoredMeetings[0].title).toBe('Architecture Review');
  });
});
