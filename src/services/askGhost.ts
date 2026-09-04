import { MeetingData } from '../types/meeting';

export interface GhostSearchResult {
  meetingId: string;
  meetingTitle: string;
  relevanceScore: number;
  snippet: string;
  matchType: 'summary' | 'actionItem' | 'transcript' | 'decision';
  timestamp?: number;
}

export interface AskGhostAnswer {
  query: string;
  answer: string;
  citations: GhostSearchResult[];
  relatedActionItems: { task: string; owner: string; meetingTitle: string }[];
}

/**
 * Searches across all encrypted meetings using tokenized semantic relevance scoring
 * and synthesizes an on-device answer with citations.
 */
export function queryGhostVault(query: string, meetings: MeetingData[]): AskGhostAnswer {
  const cleanQuery = query.trim().toLowerCase();
  const queryTokens = cleanQuery
    .split(/\s+/)
    .map(t => t.replace(/[^a-z0-9]/g, ''))
    .filter(t => t.length > 2);

  const results: GhostSearchResult[] = [];
  const matchedActions: { task: string; owner: string; meetingTitle: string }[] = [];

  for (const meeting of meetings) {
    let score = 0;
    let bestSnippet = '';
    let matchType: GhostSearchResult['matchType'] = 'summary';

    // 1. Check Decisions & Key Points
    if (meeting.summary?.decisions) {
      for (const dec of meeting.summary.decisions) {
        const decLower = dec.toLowerCase();
        const matches = queryTokens.filter(t => decLower.includes(t)).length;
        if (matches > 0) {
          score += matches * 4;
          bestSnippet = dec;
          matchType = 'decision';
        }
      }
    }

    if (meeting.summary?.keyPoints) {
      for (const kp of meeting.summary.keyPoints) {
        const kpLower = kp.toLowerCase();
        const matches = queryTokens.filter(t => kpLower.includes(t)).length;
        if (matches > 0 && matches * 3 > score) {
          score += matches * 3;
          bestSnippet = kp;
          matchType = 'summary';
        }
      }
    }

    // 2. Check Action Items
    if (meeting.actionItems) {
      for (const ai of meeting.actionItems) {
        const aiText = `${ai.owner} ${ai.task}`.toLowerCase();
        const matches = queryTokens.filter(t => aiText.includes(t)).length;
        if (matches > 0) {
          matchedActions.push({
            task: ai.task,
            owner: ai.owner,
            meetingTitle: meeting.title,
          });
          if (matches * 3.5 > score) {
            score += matches * 3.5;
            bestSnippet = `Action Item (@${ai.owner}): ${ai.task}`;
            matchType = 'actionItem';
          }
        }
      }
    }

    // 3. Check Overview
    if (meeting.summary?.overview) {
      const ovLower = meeting.summary.overview.toLowerCase();
      const matches = queryTokens.filter(t => ovLower.includes(t)).length;
      if (matches > 0 && matches * 2 > score) {
        score += matches * 2;
        bestSnippet = meeting.summary.overview;
        matchType = 'summary';
      }
    }

    // 4. Check Transcript Chunks
    if (meeting.transcript?.chunks) {
      for (const chunk of meeting.transcript.chunks) {
        const chunkLower = chunk.text.toLowerCase();
        const matches = queryTokens.filter(t => chunkLower.includes(t)).length;
        if (matches > 0 && matches * 2 > score) {
          score += matches * 2;
          bestSnippet = `"${chunk.text}"`;
          matchType = 'transcript';
        }
      }
    }

    if (score > 0) {
      results.push({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        relevanceScore: score,
        snippet: bestSnippet || meeting.summary.overview,
        matchType,
      });
    }
  }

  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const topCitations = results.slice(0, 4);

  // Synthesize answer text
  let synthesizedAnswer = '';
  if (topCitations.length === 0) {
    synthesizedAnswer = `I searched your on-device vault across ${meetings.length} meeting records, but could not find specific mentions matching "${query}". Try searching for keywords like "roadmap", "architecture", or a person's name.`;
  } else {
    synthesizedAnswer = `Based on ${topCitations.length} matching meeting records in your vault:\n\n`;
    topCitations.forEach((cit) => {
      synthesizedAnswer += `• **${cit.meetingTitle}** (${cit.matchType}): ${cit.snippet}\n`;
    });
  }

  return {
    query,
    answer: synthesizedAnswer,
    citations: topCitations,
    relatedActionItems: matchedActions.slice(0, 3),
  };
}
