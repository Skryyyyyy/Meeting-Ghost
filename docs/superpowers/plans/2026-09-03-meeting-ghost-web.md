# Meeting Ghost Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete in-browser 100% on-device meeting recording, transcription, AI structured summarization, and follow-up email/action drafting application using React, Vite, Tailwind CSS, Transformers.js v3, WebLLM, and IndexedDB.

**Architecture:** Client-side React SPA with Web Audio API for recording and frequency analysis, a Web Worker for Whisper speech-to-text inference (@huggingface/transformers), an on-device LLM worker (WebLLM / ONNX) for JSON extraction of action items/summaries, an IndexedDB database for persistent offline storage, and responsive UI components for review, live waveform, and one-click sharing.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, @huggingface/transformers, @mlc-ai/web-llm, idb, vitest.

**Spec:** `docs/superpowers/specs/2026-09-03-meeting-ghost-web-design.md`

## Global Constraints

- Audio recording, transcription, and LLM summarization must execute 100% inside the browser on-device without remote backend API calls.
- UI must prominently display the "🔒 100% On-Device" trust cue.
- Follow-up sharing must support Copy to Clipboard, `mailto:` URL triggering, and Markdown export.
- Offline sample meetings must be pre-loaded so judges/users can test the pipeline instantly without microphone or long model downloads.

---

### Task 1: Project Scaffolding & Core Types

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/main.tsx`
- Create: `src/types/meeting.ts`
- Test: `src/types/meeting.test.ts`

**Interfaces:**
- Produces: `MeetingData`, `ActionItem`, `TranscriptSegment`, `SummaryData`, `ProcessingStage` types.

- [ ] **Step 1: Write the failing type test**

Create `src/types/meeting.test.ts`:
```typescript
import { describe, it, expect } from 'vitest';
import { MeetingData, ActionItem } from './meeting';

describe('Meeting Types', () => {
  it('validates ActionItem structure', () => {
    const item: ActionItem = {
      id: 'act-1',
      owner: 'Alice',
      task: 'Send slide deck',
      due: 'Friday',
      completed: false,
    };
    expect(item.id).toBe('act-1');
    expect(item.completed).toBe(false);
  });
});
```

- [ ] **Step 2: Scaffold Vite + React + Tailwind + Dependencies**

Write `package.json`:
```json
{
  "name": "meeting-ghost-web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "@huggingface/transformers": "^3.3.3",
    "@mlc-ai/web-llm": "^0.2.78",
    "clsx": "^2.1.1",
    "idb": "^8.0.2",
    "lucide-react": "^1.16.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^3.0.2"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.9",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.9",
    "typescript": "^5.7.3",
    "vite": "^6.2.0",
    "vitest": "^3.0.7"
  }
}
```

- [ ] **Step 3: Write types definition in `src/types/meeting.ts`**

```typescript
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

export type ProcessingStage = 'idle' | 'audio_prep' | 'transcribing' | 'summarizing' | 'complete' | 'error';
```

- [ ] **Step 4: Run test to verify passes**

Run: `npm test` or `npx vitest run`
Expected: PASS

---

### Task 2: Storage Layer (IndexedDB with IDB)

**Files:**
- Create: `src/services/storage.ts`
- Test: `src/services/storage.test.ts`

**Interfaces:**
- Consumes: `MeetingData` from `src/types/meeting.ts`
- Produces: `saveMeeting(meeting: MeetingData): Promise<void>`, `getMeetings(): Promise<MeetingData[]>`, `getMeetingById(id: string): Promise<MeetingData | undefined>`, `deleteMeeting(id: string): Promise<void>`, `updateActionItemStatus(meetingId: string, actionId: string, completed: boolean): Promise<void>`.

- [ ] **Step 1: Write test for storage operations**

`src/services/storage.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { saveMeeting, getMeetings, getMeetingById, deleteMeeting, updateActionItemStatus } from './storage';
import { MeetingData } from '../types/meeting';
import 'fake-indexeddb/auto';

