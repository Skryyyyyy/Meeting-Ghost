# 11 — In-Memory Non-Extractable CryptoKey, Spoken Anti-Injection & Lifecycle Hardening

**Date:** 2026-09-04  
**Status:** Completed  

---

## 🔒 Security Hardening Implementations

1. **🔐 In-Memory Non-Extractable `CryptoKey` Objects (`src/services/crypto.ts`, `src/services/storage.ts`):**
   * Eliminated storing raw Master PIN strings in `sessionStorage`.
   * Replaced static fallback passphrases with active in-memory `CryptoKey` handles that cannot be inspected by DevTools or extracted from disk.
   * `lockVault()` immediately clears in-memory keys and purges decrypted meeting states.

2. **🛡️ Spoken Anti-Prompt Injection Defenses (`src/services/aiPipeline.ts`):**
   * Implemented strict system security protocols and neutralized XML escape sequences (`</transcript>`, `<system>`).
   * Explicitly instructs the LLM that content inside `<transcript>` is untrusted audio data and prohibits instruction execution.

3. **⏱️ Tamper-Resistant In-Memory Rate Limiting (`src/services/auth.ts`):**
   * PIN verification lockouts and attempt counters are tracked in memory to prevent bypasses via `localStorage.clear()`.

4. **🚫 Instant Microphone Hardware Teardown (`src/services/audio.ts`, `src/App.tsx`):**
   * Added synchronous `stopSynchronously()` tied to `beforeunload` and `pagehide` events, eliminating microphone zombie states on browser tab close.
