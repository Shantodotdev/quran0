# Quran0 Developer & System Documentation

Welcome to the **Quran0** documentation folder. This directory contains detailed architectural specifications, data pipelines, API contracts, and implementation guides for developers and maintainers.

---

## Documentation Sections

Please refer to the specific files below for in-depth explanations:

1. **[Data Architecture & Processing](file:///docs/data.md)**
   - Source dataset descriptions (`resources/`)
   - Pre-compilation processing scripts (`scripts/generate-quran-data.mjs`)
   - Lazy chunk-loading strategy with dynamic import splitting

2. **[External API & Network Integration](file:///docs/api.md)**
   - Chapter recitations and verse timing segment endpoints
   - Timing synchronization formulas
   - Islamic Network CDN error fallbacks

3. **[Audio Playback & Synchronization Engine](file:///docs/audio.md)**
   - Zustand audio state store specification
   - HTML5 Audio play/pause asynchronous race condition handling
   - Click-to-seek verse syncing
   - OS Lock Screen & Hardware controls (Media Session API)

4. **[Progressive Web App (PWA) & Offline Strategy](file:///docs/pwa-offline.md)**
   - Web App manifest structure
   - Workbox compilation hook on Vite prerendering lifecycle
   - Precached assets inventory
   - Install prompt delay, dismissal storage, and native vs iOS configurations

5. **[Framework & Architecture](file:///docs/architecture.md)**
   - TanStack Start layout shell & Nitro static prerendering
   - File-based routing maps
   - Curated themes system & blocking flash-prevention script
   - Dynamic css properties for user font size adjustments
   - Swipe navigation details and initial reload safeguards

---

## Quick Reference Commands

From the root directory, you can run:

```bash
# Start Vite development server
npm run dev

# Generate TanStack Router route tree
npm run generate-routes

# Run ESLint validation
npm run lint

# Run Vitest test suites
npm run test

# Re-run data processor to build generated JSON surahs from resources
node scripts/generate-quran-data.mjs
```
