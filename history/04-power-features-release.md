# 04 — Power Features Release (Streaming ASR, Templates, Audio Sync, ICS Export)

**Date:** 2026-09-03  
**Status:** Completed  

---

## 🚀 Features Added

1. **🎙️ Real-Time Live Speech Streaming Preview:**
   * Built periodic chunked transcription during recording (every 6 seconds) to display a live scrolling speech stream box while speaking.

2. **🎯 Meeting Templates (`MeetingTemplate`):**
   * Added 5 specialized meeting templates tailoring prompt generation:
     - **General Sync:** Standard overview & commitment extraction.
     - **1:1 Growth Sync:** Focuses on feedback, career goals & personal blockers.
     - **Tech Architecture:** Highlights SLA targets, architectural trade-offs & technical debt.
     - **Sales Discovery:** Extracts client pain points, budget/timeline signals & deal next steps.
     - **Incident Postmortem:** Highlights root causes, outage timeline & preventative measures.

3. **🔊 Audio-Synced Playback & Transcript Scrubbing:**
   * Added integrated audio player with real-time scrub bar on `SummaryView`.
   * Clicking any timestamp in the full transcript jumps immediately to that second in the audio recording.

4. **📅 One-Click Calendar ICS Export:**
   * Implemented `src/services/calendarExporter.ts` to export all action items with reminder alarms directly into Apple Calendar, Google Calendar, or Outlook (`.ics` format).
