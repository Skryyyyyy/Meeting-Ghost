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
}

export interface SummaryData {
  overview: string;
  keyPoints: string[];
  decisions: string[];
}

export interface MeetingData {
  id: string;
  title: string;
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
}

export type ProcessingStage =
  | 'idle'
  | 'audio_prep'
  | 'transcribing'
  | 'summarizing'
  | 'drafting'
  | 'complete'
  | 'error';
