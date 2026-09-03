# 07 — Landing Page & Master PIN Vault Authentication System

**Date:** 2026-09-03  
**Status:** Completed  

---

## 🌟 Features Implemented

1. **✨ Monochromatic White Landing Page (`src/views/LandingView.tsx`):**
   * Minimalist hero section showcasing on-device AI benefits.
   * Product Comparison Matrix (Traditional Cloud Notetakers vs. Meeting Ghost).
   * Feature showcases: Live Speech Stream, Meeting Templates, Audio Sync Playback, Calendar Export, Inactivity Auto-Lock, and Follow-up Drafter.
   * Call to action buttons for "Launch App", "Setup Encrypted Vault", and "Unlock Vault".

2. **🔐 On-Device Master PIN Authentication (`src/services/auth.ts`, `src/views/AuthView.tsx`):**
   * **Sign Up / Set Master PIN:** Allows the user to configure a secure Master PIN (min 4 characters) to derive an AES-GCM-256 key via PBKDF2 with 100,000 iterations.
   * **Log In / Unlock Vault:** Salted PBKDF2 verification against stored profile hash with rate limiting & brute-force lockout defense (5 attempts $\to$ 30s lockout).
   * **Default Demo PIN:** Supports `0000` for instant evaluation if no custom vault has been initialized.

3. **🔄 Multi-Tier App Routing (`src/App.tsx`):**
   * Smooth navigation between `'landing'`, `'auth'`, and `'app'` views.
   * Direct vault lock from top navigation header.
   * Comprehensive unit tests in `src/services/auth.test.ts`.
