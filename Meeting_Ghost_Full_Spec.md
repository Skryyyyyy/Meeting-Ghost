# Meeting Ghost — Full Project Specification
### On-device meeting recorder, summarizer, and follow-up drafter
Track 04 — Productivity (City Battles + Finale)

---

## 1. One-line pitch

Meeting Ghost records a meeting on your phone, transcribes and summarizes it **entirely on-device**, extracts action items, and drafts follow-up messages — no audio or transcript ever leaves the phone, unlike Otter.ai, Fireflies, or Google Meet's cloud-based notetakers.

---

## 2. Problem statement

- Cloud meeting-notetaker tools (Otter, Fireflies, Fathom) require uploading raw audio to a third-party server. This is a non-starter for legal, HR, medical, sales, or any confidentiality-sensitive meeting.
- Most people don't take notes during meetings because it breaks focus — but forget 40–50% of discussed content within a day.
- Action items discussed verbally rarely get written down or followed up on.
- Enterprises are increasingly banning cloud AI notetakers in sensitive meetings (legal, board, HR) — creating a real gap for a privacy-first alternative.

---

## 3. Target users

| User | Use case |
|---|---|
| Sales/consulting professional | Client calls with confidential deal terms |
| Manager | 1:1s and team meetings — track commitments |
| Student | Lecture/group project recordings |
| Journalist | Interview transcription without cloud exposure |
| HR/Legal | Meetings that legally cannot leave a device |

---

## 4. Core value proposition (why it wins the hackathon)

1. **Privacy-by-architecture, not privacy-by-policy.** There is no server to trust — the audio physically cannot leave the device because there is no upload code path at all.
2. **Works offline.** Flights, basements, poor network areas — cloud tools fail here, Meeting Ghost doesn't.
3. **Zero marginal cost per meeting.** No API token costs, no cloud GPU bill — makes the product free to run at scale, which matters for a phone-brand-sponsored hackathon (they care about on-device AI as a hardware differentiator).
4. **Fast to demo.** Record a 2-minute fake meeting live on stage → show transcript, summary, action items, and a drafted follow-up email in under 30 seconds after stopping — no "please wait for it to process on our servers" moment.

---

## 5. System architecture

### 5.1 High-level flow

```
┌─────────────────────────── ON DEVICE ───────────────────────────┐
│                                                                    │
│  [Mic Capture] → [VAD] → [ASR: Whisper.cpp] → [LLM: Summarize]    │
│                                                    │                │
│                                    ┌───────────────┼──────────────┐│
│                                    ▼               ▼              ││
│                             [Local DB / Storage]  [Draft Composer]││
│                                                    │              ││
│                                                    ▼              ││
│                                         [User Review / Edit / Send]│
└────────────────────────────────────────────────────────────────┘
      (No network calls anywhere in this pipeline except optional
       "send email/Slack" step, which is user-initiated, not automatic)
```

### 5.2 Component breakdown

**A. Audio capture layer**
- Native mic access via platform APIs (`AVAudioEngine` on iOS / `AudioRecord` on Android, or `MediaRecorder` for a cross-platform/web demo).
- Streams to a rolling local buffer, never written to a network socket.
- Voice Activity Detection (VAD) — e.g. `webrtcvad` or Silero VAD (runs on-device, small model, ~1MB) — trims silence to reduce ASR compute.

**B. Speech-to-text (ASR) layer**
- **whisper.cpp** (C++ port of OpenAI Whisper) running the `tiny.en` or `base.en` quantized model (39MB–74MB) fully on-device.
- Alternative for Android specifically: Google's on-device Speech APIs (`SpeechRecognizer` with `RecognitionSupport` offline model) if you want to avoid bundling whisper.cpp for time constraints.
- Outputs timestamped transcript segments with speaker-agnostic text (speaker diarization is a stretch goal, see §11).

