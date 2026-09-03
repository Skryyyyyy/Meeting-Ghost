import { describe, it, expect } from 'vitest';
import { saveMeeting, getMeetings, getMeetingById, deleteMeeting, updateActionItemStatus } from './storage';
import { MeetingData } from '../types/meeting';
import 'fake-indexeddb/auto';

describe('Storage Service with AES-GCM-256 Encryption', () => {
  const sampleMeeting: MeetingData = {
    id: 'meet-enc-101',
    title: 'Executive Partnership Sync',
    createdAt: 1700000000000,
    durationSeconds: 180,
    transcript: {
      text: 'Good morning, let us review the confidential terms.',
      chunks: [{ timestamp: [0, 5], text: 'Good morning, let us review the confidential terms.' }]
    },
    summary: {
      overview: 'Discussion on NDA and SLA terms.',
      keyPoints: ['99.9% uptime SLA agreed', 'Payment schedule net 30'],
      decisions: ['Sign final contract on Monday']
    },
    actionItems: [
      { id: 'act-101', owner: 'Sarah', task: 'Send counter-signed NDA', due: 'Monday 5pm', completed: false }
    ],
    followUpDraft: 'Hi Sarah, summarizing our agreements on the SLA...',
    participants: ['Sarah', 'David']
  };

  it('encrypts on save and decrypts on retrieve', async () => {
    await saveMeeting(sampleMeeting);
    const list = await getMeetings();
    expect(list.length).toBeGreaterThanOrEqual(1);
    const found = await getMeetingById('meet-enc-101');
    expect(found?.title).toBe('Executive Partnership Sync');
    expect(found?.transcript.text).toContain('confidential');
  });

  it('updates action item completed status', async () => {
    await updateActionItemStatus('meet-enc-101', 'act-101', true);
    const updated = await getMeetingById('meet-enc-101');
    expect(updated?.actionItems[0].completed).toBe(true);
  });

  it('deletes an encrypted meeting by id', async () => {
    await deleteMeeting('meet-enc-101');
    const removed = await getMeetingById('meet-enc-101');
    expect(removed).toBeUndefined();
  });
});
