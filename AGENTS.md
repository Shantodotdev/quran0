# AGENTS.md

Project-wide rules and implementation context for AI agents working in this
repository.

---

## Project Overview

This repository contains **Quran0**, a Quran website built with TanStack Start.
The project is currently a clean starter, and the Quran reader will be built
step by step.

Current product direction:

- Mobile-first Quran reading web app.
- Quran content should come from external Quran APIs.
- No backend, authentication, or database unless the user explicitly changes
  that direction.
- User reading progress and PWA/offline support are planned for later, but they
  should not be added until the user asks for that step.

---

## Repository Structure

| Path                    | Purpose                                                   |
| ----------------------- | --------------------------------------------------------- |
| `src/routes`            | TanStack Router file-based routes                         |
| `src/routes/__root.tsx` | Root HTML shell, metadata, styles, scripts, devtools      |
| `src/routes/index.tsx`  | Current home page starter screen                          |
| `src/router.tsx`        | Router creation and TanStack Router registration          |
| `src/routeTree.gen.ts`  | Generated route tree; do not edit manually                |
| `src/styles.css`        | Global Tailwind import and base styles                    |
| `public`                | Static assets from the starter template                   |
| `vite.config.ts`        | Vite, TanStack Start, React, Tailwind, and devtools setup |
| `tsr.config.json`       | TanStack Router CLI config                                |

---

## Things You Must Never Do Autonomously

1. Do not add a backend, authentication, database, or server persistence unless the user explicitly asks.
2. Do not add PWA, service worker, offline caching, or local progress storage until the user asks for that step.
3. Do not run `npm run build`, `npm run format`, `npm run dev`, or production preview commands unless the user explicitly asks.
4. Do not start the dev server unless the user explicitly asks.
5. Do not run git commands unless the user explicitly asks.
6. Do not edit `src/routeTree.gen.ts` manually. Generate routes with the TanStack Router tooling when needed.
7. Do not install packages automatically for small additions. Write the code, then tell the user which package is needed and the install command.
8. Do not assume Quran API shape, translation source, tafsir source, audio source, or offline strategy without checking the real API/docs first.

---

## Code Documentation

- Add doc comments for exported components, helpers, hooks, and utilities when
  their purpose is not obvious from the name.
- Use short inline comments before important logic blocks, especially API
  normalization, offline caching, local-storage migrations, and Quran reference
  parsing.
- Keep comments practical. Explain why the code exists or what edge case it
  handles, not what each syntax line does.
- When adding Quran-specific logic, document the source contract clearly:
  provider, endpoint shape, verse/surah numbering assumptions, and fallback
  behavior.

---

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | TanStack Start                     |
| Router          | TanStack Router file-based routing |
| UI runtime      | React 19                           |
| Language        | TypeScript                         |
| Styling         | Tailwind CSS 4 via Vite plugin     |
| Build tool      | Vite                               |
| Icons           | Lucide React                       |
| Testing         | Vitest is installed by the starter |
| Package manager | npm                                |

Path aliases are configured in `package.json` and `tsconfig.json`:

- `#/*` maps to `src/*`.

---

## Implementation Expectations

- Keep changes small and step-by-step. This project is intentionally early.
- Prefer mobile-first layout decisions.
- Keep the first implementation simple before adding reader complexity.
- Use TanStack Router conventions for new routes.
- Keep reusable UI in `src/components` only when reuse actually exists.
- Keep Quran API clients and normalization helpers separate from route UI when
  those features are added.
- Use strict TypeScript types and avoid `any`.
- Before answering implementation questions, inspect the actual files in this
  repo instead of relying on memory or assumptions.

---

## Scripts and Verification

The root `package.json` defines:

| Command                   | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Start the Vite development server        |
| `npm run generate-routes` | Generate TanStack Router route tree      |
| `npm run lint`            | Run ESLint                               |
| `npm run test`            | Run Vitest                               |
| `npm run build`           | Create a production build; ask first     |
| `npm run format`          | Run Prettier and ESLint fixes; ask first |
| `npm run check`           | Check Prettier formatting; ask first     |

Default verification rule:

- For normal code changes, run `npm run lint` only.
- Do not run build, format, check, preview, or dev server commands unless the
  user explicitly asks.

When providing shell commands to the user, use standard npm/npx forms:

- Use `npm run lint`, not `npm.cmd run lint`.
- Use `npx <command>`, not `npx.cmd <command>`.

---

## Documentation Notes

- Keep this file updated when the project gains real routes, API clients,
  reader state, PWA/offline support, or major architecture decisions.
- Treat `README.md` as the short public-facing project intro.
- Treat this file as the working guide for future AI agents.
