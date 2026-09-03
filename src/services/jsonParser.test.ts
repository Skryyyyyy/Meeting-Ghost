import { describe, it, expect } from 'vitest';
import { parseLLMMeetingOutput } from './jsonParser';

describe('JSON Parser Service', () => {
  it('parses valid markdown wrapped JSON', () => {
    const raw = `
    Here is the structured summary of the meeting:
    \`\`\`json
    {
      "title": "Marketing Sprint",
      "overview": "Launched social campaigns.",
      "key_points": ["Budget approved", "Twitter ad launched"],
      "decisions": ["Focus on LinkedIn and Twitter"],
      "action_items": [
        { "owner": "Claire", "task": "Design banners", "due": "Wednesday" }
      ],
      "follow_up_draft": "Hi Claire, please design banners by Wednesday."
    }
    \`\`\`
    Hope this helps!
    `;

    const parsed = parseLLMMeetingOutput(raw);
    expect(parsed.title).toBe('Marketing Sprint');
    expect(parsed.overview).toBe('Launched social campaigns.');
    expect(parsed.keyPoints).toHaveLength(2);
    expect(parsed.actionItems).toHaveLength(1);
    expect(parsed.actionItems[0].owner).toBe('Claire');
    expect(parsed.actionItems[0].task).toBe('Design banners');
    expect(parsed.actionItems[0].due).toBe('Wednesday');
    expect(parsed.participants).toContain('Claire');
  });

  it('handles raw JSON without code blocks', () => {
    const raw = `{
      "title": "Quick Standup",
      "overview": "Standup updates.",
      "key_points": ["All green"],
      "action_items": []
    }`;

    const parsed = parseLLMMeetingOutput(raw);
    expect(parsed.title).toBe('Quick Standup');
    expect(parsed.actionItems).toHaveLength(0);
  });

  it('gracefully handles malformed text via heuristic fallback', () => {
    const malformed = 'This is not JSON at all, but rather freeform notes taken during the meeting.';
    const parsed = parseLLMMeetingOutput(malformed, 'Fallback Meeting');
    expect(parsed.title).toBe('Fallback Meeting');
    expect(parsed.overview).toContain('This is not JSON');
    expect(parsed.followUpDraft).toBeDefined();
  });
});