**C. On-device LLM layer**
- A small quantized instruction-tuned model, e.g. **Gemma 2B/3B (int4 quantized)**, **Phi-3-mini (3.8B, int4)**, or **Llama 3.2 1B/3B** — run via **llama.cpp**, **MLC-LLM**, or **Ollama's mobile runtime**, or the vendor's own on-device NPU SDK if the hackathon sponsor (iQOO/vivo) exposes one.
- Takes the raw transcript as input, produces structured JSON output:
  ```json
  {
    "summary": "...",
    "action_items": [
      {"owner": "Priya", "task": "Send pricing sheet", "due": "Friday"}
    ],
    "decisions": ["..."],
    "follow_up_draft": "..."
  }
  ```
- Prompt-engineered with a strict JSON schema instruction + few-shot examples so parsing is reliable without needing function-calling support.

**D. Local storage layer**
- SQLite (via `Room` on Android / `SwiftData`/`CoreData` on iOS, or `sql.js`/IndexedDB for a web demo) storing: meeting metadata, transcript, summary, action items — all encrypted at rest using the OS keychain/keystore.

**E. Draft composer / output layer**
- Renders the LLM's `follow_up_draft` into an editable text box.
- "Send" buttons hand off to native share sheet / Mail / WhatsApp / Slack intent — **the send action is user-initiated and explicit**, so the app is never silently transmitting data; only the final, user-approved message leaves the device, and only to the destination the user picks.

**F. UI layer**
- See §7 for detailed screen-by-screen design.

### 5.3 Data flow guarantee (the core pitch)

| Stage | Data location | Leaves device? |
|---|---|---|
| Raw audio | Local buffer | Never |
| Transcript | Local DB | Never |
| Summary/action items | Local DB | Never |
| Follow-up draft | Local DB | Never |
| Sent follow-up message | User's chosen app (Mail/Slack/etc.) | Only on explicit user tap, and only that final text — not the transcript |

---

## 6. Requirements

### 6.1 Functional requirements

- FR1: User can start/stop/pause a recording.
- FR2: App transcribes speech to text in near-real-time or immediately after stopping.
- FR3: App generates a structured summary (overview, key points, decisions).
- FR4: App extracts action items with owner + task (best-effort owner detection from transcript, editable by user).
- FR5: App drafts a follow-up message (email or chat-style) summarizing the meeting.
- FR6: User can edit any generated text before saving or sending.
- FR7: All meetings are listed in a history view, searchable by keyword.
- FR8: App works with airplane mode / no network connection, end-to-end.
- FR9: User can delete a meeting and its data permanently (right-to-delete, on-device).

### 6.2 Non-functional requirements

- NFR1: No audio, transcript, or derived text is transmitted over network during recording, transcription, or summarization.
- NFR2: End-to-end pipeline (5-min recording → summary ready) completes in under ~60 seconds on target hardware.
- NFR3: App must run on mid-range Android hardware (assume Snapdragon 7-series-class chip, 8GB RAM, since this is an iQOO-style device hackathon).
- NFR4: Models bundled must fit within a reasonable app size budget (~150–300MB total for ASR + LLM combined, using quantized models).
- NFR5: Data at rest is encrypted using OS-level secure storage.

### 6.3 requirements.txt (for a Python-based prototype/demo, e.g. desktop or backend-free proof of concept)

```txt
# Core ML runtime
llama-cpp-python==0.2.90
whisper-cpp-python==0.2.0
numpy==1.26.4
torch==2.3.1          # only if using Silero VAD via torch hub

# Audio
sounddevice==0.4.6
pydub==0.25.1
webrtcvad==2.0.10

# Storage
sqlalchemy==2.0.30

# UI (if prototyping desktop GUI before native app)
streamlit==1.36.0
# or PyQt6==6.7.0 for a more native-feeling demo

# Utilities
python-dotenv==1.0.1
pydantic==2.7.4
```

> Note: for the real mobile app, you will NOT use Python — this requirements.txt is only for a fast desktop proof-of-concept during ideation/testing before porting the pipeline to Kotlin/Swift + llama.cpp/whisper.cpp native bindings. See §8 for the actual mobile build plan.

### 6.4 Mobile stack requirements (actual hackathon build)

