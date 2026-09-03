import { describe, it, expect } from 'vitest';
import { MeetingData, ActionItem } from './meeting';

describe('Meeting Types', () => {
  it('validates ActionItem and MeetingData structure', () => {
    const item: ActionItem = {
      id: 'act-1',
      owner: 'Alice',
      task: 'Send slide deck',
      due: 'Friday',
      completed: false,
    };
    expect(item.id).toBe('act-1');
    expect(item.completed).toBe(false);

    const meeting: MeetingData = {
      id: 'm-1',
      title: 'Sprint Planning',
      createdAt: Date.now(),
      durationSeconds: 300,
      transcript: {
        text: 'Hello everyone',
        chunks: [{ timestamp: [0, 2], text: 'Hello everyone' }]
      },
      summary: {
        overview: 'Sprint goals discussion',
        keyPoints: ['Frontend refactor', 'WebGPU acceleration'],
        decisions: ['Use Transformers.js']
      },
      actionItems: [item],
      followUpDraft: 'Hi team, recap of sprint planning...',
      participants: ['Alice', 'Bob']
    };

    expect(meeting.title).toBe('Sprint Planning');
    expect(meeting.actionItems).toHaveLength(1);
    expect(meeting.summary.keyPoints).toContain('WebGPU acceleration');
  });
});
