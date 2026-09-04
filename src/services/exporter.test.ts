import { describe, it, expect } from 'vitest';
import { exportMeetingMarkdown, exportMeetingText } from './exporter';
import { MeetingData } from '../types/meeting';

describe('Meeting Exporter Service', () => {
  const sampleMeeting: MeetingData = {
    id: 'test-meeting-101',
    title: 'Q3 Product Strategy Sync',
    createdAt: 1700000000000,
    durationSeconds: 125,
    participants: ['Alice', 'Bob', 'Charlie'],
    summary: {
      overview: 'Discussed Q3 roadmap milestones and database scaling.',
      keyPoints: [
        'Migrate from PostgreSQL to distributed cluster',
        'Implement biometric passkeys for vault unlock',
      ],
      decisions: ['Approved cluster migration'],
    },
    actionItems: [
      {
        id: 'act-1',
        task: 'Draft benchmark document',
        owner: 'Alice',
        due: 'Friday',
        completed: false,
      },
      {
        id: 'act-2',
        task: 'Review PR for WebCrypto',
        owner: 'Bob',
        completed: true,
      },
    ],
    followUpDraft: 'Hi team, thanks for joining today. Action items are assigned.',
    transcript: {
      text: 'Welcome everyone to the strategy session.',
      chunks: [
        {
          timestamp: [0, 5],
          speaker: 'Alice',
          text: 'Welcome everyone to the strategy session.',
        },
      ],
    },
  };

  it('generates formatted markdown with title, overview, action items and transcript', () => {
    const md = exportMeetingMarkdown(sampleMeeting);
    expect(md).toContain('# Q3 Product Strategy Sync');
    expect(md).toContain('**Participants:** Alice, Bob, Charlie');
    expect(md).toContain('## Executive Overview');
    expect(md).toContain('Discussed Q3 roadmap milestones');
    expect(md).toContain('## Key Discussion Points');
    expect(md).toContain('- Migrate from PostgreSQL');
    expect(md).toContain('## Action Items');
    expect(md).toContain('- [ ] **@Alice**: Draft benchmark document *(Due: Friday)*');
    expect(md).toContain('- [x] **@Bob**: Review PR for WebCrypto');
    expect(md).toContain('## Full Transcript');
    expect(md).toContain('**[0:00] Alice:** Welcome everyone to the strategy session.');
  });

  it('generates clean plain text notes', () => {
    const txt = exportMeetingText(sampleMeeting);
    expect(txt).toContain('Q3 PRODUCT STRATEGY SYNC');
    expect(txt).toContain('EXECUTIVE SUMMARY:');
    expect(txt).toContain('[TODO] Alice: Draft benchmark document (Due: Friday)');
    expect(txt).toContain('[DONE] Bob: Review PR for WebCrypto');
  });
});
