# Meeting Ghost Web — Design Specification

**Date:** 2026-09-03  
**Status:** Approved  
**Target:** In-Browser 100% On-Device Web Application  
**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Transformers.js v3 (@huggingface/transformers), WebLLM / ONNX WebGPU, IndexedDB (`idb`).

---

## 1. Executive Summary

Meeting Ghost Web is a privacy-first, 100% on-device meeting recording, transcription, summarization, and follow-up draft assistant. It runs entirely inside the user's browser using WebGPU-accelerated ML models (Whisper ASR + Llama 3.2 / SmolLM2 LLM), ensuring no audio data or transcripts ever leave the machine over the network.

---

## 2. Architecture & Pipeline

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                IN-BROWSER RUNTIME                                      │
│                                                                                        │
│  1. Audio Input (Mic Capture / Audio Upload / Mock Samples)                           │
│         │                                                                              │
│         ▼                                                                              │
│  2. Web Audio Preprocessor (Resample to 16kHz Float32 PCM Mono)                        │
│         │                                                                              │
│         ▼                                                                              │
│  3. Whisper Worker (Transformers.js v3 WebGPU / WASM)                                 │
│     - Model: onnx-community/whisper-tiny.en                                            │
│     - Output: Timestamped chunked transcript segments                                  │
│         │                                                                              │
│         ▼                                                                              │
│  4. LLM Worker (WebLLM / ONNX WebGPU + Robust Schema Parser)                           │
│     - Model: Llama-3.2-1B-Instruct / SmolLM2-1.7B-Instruct / ONNX fallback            │
│     - Output: Structured JSON (Overview, Key Points, Decisions, Action Items, Draft)   │
│         │                                                                              │
│         ▼                                                                              │
│  5. Persistent Local Storage (IndexedDB via idb)                                       │
│     - Saved meetings, transcripts, summaries, action item status                       │
│         │                                                                              │
│         ▼                                                                              │
│  6. Interactive UI & Share Actions                                                     │
│     - Live Waveform Visualizer, Step-by-step Progress, Interactive Checklist,           │
│       Native Share / mailto / Slack copy                                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Contract & JSON Schema

The LLM extraction produces structured output adhering to the following TypeScript interface:

```typescript
export interface ActionItem {
  id: string;
  owner: string;
  task: string;
  due?: string;
  completed: boolean;
}

export interface MeetingData {
  id: string;
  title: string;
  createdAt: number;
  durationSeconds: number;
  audioBlob?: Blob;
  transcript: {
    text: string;
    chunks: Array<{ timestamp: [number, number]; text: string }>;
  };
  summary: {
    overview: string;
    keyPoints: string[];
    decisions: string[];
  };
  actionItems: ActionItem[];
  followUpDraft: string;
  participants: string[];
}
```

---

## 4. Screens & User Flow

### Screen 1: Home & Meeting Archive
- Top navigation with persistent **"🔒 100% On-Device / Offline Ready"** badge.
- Search bar to filter meetings by keyword, date, or participant.
- Quick action to load sample pre-recorded meetings (for instant demo validation).
- Floating accent **Record Meeting** CTA.

### Screen 2: Active Recording
- Canvas-based real-time audio waveform visualizer using Web Audio API `AnalyserNode`.
- Large duration counter.
- Live "Transcribing on-device..." status indicator.
- Controls: Pause, Resume, Stop & Process, and Cancel.

### Screen 3: Step-by-Step Processing Pipeline
- Visible stage transitions with animated progress bars:
  1. `Processing Audio (16kHz PCM)...`
  2. `Transcribing with Whisper-tiny.en...`
  3. `Analyzing & Extracting Action Items with LLM...`
  4. `Drafting Follow-up Email...`

### Screen 4: Meeting Summary & Action Hub
- **Executive Summary:** Clean paragraph overview.
- **Key Takeaways & Decisions:** Bullet points highlighting agreements.
- **Action Items Table/List:** Checkbox, editable assignee, task description, and due date.
- **Full Transcript:** Collapsible, searchable, with segment timestamps.
- **Follow-up Message Composer:** Pre-drafted email/Slack text with one-click **Copy to Clipboard**, **Open Email Client (`mailto:`)**, and **Download Markdown Report**.

### Screen 5: Settings & Model Management
- Model selection (Fast Tiny vs. High Accuracy Base/Small).
- WebGPU / WASM acceleration status indicator.
- Storage stats and cache clear buttons.

---

## 5. Reliability & Fallbacks

1. **Hardware Fallback:** If WebGPU is not supported on the browser, gracefully fallback to WASM execution.
2. **Offline Sample Runner:** Pre-packaged mock meeting audio and instant offline parser mode for rapid development testing and judge demonstrations without waiting for model downloads.
3. **Structured Parser Guard:** Robust regex and JSON-repair parser to guarantee clean extraction even if LLM output includes markdown backticks or commentary.

---

## 6. Verification & Testing Strategy

- **Audio Engine Test:** Verify 16kHz downsampling and microphone permission handling.
- **Transcription Test:** Test transcription on sample audio snippets.
- **LLM Extraction Test:** Verify JSON schema parsing on 5 diverse meeting transcripts.
- **Offline / Airplane Mode Test:** Verify application functions end-to-end disconnected from internet.
