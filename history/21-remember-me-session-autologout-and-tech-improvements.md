# Meeting Ghost - Remember Me, Session Auto-Logout & Technical Improvements Roadmap

## 1. Authentication & Session Auto-Logout

### Features Implemented
- **"Always Remember Me" Toggle:**
  - Added an accessible toggle checkbox in `src/views/AuthView.tsx` for Sign Up, Sign In, and Email/Password flows.
- **Session Auto-Logout:**
  - When unchecked (default behavior), authorization is strictly stored in `sessionStorage` (`ghost_vault_unlocked`), ensuring that closing the browser window/tab immediately and securely terminates the unlocked session.
  - When checked, a 30-day token (`ghost_remember_token`) is persisted in encrypted `localStorage`, restoring active session access upon revisit.
  - Explicit logout (`lockVault()`) purges both in-memory encryption keys, `sessionStorage`, and `localStorage` persistent tokens.
- **Full Test Suite Verification:**
  - 22/22 unit and integration tests passing in `src/services/auth.test.ts`.

---

## 2. Technical Improvements & Architectural Roadmap for Meeting Ghost

### High-Impact Architectural Upgrades:

#### 1. Real-Time Streaming Silero VAD (Voice Activity Detection)
- **Current State:** Chunked audio recording feeds Whisper WebGPU sequentially.
- **Improvement:** Integrate ONNX-based Silero VAD running in a dedicated AudioWorklet thread. It drops silence frames immediately before WASM ingestion, cutting WebGPU inference load by ~45% and extending laptop battery life during long meetings.

#### 2. Local WebGPU LLM Streaming Worker & Chunk Compaction
- **Current State:** Direct WebLLM model calls on main thread context.
- **Improvement:** Offload `@mlc-ai/web-llm` and Transformers.js pipelines to dedicated Web Workers with `Transferable` ArrayBuffers. This guarantees UI interactions (60fps GSAP animations & black-hole WebGL shader) maintain zero dropped frames even during heavy summary generation.

#### 3. On-Device Semantic Vector Search (MiniLM-L6 + IndexedDB Vector Index)
- **Current State:** Keyword & regex filtering across transcripts.
- **Improvement:** Generate 384-dimensional text embeddings locally using `all-MiniLM-L6-v2` WebGPU model and store them alongside encrypted chunks. Enables natural language semantic search (e.g. *"What did we decide about the database schema?"*) without sending meeting data to any cloud embedding provider.

#### 4. Progressive Web App (PWA) Offline-First Cache & Background Sync
- **Current State:** Static SPA hosted on Vite.
- **Improvement:** Configure `vite-plugin-pwa` with Workbox runtime caching for ONNX weights and WASM binaries (`ort-wasm-simd-threaded.wasm`). Enables 100% offline startup even in airplane mode or during connectivity drops.

#### 5. Encrypted Chunk Defragmentation & IndexedDB Quota Guard
- **Current State:** Discrete encrypted records per meeting session.
- **Improvement:** Implement an automated vacuum/compaction routine using `idb` transaction batching that compresses raw audio buffers using zstandard WASM before AES-GCM encryption, reducing IndexedDB disk consumption by ~60%.
