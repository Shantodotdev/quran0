# Quran0

Quran0 is a mobile-first Quran reader web application built with **TanStack Start**, designed for offline readability and learning order progression.

---

## Technical & Architecture Documentation

Detailed documentation on data generation, API integration, audio playback, theming, and offline features can be found in the **[docs/](file:///docs/README.md)** directory:

- 📊 **[Data Architecture & Processing](file:///docs/data.md)**: Resource structure, pre-compilation script, and dynamic verse chunk lazy-loading.
- 🌐 **[External API & CDN Integration](file:///docs/api.md)**: Recitation API contract, audio timing segments, and Islamic Network CDN fallback behavior.
- 🎵 **[Audio Playback Engine](file:///docs/audio.md)**: Zustand audio store, race-condition prevention, click-to-seek, and system Media Session synchronization.
- 📱 **[PWA & Offline Strategy](file:///docs/pwa-offline.md)**: Manifest configuration, Workbox service worker caching scopes, and device-specific install prompts.
- ⚙️ **[Framework & Architecture](file:///docs/architecture.md)**: SSR/SPA rendering structure, route swiping navigation, themes system, and font resizing engine.

---

## Tech Stack

| Layer                | Technology                             |
| :------------------- | :------------------------------------- |
| **Framework**        | TanStack Start (React 19, Vite, Nitro) |
| **Router**           | TanStack Router (File-based Routing)   |
| **Styling**          | Tailwind CSS 4                         |
| **State Management** | Zustand                                |
| **Icons**            | Lucide React                           |

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Generate Quran Datasets

Generates optimized metadata and splits the raw datasets into lazy-loaded surah chunks:

```bash
node scripts/generate-quran-data.mjs
```

### 3. Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`.

---

## Common Scripts

| Command                   | Purpose                                                |
| :------------------------ | :----------------------------------------------------- |
| `npm run dev`             | Starts the local development server                    |
| `npm run build`           | Builds the static pages and compiles production assets |
| `npm run lint`            | Runs ESLint validation                                 |
| `npm run test`            | Runs the Vitest test suites                            |
| `npm run generate-routes` | Regenerates the TanStack Router route tree             |
