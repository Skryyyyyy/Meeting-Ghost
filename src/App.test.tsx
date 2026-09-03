import { describe, it, expect } from 'vitest';
import { SAMPLE_MEETINGS } from './services/mockMeetings';
import { parseLLMMeetingOutput } from './services/jsonParser';

describe('App Integrity & Samples', () => {
  it('has pre-populated realistic sample meetings', () => {
    expect(SAMPLE_MEETINGS.length).toBeGreaterThanOrEqual(2);
    expect(SAMPLE_MEETINGS[0].title).toContain('On-Device AI Review');
    expect(SAMPLE_MEETINGS[0].actionItems.length).toBeGreaterThan(0);
    expect(SAMPLE_MEETINGS[0].summary.decisions.length).toBeGreaterThan(0);
  });

  it('can parse sample transcripts accurately', () => {
    const rawOutput = JSON.stringify({
      title: 'Sprint Retrospective',
      overview: 'Reflected on sprint velocity and test coverage.',
      key_points: ['Coverage is 88%', 'Fixed 4 regression bugs'],
      decisions: ['Add automated integration tests'],
      action_items: [
        { owner: 'Alex', task: 'Setup test runner in CI', due: 'Tomorrow' }
      ],
      follow_up_draft: 'Hi Alex, please configure the CI runner.'
    });

    const parsed = parseLLMMeetingOutput(rawOutput);
    expect(parsed.title).toBe('Sprint Retrospective');
    expect(parsed.actionItems[0].owner).toBe('Alex');
    expect(parsed.actionItems[0].task).toBe('Setup test runner in CI');
    expect(parsed.actionItems[0].due).toBe('Tomorrow');
  });
});