**Android (recommended primary target for iQOO hackathon):**
- Kotlin, Jetpack Compose (UI)
- whisper.cpp compiled via JNI/NDK, or `whisper.android` wrapper
- llama.cpp compiled via JNI/NDK for the LLM, or MLC-LLM Android runtime
- Room (local DB)
- Android Keystore (encryption)
- CameraX not needed; `MediaRecorder`/`AudioRecord` for capture

**Cross-platform fallback (if team is more comfortable with this, and demo device flexibility matters):**
- React Native + a native module bridging to whisper.cpp/llama.cpp
- Or Flutter with `whisper_flutter_new` + `fllama` (Flutter llama.cpp binding)

**Web-only fallback (for a browser demo if native build risk is too high in the time available):**
- `transformers.js` (Xenova) running Whisper-tiny and a small quantized LLM via WebGPU/WASM entirely in-browser — genuinely on-device, since inference happens client-side, and it's the fastest to get demoable.

---

## 7. UI/UX design — screen by screen

### Design language
- Clean, minimal, "trustworthy" feel — think Notion meets Signal. Muted palette (off-white/charcoal), one accent color (e.g. deep teal or amber) used sparingly for the record button and CTAs.
- A persistent small **"on-device" badge/lock icon** visible during recording and on summaries — this is your core trust signal, make it visually prominent but not gimmicky.

### Screen 1 — Home / Meeting list
- Top bar: app name + a small shield/lock icon with "on-device" label.
- Large floating **Record** button (bottom center, accent color, mic icon).
- Below: scrollable list of past meetings as cards — each card shows: title (auto-generated or editable), date/time, duration, a 1-line AI summary snippet, and a small "3 action items" chip.
- Search bar at top to filter meeting history by keyword.
- Empty state (no meetings yet): friendly illustration + "Tap record to capture your first meeting — nothing ever leaves your phone."

### Screen 2 — Active recording
- Full-screen, minimal: large waveform visualization (live amplitude bars) in the center, pulsing to show it's live.
- Big timer (00:04:32) above the waveform.
- Bottom: Pause and Stop buttons (Stop is the accent-colored primary action).
- Small live badge: "Transcribing on-device" with a subtle animated dot — no "uploading" language ever appears, obviously.
- Optional: live partial transcript scrolling faintly at the bottom (nice-to-have, shows the ASR working in real time — great demo moment).

### Screen 3 — Processing (post-stop)
- Short transitional screen (target: under 15–20 seconds): a simple progress indicator with rotating status text: "Transcribing…" → "Summarizing…" → "Drafting follow-up…"
- This is deliberately shown (not hidden behind a spinner) because watching the on-device pipeline work step-by-step is part of the trust-building demo.

### Screen 4 — Meeting summary (main output screen)
Organized as tabs or a single scrollable page with clear sections:
1. **Header**: meeting title (editable), date, duration, participant chips (if names were detected/entered).
2. **Summary** section: 3–5 sentence overview in plain language.
3. **Key points** section: bulleted list.
4. **Decisions made** section: bulleted list (if any detected).
5. **Action items** section: checklist-style rows, each with an editable owner name, task text, and optional due date; each has a checkbox to mark complete later.
6. **Full transcript** (collapsed by default, expandable) — timestamped, searchable.
7. **Follow-up draft** section: an editable text box pre-filled with a drafted email/message, with a "Send via…" button opening the native share sheet.

### Screen 5 — Settings
- Model selection (e.g. "Fast" vs "Accurate" transcription/summary quality trade-off — lets you show off model-swapping as a feature).
- Storage management: total space used by recordings/models, "delete all data" button.
- Language selection for transcription.
- Toggle: auto-delete raw audio after transcript is generated (extra privacy option — audio kept only transiently).

### Visual trust cues throughout
- Lock/shield iconography near anything showing generated content.
- No network activity indicators anywhere except the explicit "Send via…" share action.
- A one-time onboarding screen (first launch) explicitly stating: "Meeting Ghost never uploads your audio or transcripts. All processing happens on this device." with a simple diagram.

---

## 8. Step-by-step build plan (hackathon timeline)

Assume a typical hackathon window of ~24–36 hours across City Battle rounds, with more polish time for the Finale.

