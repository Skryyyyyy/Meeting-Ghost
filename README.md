<div align="center">

# 👻 Meeting Ghost

### **100% On-Device Meeting Recorder, Transcriber & AI Follow-Up Drafter**

[![React](https://img.shields.io/badge/React-19-black?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-black?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-black?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-black?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![WebGPU](https://img.shields.io/badge/Hardware-WebGPU%20Accelerated-black?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
[![Security](https://img.shields.io/badge/Security-AES--GCM--256%20%7C%20CSP%20%7C%20Auto--Lock-black?style=flat-square)](history/05-security-hardening-and-vulnerability-fixes.md)
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Offline%20%26%20On--Device-black?style=flat-square)](https://github.com/Skryyyyyy/Meeting-Ghost)

<p align="center">
  <b>No cloud servers. No API keys. Zero telemetry. Zero data leaks.</b><br>
  Record your meetings, transcribe speech in real-time, extract commitments, and compose follow-up messages entirely inside your browser sandbox.
</p>

</div>

---

## ⚡ The Problem vs. The Meeting Ghost Solution

| Feature | Cloud Notetakers (Otter, Fireflies, Fathom) | 👻 Meeting Ghost |
|---|---|---|
| **Audio Processing** | Uploads raw voice recordings to 3rd-party servers | **100% Client-Side on your CPU / WebGPU** |
| **Data Privacy** | Subject to cloud breaches & AI vendor training | **Zero network requests; physically cannot leak** |
| **Offline Operation** | Fails in flights, basements, or secure zones | **Works completely offline in Airplane Mode** |
| **Security at Rest** | Stored on 3rd party vendor database | **AES-GCM-256 Web Crypto Vault & Auto-Lock** |
| **Marginal Cost** | Monthly SaaS subscriptions or per-minute API fees | **$0.00 — Zero token costs forever** |
| **Confidentiality** | Incompatible with strict HR, Legal, & Medical compliance | **100% Compliant by Architecture** |

---

## 🏛️ System Architecture

```
┌────────────────────────────────────── IN-BROWSER ON-DEVICE CLIENT ──────────────────────────────────────┐
│                                                                                                          │
│  [Audio Capture (MediaRecorder/AudioContext)] ──► [80Hz-7.5kHz Biquad Filter Chain & Resampling]         │
│                                                                  │                                       │
│                                                                  ▼                                       │
│                                              [Transformers.js WebGPU Whisper-tiny.en]                    │
│                                                                  │ (Timestamped Transcript Segments)     │
│                                                                  ▼                                       │
│                                              [On-Device Structured LLM / XML Schema Parser]              │
│                                                                  │ (Strict Template JSON Extraction)     │
│                                                                  ▼                                       │
│                                               [AES-GCM Encrypted IndexedDB Local Storage]                │
│                                                                  │                                       │
│            ┌───────────────────────────────────┬─────────────────┴─────────────────┬───────────────────┐ │
│            ▼                                   ▼                                   ▼                   ▼ │
│    [Meeting Summary]                   [Action Checklist]                 [Follow-up Composer]   [Global Tasks]
│    (Overview, Key Points, Decisions)   (Assignee, Task, Due Date)         (Mail, PDF, Copy, MD)  (All Meetings)│
│                                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
      (No external network calls anywhere in this pipeline. 100% offline by design.)
```

---

## ✨ Latest Updates & Key Features

### 🎙️ 1. Real-Time Live Speech Stream
- Streams and displays a live scrolling speech preview box during recording using chunked on-device Whisper inference.

### 🎯 2. Specialized Meeting Templates
- Choose between **General Sync**, **1:1 Growth Sync**, **Tech Architecture**, **Sales Discovery**, and **Incident Postmortem** to tailor structured extraction.

### 🔊 3. Audio-Synced Playback & Timestamp Scrubbing
- Integrated audio playback bar with scrub control. Clicking any timestamp in the full transcript instantly jumps to that second in the audio recording.

### 📅 4. One-Click Calendar Export (`.ics`)
- Export pending action items directly to Apple Calendar, Google Calendar, or Outlook with automated reminder alarms.

### 📊 5. Cross-Meeting Global Tasks Hub
- Unified "All Tasks" modal to search, filter by assignee, and check off commitments across all past meetings.

### 🔒 6. Enterprise-Grade Security & Privacy Hardening
- **AES-GCM-256 Web Crypto:** Client-side PBKDF2 key derivation and AES-GCM encryption for stored notes.
- **Content Security Policy (CSP):** Prohibits unauthorized scripts, plugins, and remote network egress.
- **Inactivity Auto-Lock:** Automatically locks and blurs the screen after 5 minutes of idle time.
- **Noise Suppression Pre-Filter:** 80Hz Highpass + 7.5kHz Lowpass BiquadFilter chain for clear speech capture.
- **Secure Buffer Disposal:** Explicit memory clearing upon recording completion.
- **File Upload Safeguards:** 50MB client-side caps and RFC 5545 calendar value escaping.

---

## 📜 Development History & Change Logs

Detailed engineering logs of every phase are maintained in the [`history/`](history/) folder:

- [`history/01-initial-spec-and-architecture.md`](history/01-initial-spec-and-architecture.md) — Problem statement, platform selection & architecture.
- [`history/02-scaffolding-and-core-pipeline.md`](history/02-scaffolding-and-core-pipeline.md) — Vite + React 19 scaffolding, audio engine, Whisper WebGPU & Vitest suite.
- [`history/03-monochromatic-white-redesign.md`](history/03-monochromatic-white-redesign.md) — Complete minimalist monochromatic white & zinc aesthetic redesign.
- [`history/04-power-features-release.md`](history/04-power-features-release.md) — Live speech streaming, meeting templates, audio sync, and `.ics` export.
- [`history/05-security-hardening-and-vulnerability-fixes.md`](history/05-security-hardening-and-vulnerability-fixes.md) — AES-GCM crypto, CSP, auto-lock, buffer disposal, and global tasks rollup.
- [`history/06-full-encryption-and-runtime-hardening.md`](history/06-full-encryption-and-runtime-hardening.md) — Direct IndexedDB vault encryption, PIN-protected lock, streaming mutex & track unload teardown.
- [`history/07-landing-page-and-vault-auth-system.md`](history/07-landing-page-and-vault-auth-system.md) — Monochromatic landing page, Master PIN setup/login, and brute-force lockout defenses.
- [`history/08-firebase-google-auth-and-privacy-center.md`](history/08-firebase-google-auth-and-privacy-center.md) — Firebase Google & Email auth, SQLi defense, Master PIN reset, cookie preferences, and GDPR data export/purge.
- [`history/09-firebase-credentials-and-csp-configuration.md`](history/09-firebase-credentials-and-csp-configuration.md) — Live Firebase configuration, Google OAuth integration, and CSP whitelisting.
- [`history/10-backend-firestore-sync-and-security-rules.md`](history/10-backend-firestore-sync-and-security-rules.md) — Firestore backend integration, zero-knowledge cloud backup, production security rules, and secrets isolation.
- [`history/11-in-memory-cryptokey-and-anti-prompt-injection.md`](history/11-in-memory-cryptokey-and-anti-prompt-injection.md) — In-memory CryptoKey management, spoken prompt injection shielding, and synchronous teardown.
- [`history/12-session-desync-and-audio-forensic-zeroing.md`](history/12-session-desync-and-audio-forensic-zeroing.md) — Firebase session revocation sync, audio buffer zeroing, and RFC 822 .EML export.
- [`history/13-storage-quota-monitoring-and-resilience.md`](history/13-storage-quota-monitoring-and-resilience.md) — Browser storage quota estimator, disk usage telemetry, and IndexedDB resilience.

---

## 🛠️ Tech Stack

- **Frontend:** [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Speech-to-Text (ASR):** [@huggingface/transformers](https://huggingface.co/docs/transformers.js) (Whisper ONNX via WebGPU / WASM)
- **Language Model:** On-device WebLLM / Rule-augmented Schema Parser
- **Cryptography:** Native Web Crypto API (`SubtleCrypto` AES-GCM-256)
- **Storage:** [idb](https://github.com/jakearchibald/idb) (IndexedDB wrapper)
- **Testing:** [Vitest](https://vitest.dev/)

---

## 🚀 Quick Start

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

### Run Automated Tests

```bash
npm test
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 🛡️ Privacy & Compliance Guarantee

Meeting Ghost contains **zero code paths** for transmitting audio blobs, transcripts, or summaries to remote servers. All computation executes locally inside your browser's Web Worker and WebGPU contexts.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
