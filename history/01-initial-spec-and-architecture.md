# 01 — Project Inception, Specification & Architecture Design

**Date:** 2026-09-03  
**Status:** Completed  

---

## 📌 Context & Problem Statement

Cloud-based meeting assistants (Otter.ai, Fireflies.ai, Fathom) require streaming or uploading confidential voice recordings to external third-party cloud servers. This presents critical data compliance, legal, medical, HR, and privacy liabilities, as well as recurring API costs and internet connectivity dependencies.

Meeting Ghost was conceived as a **100% on-device, zero-network-leakage meeting recorder, transcriber, and AI summarizer**.

---

## 🏗️ Architecture Decisions

1. **Client Platform Selection:**
   * Selected In-Browser SPA with WebGPU/WASM acceleration using React 19, TypeScript, and Vite.
   * Runs directly inside the browser sandbox — zero installation required, zero external server endpoints.

2. **ASR (Speech-to-Text) Engine:**
   * `@huggingface/transformers` v3 Whisper (`onnx-community/whisper-tiny.en`).
   * WebGPU hardware acceleration with automatic CPU WASM fallback.

3. **Structured LLM Summarization:**
   * Structured JSON schema extraction for:
     * Executive Overview (3–5 sentences)
     * Key Discussion Points
     * Decisions Agreed Upon
     * Action Items with Assignee & Deadlines
     * Polished Follow-up Email Draft
   * Grammar/XML protection against prompt injection.

4. **Persistence:**
   * Client-side IndexedDB database (`idb`) for zero-telemetry local storage.

---

## 📦 Artifacts Generated
- Specification: `Meeting_Ghost_Full_Spec.md`
- Design Spec: `docs/superpowers/specs/2026-09-03-meeting-ghost-web-design.md`
- Implementation Plan: `docs/superpowers/plans/2026-09-03-meeting-ghost-web.md`