### Phase 0 — Setup (Hour 0–2)
1. Set up repo, choose stack (recommend: Android/Kotlin native for judging credibility on an Android-hardware-brand hackathon, or web/transformers.js if the team is small/time-constrained).
2. Pull and quantize models ahead of time: `whisper-tiny.en` (int8/int4 GGML) and a small LLM (Gemma 2B or Phi-3-mini, int4 GGUF).
3. Confirm both models run standalone on a target device/emulator before building any UI — this is the highest-risk technical unknown, de-risk it first.

### Phase 1 — Core pipeline (Hour 2–10)
4. Implement audio capture + local file buffer.
5. Integrate whisper.cpp for transcription; test on a pre-recorded sample meeting audio file.
6. Integrate the LLM; write and test the summarization/extraction prompt against 3–4 sample transcripts until JSON output is reliable.
7. Wire capture → ASR → LLM → structured output end-to-end via a simple CLI/script before touching UI (fastest way to validate the pipeline).

### Phase 2 — App shell + UI (Hour 10–18)
8. Build Screen 1 (Home/list) and Screen 2 (Recording) — get record/stop working against the real pipeline.
9. Build Screen 3 (Processing) and Screen 4 (Summary) — wire real pipeline output into the UI.
10. Add local DB persistence (Room/SQLite) so meetings survive app restarts.
11. Add edit-and-save functionality on summary/action items/draft fields.

### Phase 3 — Polish + demo prep (Hour 18–24)
12. Add the "Send via…" share sheet integration for the follow-up draft.
13. Add onboarding screen + trust-cue iconography.
14. Test on 2–3 real recorded meetings (record yourselves discussing something) to catch summarization quality issues.
15. Prepare a scripted live demo: a 60–90 second mock meeting with clear action items, so the AI output is impressive and easy to verify live.
16. Prepare fallback: a pre-recorded video of the full flow in case live demo hardware/audio fails on stage.

### Phase 4 — Finale-only enhancements (if you advance)
17. Add speaker diarization (who said what) — see §11.
18. Add multi-language support.
19. Add calendar integration (auto-detect meeting title/participants from the calendar event).
20. Add a lightweight settings screen for model quality trade-offs.
21. Performance optimization: reduce processing time, add streaming partial transcripts during recording (not just after stop).

---

## 9. How to use it (end-user flow)

1. Open the app, tap the large record button before your meeting starts (or during it).
2. Place the phone in the room, screen can be off — recording continues in the background.
3. When the meeting ends, tap Stop.
4. Watch the brief on-device processing screen (transcribing → summarizing → drafting).
5. Review the generated summary, key points, decisions, and action items. Edit any inaccuracies directly in the text.
6. Review the drafted follow-up message; edit tone/content as needed.
7. Tap "Send via…" and pick Mail, WhatsApp, Slack, etc. to send the final approved message — this is the only moment any content leaves the device, and it's the user's own explicit send action through their own app/account.
8. The meeting is saved in your history, searchable later; delete anytime from the meeting card.

---

## 10. Feasibility & availability analysis

### 10.1 Technical feasibility — high

| Component | Feasibility | Notes |
|---|---|---|
| On-device ASR | High | whisper.cpp is mature, well-documented, widely used in production mobile apps (e.g. many journaling/transcription apps already ship it). `tiny.en`/`base.en` run comfortably on mid-range phones. |
| On-device LLM | Medium-high | Gemma 2B / Phi-3-mini / Llama 3.2 1B-3B quantized to int4 run at usable speed (several tokens/sec) on modern mobile NPUs/GPUs via llama.cpp or MLC-LLM. Summarizing a 5–10 minute transcript (roughly 800–1500 words) is well within a small model's competence for extractive/light-abstractive summarization. |
| App size | Medium | Bundling both models pushes app size to ~150–300MB — acceptable for a hackathon demo, worth mentioning as a "future: download models on first launch" optimization for production. |
| Battery/thermal | Medium | Sustained LLM inference can heat the device; for a hackathon demo (single short meeting) this is a non-issue; worth a slide acknowledging it as a known trade-off for production. |
| Speaker diarization | Lower (stretch goal) | On-device diarization (e.g. pyannote-style models) is heavier and less mature on mobile; treat as a Finale-only stretch goal, not MVP. |

