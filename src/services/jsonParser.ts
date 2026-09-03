import { ActionItem } from '../types/meeting';

export interface ParsedLLMResponse {
  title: string;
  overview: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  followUpDraft: string;
  participants: string[];
}

export function parseLLMMeetingOutput(rawText: string, fallbackTitle: string = 'Recorded Meeting'): ParsedLLMResponse {
  let cleaned = rawText.trim();

  // Strip markdown code fences if present
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1].trim();
  } else {
    // If no code fence, try to find outer braces { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
  }

  let parsed: any = null;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // Fallback heuristic extraction if JSON is malformed
    return extractHeuristicFallback(rawText, fallbackTitle);
  }

  const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : fallbackTitle;
  const overview = typeof parsed.overview === 'string' ? parsed.overview : (typeof parsed.summary === 'string' ? parsed.summary : 'Summary unavailable.');
  
  const keyPoints: string[] = Array.isArray(parsed.key_points) 
    ? parsed.key_points.map(String) 
    : (Array.isArray(parsed.keyPoints) ? parsed.keyPoints.map(String) : []);

  const decisions: string[] = Array.isArray(parsed.decisions) 
    ? parsed.decisions.map(String) 
    : [];

  const rawActions = Array.isArray(parsed.action_items) 
    ? parsed.action_items 
    : (Array.isArray(parsed.actionItems) ? parsed.actionItems : []);

  const actionItems: ActionItem[] = rawActions.map((item: any, idx: number) => ({
    id: `act-${Date.now()}-${idx}`,
    owner: typeof item.owner === 'string' && item.owner.trim() ? item.owner.trim() : 'Unassigned',
    task: typeof item.task === 'string' ? item.task : (typeof item.description === 'string' ? item.description : 'Follow up on discussion item'),
    due: typeof item.due === 'string' ? item.due : (typeof item.deadline === 'string' ? item.deadline : undefined),
    completed: false
  }));

  const followUpDraft = typeof parsed.follow_up_draft === 'string' 
    ? parsed.follow_up_draft 
    : (typeof parsed.followUpDraft === 'string' ? parsed.followUpDraft : generateDefaultDraft(title, overview, actionItems));

  const participants: string[] = Array.isArray(parsed.participants)
    ? parsed.participants.map(String)
    : Array.from(new Set(actionItems.map(a => a.owner).filter(o => o && o !== 'Unassigned')));

  return {
    title,
    overview,
    keyPoints,
    decisions,
    actionItems,
    followUpDraft,
    participants
  };
}

function extractHeuristicFallback(text: string, title: string): ParsedLLMResponse {
  return {
    title,
    overview: text.slice(0, 300) + (text.length > 300 ? '...' : ''),
    keyPoints: ['Review full transcript for specific details.'],
    decisions: [],
    actionItems: [],
    followUpDraft: `Hi Team,\n\nHere is the summary of our meeting:\n\n${text.slice(0, 500)}\n\nBest regards,\nGhost Notes`,
    participants: []
  };
}

function generateDefaultDraft(title: string, overview: string, actions: ActionItem[]): string {
  let draft = `Hi Team,\n\nRecap of our meeting "${title}":\n\n${overview}\n\n`;
  if (actions.length > 0) {
    draft += `Action Items:\n`;
    actions.forEach(a => {
      draft += `• ${a.owner}: ${a.task}${a.due ? ` (Due: ${a.due})` : ''}\n`;
    });
  }
  draft += `\nBest regards,\nGhost Notes`;
  return draft;
}
