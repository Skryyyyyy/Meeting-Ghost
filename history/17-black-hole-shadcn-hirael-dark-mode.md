# 17 — Black Hole Component Integration, Shadcn Structure & Hirael Dark Mode Theme

**Date:** 2026-09-04  
**Status:** Completed  

---

## 🕳️ Black Hole Component & Shadcn Integration

1. **📁 Shadcn Architecture & Path Aliases:**
   * Configured `tsconfig.json` path aliases (`@/*` -> `./src/*`).
   * Configured Vite resolver alias in `vite.config.ts`.
   * Standardized component placement in `src/components/ui/` with dedicated utilities under `src/components/ui/black-hole-utils/`.

2. **🌌 Relativistic Black Hole WebGL Shader (`src/components/ui/black-hole.tsx` & `src/components/ui/black-hole-utils/renderer.ts`):**
   * High-performance WebGL fragment shader simulating Schwarzschild gravitational ray deflection (gravitational lensing).
   * Rotating Keplerian accretion disk with Doppler beaming (blueshifted approaching side, redshifted receding side) and turbulent noise.
   * Photon ring incandescent ring around event horizon shadow with smooth mouse tracking deflection.
   * Graceful 2D canvas fallback for legacy devices without WebGL.
   * Demo component created at `src/components/ui/black-hole-demo.tsx`.

3. **✨ Hirael Portfolio Dark Mode Landing Page (`src/views/LandingView.tsx`):**
   * Inspired by Mohammad Shehadeh's Hirael Dark Theme from 21st.dev.
   * Floating glass navigation pill with live theme toggle (Obsidian Dark vs. Pristine Light mode).
   * Embedded relativistic black hole canvas backdrop with radial vignette and bottom gradient fade.
   * Bento grid showcase cards with subtle borders (`border-white/10` in dark mode) and glowing hover effects.
   * 4-metric statistics summary bar and Unsplash avatar social proof integration.

---

## 🧪 Verification & Build Status

* **Unit & Integration Tests:** 18 / 18 passing (`vitest`).
* **Production Compilation:** Clean `tsc && vite build` bundle output.
