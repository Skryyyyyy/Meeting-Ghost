# 14 — PWA Desktop Manifest, Live Milestone Bookmarks & Search Highlighting

**Date:** 2026-09-04  
**Status:** Completed  

---

## 🚀 Key Improvements & Upgrades

1. **🔍 Interactive Transcript Search & Keyword Highlighting (`src/components/TranscriptViewer.tsx`):**
   * Real-time query search filtering across all transcript segments.
   * Visual `<mark>` badges highlighting matching keywords and speaker tags.
   * Instant audio timestamp jump button to sync playback with exact spoken words.

2. **📌 Live Milestone Bookmarking (`src/views/RecordingView.tsx`, `src/views/SummaryView.tsx`):**
   * Users can flag live milestones during meetings: `💡 Decision Agreed`, `⚠️ Blocker / Risk`, and `📌 Important Note`.
   * Bookmarks are saved in the meeting record and rendered with interactive audio seek buttons in the executive summary.

3. **🌐 Multilingual Whisper Language Selector (`src/views/RecordingView.tsx`, `src/types/meeting.ts`):**
   * Added speech language selection (English, Multilingual Auto, Spanish, French, German, Japanese, Hindi, Tamil) for global teams.

4. **📱 Offline PWA Desktop Manifest (`public/manifest.json`, `index.html`):**
   * Full Progressive Web App manifest configuring standalone desktop installation for Chrome, Edge, and Safari on macOS/Windows/Linux.