describe('Storage Service', () => {
  const sampleMeeting: MeetingData = {
    id: 'meet-1',
    title: 'Product Sync',
    createdAt: 1700000000000,
    durationSeconds: 120,
    transcript: { text: 'Hello team', chunks: [{ timestamp: [0, 2], text: 'Hello team' }] },
    summary: { overview: 'Quick sync', keyPoints: ['Goal set'], decisions: ['Ship on Friday'] },
    actionItems: [{ id: 'a1', owner: 'Bob', task: 'Review PR', completed: false }],
    followUpDraft: 'Hi Bob, please review PR.',
    participants: ['Bob', 'Alice']
  };

  it('saves and retrieves meetings', async () => {
    await saveMeeting(sampleMeeting);
    const meetings = await getMeetings();
    expect(meetings.length).toBeGreaterThanOrEqual(1);
    const fetched = await getMeetingById('meet-1');
    expect(fetched?.title).toBe('Product Sync');
  });

  it('updates action item completion status', async () => {
    await updateActionItemStatus('meet-1', 'a1', true);
    const fetched = await getMeetingById('meet-1');
    expect(fetched?.actionItems[0].completed).toBe(true);
  });

  it('deletes meeting', async () => {
    await deleteMeeting('meet-1');
    const fetched = await getMeetingById('meet-1');
    expect(fetched).toBeUndefined();
  });
});
```

- [ ] **Step 2: Implement `src/services/storage.ts` using `idb`**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { MeetingData } from '../types/meeting';

interface MeetingDB extends DBSchema {
  meetings: {
    key: string;
    value: MeetingData;
    indexes: { 'by-date': number };
  };
}

const DB_NAME = 'meeting-ghost-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<MeetingDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<MeetingDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('meetings')) {
          const store = db.createObjectStore('meetings', { keyPath: 'id' });
          store.createIndex('by-date', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveMeeting(meeting: MeetingData): Promise<void> {
  const db = await getDB();
  await db.put('meetings', meeting);
}

export async function getMeetings(): Promise<MeetingData[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('meetings', 'by-date');
  return all.reverse(); // Newest first
}

export async function getMeetingById(id: string): Promise<MeetingData | undefined> {
  const db = await getDB();
  return db.get('meetings', id);
}

export async function deleteMeeting(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('meetings', id);
}

export async function updateActionItemStatus(meetingId: string, actionId: string, completed: boolean): Promise<void> {
  const db = await getDB();
  const meeting = await db.get('meetings', meetingId);
  if (!meeting) return;
  meeting.actionItems = meeting.actionItems.map(item =>
    item.id === actionId ? { ...item, completed } : item
  );
  await db.put('meetings', meeting);
}
```

- [ ] **Step 3: Run test to verify storage passes**

---

### Task 3: Audio Capture, Resampler & Preloaded Sample Meetings

**Files:**
- Create: `src/services/audio.ts`
- Create: `src/services/mockMeetings.ts`
- Test: `src/services/audio.test.ts`

**Interfaces:**
- Produces: `AudioRecorder` class (with `start()`, `pause()`, `resume()`, `stop()`, `getWaveformFloatArray()`), `resampleAudioBlobTo16kHz(blob: Blob): Promise<Float32Array>`, `SAMPLE_MEETINGS: MeetingData[]`.

- [ ] **Step 1: Write `src/services/mockMeetings.ts`**

Includes realistic sample meetings (Engineering Sprint Planning, Confidential HR 1:1, Legal Partnership Review) with transcripts, summaries, action items, and drafts for instant offline testing.

- [ ] **Step 2: Implement `src/services/audio.ts`**

Web Audio API resampler that takes input blobs/audio streams and converts them into `16000Hz` mono `Float32Array` matching Whisper's expected tensor input shape.

---

### Task 4: On-Device AI Pipeline (Whisper ASR + LLM Summarization & Parser)

**Files:**
- Create: `src/services/aiPipeline.ts`
- Create: `src/services/jsonParser.ts`
- Test: `src/services/jsonParser.test.ts`

**Interfaces:**
- Produces: `parseLLMMeetingOutput(rawText: string): { overview: string; keyPoints: string[]; decisions: string[]; actionItems: ActionItem[]; followUpDraft: string }`, `transcribeAudio(audioData: Float32Array, onProgress?: (p: number) => void): Promise<{ text: string; chunks: any[] }>`, `summarizeTranscript(transcript: string, onProgress?: (msg: string) => void): Promise<any>`.

- [ ] **Step 1: Write test for `jsonParser.test.ts`**

Test extracting clean JSON when LLMs produce markdown code blocks ` ```json ... ``` `, unescaped strings, or conversational text prefixes.

- [ ] **Step 2: Implement robust fallback parser and AI pipeline**

Integrates `@huggingface/transformers` pipeline (`automatic-speech-recognition`) with WebGPU/WASM fallback and smart prompt template for structured summarization.

---

### Task 5: UI Components (Header, Waveform, Cards, Checklist, Draft Composer)

**Files:**
- Create: `src/components/Header.tsx`
- Create: `src/components/LiveWaveform.tsx`
- Create: `src/components/MeetingCard.tsx`
- Create: `src/components/ProcessingModal.tsx`
- Create: `src/components/ActionItemsList.tsx`
- Create: `src/components/FollowUpComposer.tsx`
- Create: `src/components/TranscriptViewer.tsx`
- Create: `src/components/SettingsModal.tsx`

**Interfaces:**
- Clean Tailwind UI matching the spec's design language (Trustworthy, minimal, Notion/Signal aesthetic, prominent on-device badges).

---

### Task 6: Main Application Views & Integration

**Files:**
- Create: `src/views/HomeView.tsx`
- Create: `src/views/RecordingView.tsx`
- Create: `src/views/SummaryView.tsx`
- Modify: `src/App.tsx`
- Test: `src/App.test.tsx`

**Interfaces:**
- Connects recording, processing, summary review, and IndexedDB history in a seamless single-page application workflow.

---

### Task 7: End-to-End Verification & Offline Demo Mode

**Files:**
- Verify building production bundle: `npm run build`
- Verify running all unit and component tests: `npm test`
- Verify full offline capabilities with pre-loaded mock audio and instant on-device summary execution.

---