### 10.2 Timeline feasibility

- MVP (record → transcript → summary → action items, no fancy UI) is achievable by a 2–3 person team in the City Battle timeframe (assume ~24 hours) **if models are pre-downloaded and pre-tested before the clock starts** — this is the single biggest risk-reduction step.
- Full polished UI + share-sheet integration + onboarding is realistic as a stretch within the same window if the pipeline works cleanly by hour 10.
- Diarization, calendar integration, and multi-language support should be explicitly scoped as Finale-only additions, not MVP — don't over-promise for City Battles.

### 10.3 Availability of tools/libraries

All core components are open-source, actively maintained, and freely available with no licensing blockers:
- **whisper.cpp** — MIT license, GitHub, very active.
- **llama.cpp** — MIT license, GitHub, very active, supports Gemma/Phi/Llama GGUF formats.
- **Gemma 2B/Phi-3-mini/Llama 3.2** — all have permissive-enough licenses for hackathon/demo use (check the specific model card for any commercial-use caveats if you plan to productize afterward).
- **MLC-LLM** — Apache 2.0, provides pre-built Android/iOS runtimes, reduces integration time versus raw llama.cpp JNI bindings.
- If NDK/JNI integration proves too time-consuming, `transformers.js` (Xenova) gives a pure-web fallback that still runs 100% client-side in a mobile browser via WebGPU — genuinely on-device, and much faster to stand up under time pressure.

### 10.4 Risks & mitigations

| Risk | Mitigation |
|---|---|
| LLM output isn't valid JSON / is unreliable | Use strict prompt templates + few-shot examples; add a regex/parser fallback that extracts a summary even if structured fields fail; test against several sample transcripts before demo day. |
| On-device inference too slow on demo hardware | Pre-benchmark on the actual device you'll demo on; have a "Fast" model preset ready as fallback; keep the demo meeting short (60–90 sec of audio). |
| Live demo audio fails (background noise, mic issues) | Always have a backup pre-recorded video of the full flow ready to show if live capture fails. |
| Judges question "is it really on-device"? | Demo in airplane mode — the single most convincing proof you can offer live. |
| Time runs out before UI polish | Prioritize pipeline correctness first (Phase 1) since a working CLI demo with real output beats a polished UI with fake/mocked output. |

### 10.5 Competitive differentiation (for judging pitch)

| | Meeting Ghost | Otter.ai / Fireflies / Fathom |
|---|---|---|
| Audio processing location | On-device | Cloud servers |
| Works offline | Yes | No |
| Per-meeting marginal cost | ~$0 (no API calls) | Cloud compute + storage cost |
| Data exposure risk | None (no upload) | Third-party server exposure |
| Suitable for confidential meetings (legal/HR/medical) | Yes | Generally not recommended by compliance teams |

---

## 11. Stretch goals (Finale round)

- Speaker diarization ("who said what") using a lightweight on-device diarization model.
- Multi-language transcription and summarization.
- Calendar integration: auto-pull meeting title, participants, and agenda from the calendar event to improve summary accuracy and pre-fill owner names.
- Cross-meeting insights: "You've promised Priya 3 things across the last 2 weeks — here's a rollup."
- Widget/lock-screen quick-record button.
- Export meeting notes directly to Notion/Obsidian/local markdown file.

---

## 12. Pitch narrative (for judges, 60-second version)

"Every meeting notetaker on the market today — Otter, Fireflies, Fathom — works the same way: record your meeting, upload it to their servers, and get notes back. That's a dealbreaker for legal calls, HR conversations, sales negotiations, anything confidential. Meeting Ghost does the exact same job — transcription, summary, action items, follow-up drafts — but the audio never leaves your phone. We'll prove it: watch us record this demo in airplane mode." *(turn on airplane mode, record, stop, show summary generating)* "That's a real on-device speech model and a real on-device language model, running on this phone, right now, with zero network calls."

---
