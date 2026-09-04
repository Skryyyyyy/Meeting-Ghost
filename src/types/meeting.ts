export interface ActionItem {
  id: string;
  owner: string;
  task: string;
  due?: string;
  completed: boolean;
}

export interface TranscriptSegment {
  timestamp: [number, number];
  text: string;
  speaker?: string;
}

export interface SummaryData {
  overview: string;
  keyPoints: string[];
  decisions: string[];
}

export interface MeetingBookmark {
  timestamp: number;
  label: string;
  type: 'decision' | 'blocker' | 'important';
}

export type MeetingTemplate = 'general' | 'one_on_one' | 'tech_architecture' | 'sales_call' | 'incident_postmortem';

export type TranscriptionLanguage = 'en' | 'multilingual' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'hi' | 'ta';

export interface MeetingData {
  id: string;
  title: string;
  template?: MeetingTemplate;
  language?: TranscriptionLanguage;
  createdAt: number;
  durationSeconds: number;
  audioBlob?: Blob;
  transcript: {
    text: string;
    chunks: TranscriptSegment[];
  };
  summary: SummaryData;
  actionItems: ActionItem[];
  followUpDraft: string;
  participants: string[];
  bookmarks?: MeetingBookmark[];
}

export type ProcessingStage =
  | 'idle'
  | 'audio_prep'
  | 'transcribing'
  | 'summarizing'
  | 'drafting'
  | 'complete'
  | 'error';
