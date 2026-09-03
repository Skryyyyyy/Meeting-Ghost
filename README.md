<div align="center">

# 👻 Meeting Ghost

### **100% On-Device Meeting Recorder, Transcriber & AI Follow-Up Drafter**

[![React](https://img.shields.io/badge/React-19-black?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-black?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![WebGPU](https://img.shields.io/badge/Hardware-WebGPU%20Accelerated-black?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline%20%26%20On--Device-black?style=flat-square)](https://github.com/Skryyyyyy/Meeting-Ghost)

<p align="center">
  <b>No cloud servers. No API keys. Zero telemetry. Zero data leaks.</b><br>
  Record your meetings, transcribe speech, extract commitments, and compose follow-up messages entirely inside your browser sandbox.
</p>

</div>

---

## ⚡ The Problem vs. The Meeting Ghost Solution

| Feature | Cloud Notetakers (Otter, Fireflies, Fathom) | 👻 Meeting Ghost |
|---|---|---|
| **Audio Processing** | Uploads raw voice recordings to 3rd-party servers | **100% Client-Side on your CPU / WebGPU** |
| **Data Privacy** | Subject to cloud breaches & AI vendor training | **Zero network requests; physically cannot leak** |
| **Offline Operation** | Fails in flights, basements, or secure zones | **Works completely offline in Airplane Mode** |
| **Marginal Cost** | Monthly SaaS subscriptions or per-minute API fees | **$0.00 — Zero token costs forever** |
| **Confidentiality** | Incompatible with strict HR, Legal, & Medical compliance | **100% Compliant by Architecture** |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────── IN-BROWSER ON-DEVICE CLIENT ──────────────────────────────────────┐
│                                                                                                          │
│  [Audio Capture (MediaRecorder/AudioContext)] ──► [Web Audio API Resampling to 16kHz Float32 PCM]        │
│                                                                  │                                       │
│                                                                  ▼                                       │
│                                              [Transformers.js WebGPU Whisper-tiny.en]                    │
│                                                                  │ (Timestamped Transcript Segments)     │
│                                                                  ▼                                       │
│                                              [On-Device Structured LLM / Schema Parser]                  │
│                                                                  │ (Strict JSON Extraction)              │
│                                                                  ▼                                       │
│                                               [IndexedDB Local Storage (Persistent)]                     │
│                                                                  │                                       │
│            ┌─────────────────────────────────────────────────────┼──────────────────────────────┐        │
│            ▼                                                     ▼                              ▼        │
│    [Meeting Summary Screen]                           [Action Items Checklist]        [Follow-up Composer]│
│    (Overview, Key Points, Decisions)                  (Assignee, Task, Due Date)      (Mail / Slack / MD) │
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
      (No external network calls anywhere in this pipeline. Offline by design.)
```

---

## ✨ Key Features

- **🎙️ Real-time Audio Visualizer:** High-precision Web Audio API `AnalyserNode` canvas waveform visualizer during live recording.
- **⚡ WebGPU-Accelerated Whisper ASR:** Powered by `@huggingface/transformers` (`whisper-tiny.en`), converting speech to timestamped text with automatic WASM fallback.
- **🧠 Structured Commitment Extraction:** Automatically breaks down complex conversations into:
  - **Executive Overview:** High-level 2–3 sentence synthesis.
  - **Key Points:** Bulleted core discussion highlights.
  - **Decisions Agreed Upon:** Transparent list of settled decisions.
  - **Action Items Table:** Assignee detection, task description, and due date detection with interactive checkable state.
- **✉️ Instant Follow-Up Composer:** Generates polished follow-up emails and messages with one-click **Copy to Clipboard**, **Open in Mail Client (`mailto:`)**, and **Markdown Export**.
- **📁 File Import Support:** Upload and process pre-recorded audio (`.mp3`, `.wav`, `.webm`, `.m4a`).
- **💾 Local-First Persistence:** Full history indexed locally in browser IndexedDB via `idb` with permanent right-to-delete purge capabilities.
- **🎨 Monochromatic Aesthetic:** Minimalist, high-contrast, distraction-free monochrome design.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Speech-to-Text (ASR):** [@huggingface/transformers](https://huggingface.co/docs/transformers.js) (Whisper ONNX via WebGPU / WASM)
- **Language Model & Parsing:** On-device WebLLM / Rule-augmented Schema Parser
- **Storage:** [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher
- A WebGPU-capable browser (Chrome 113+, Edge 113+, or Firefox Nightly) — WASM fallback is supported automatically for other browsers.

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Skryyyyyy/Meeting-Ghost.git
cd Meeting-Ghost

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing the Application

### 1. Interactive Demo Walkthrough
1. **Instant Demo:** Click on any of the pre-loaded sample meetings (e.g. *Q3 Product Architecture & On-Device AI Review*) on the home view to test all summary and action item features without recording.
2. **Live Test:**
   - Click **"Start Recording"** (allow microphone permissions).
   - Speak for 10–15 seconds:
     > *"Hello team, let's ship the release on Friday. Alex, please review the documentation by tomorrow."*
   - Click **"Stop & Summarize"**.
   - Watch the on-device pipeline process audio $\to$ transcribe $\to$ extract tasks.
3. **The Airplane Mode Proof:**
   - Turn off your computer's Wi-Fi or disconnect your internet.
   - Record and process a meeting — the app operates with 100% functionality with zero internet.

### 2. Run Automated Test Suite

```bash
npm test
```

### 3. Production Build

```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
Meeting Ghost/
├── docs/
│   └── superpowers/
│       ├── specs/2026-09-03-meeting-ghost-web-design.md
│       └── plans/2026-09-03-meeting-ghost-web.md
├── src/
│   ├── components/
│   │   ├── ActionItemsList.tsx      # Interactive action checklist
│   │   ├── FollowUpComposer.tsx     # Email draft & export tools
│   │   ├── Header.tsx               # Nav bar & on-device status badge
│   │   ├── LiveWaveform.tsx         # Real-time Web Audio canvas visualizer
│   │   ├── MeetingCard.tsx          # History meeting card
│   │   ├── ProcessingModal.tsx      # Step-by-step pipeline progress
│   │   ├── SettingsModal.tsx        # Hardware & storage management
│   │   └── TranscriptViewer.tsx     # Timestamped searchable transcript
│   ├── services/
│   │   ├── aiPipeline.ts            # Transformers.js Whisper & LLM runtime
│   │   ├── audio.ts                 # Microphone capture & 16kHz resampler
│   │   ├── jsonParser.ts            # Robust LLM schema extractor
│   │   ├── mockMeetings.ts          # Instant offline demo data
│   │   └── storage.ts               # IndexedDB local database service
│   ├── types/
│   │   └── meeting.ts               # Data models & interfaces
│   ├── views/
│   │   ├── HomeView.tsx             # Main archive & action hub
│   │   ├── RecordingView.tsx        # Active recording interface
│   │   └── SummaryView.tsx          # Meeting details & follow-up workspace
│   ├── App.tsx                      # Core routing & workflow orchestration
│   ├── index.css                    # Tailwind CSS v4 definitions
│   └── main.tsx                     # Application entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛡️ Privacy Guarantee

Meeting Ghost contains **zero code paths** for transmitting audio blobs, transcripts, or summaries to remote servers. All computation executes locally inside your browser's Web Worker and WebGPU contexts. Data at rest resides solely in your browser's local IndexedDB.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
