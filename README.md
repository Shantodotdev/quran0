# Quran0

Quran0 is a mobile-first Quran reader built with TanStack Start. The current
version focuses on a simple, readable Quran experience using local Quran
resource files, with no backend, authentication, or database.

The app currently includes:

- A dark mobile-first Quran index page.
- Surah sorting by Quran order, easiest-to-hardest, or hardest-to-easiest.
- Optional grouping by learning tier.
- A dynamic surah reader route.
- IndoPak Arabic Quran text.
- English transliteration.
- Bengali Taisirul Quran translation.
- Bengali-localized surah metadata.
- A basic Progress page placeholder.
- A sticky bottom mobile navigation bar.
- Installable PWA support on compatible browsers.
- Offline access to the current app pages and all 114 surahs after installation.

## Project Status

This is an early Quran reader implementation. The data foundation and first UI
pass are in place, but progress tracking, audio, tafsir, and
word-by-word features have not been added yet.

Planned-but-not-current features:

- Reading progress storage.
- Audio playback.
- Tafsir.
- Word-by-word display.
- More reader settings.

## Tech Stack

| Layer           | Technology                         |
| --------------- | ---------------------------------- |
| Framework       | TanStack Start                     |
| Router          | TanStack Router file-based routing |
| UI runtime      | React 19                           |
| Language        | TypeScript                         |
| Styling         | Tailwind CSS 4                     |
| Icons           | Lucide React                       |
| Build tool      | Vite                               |
| Package manager | npm                                |

Path aliases:

- `#/*` maps to `src/*`.
- `@/*` maps to `src/*`.

## Quran Data

Quran0 uses local source resource files stored in `resources/`. These files are
downloaded manually, then converted into smaller app-ready JSON files with:

```bash
npm run generate-quran-data
```

The generated files live in `src/data/quran/generated/`. The Quran index imports
only compact surah metadata, while each reader page lazy-loads one surah verse
chunk at a time.

### Resource Files

| File                                                       | Purpose                                                       |
| ---------------------------------------------------------- | ------------------------------------------------------------- |
| `resources/digital-khatt-indopak-ayah-by-ayah-script.json` | IndoPak Arabic Quran text, ayah by ayah                       |
| `resources/DigitalKhattIndoPak.otf`                        | Matching Digital Khatt IndoPak Quran font                     |
| `resources/bn-taisirul-quran-simple.json`                  | Bengali Taisirul Quran translation                            |
| `resources/english-transliteration-tajweed.json`           | English transliteration with tajweed-style pronunciation text |
| `resources/qul-chapters-bn.json`                           | Surah/chapter metadata with Bengali localized names           |
| `resources/pdms-saleem-quranfont.ttf`                      | Previously tested IndoPak font; currently not used            |

### Data Sources

The Quran content files come from QUL, the Quranic Universal Library by Tarteel
AI:

- QUL resources: <https://qul.tarteel.ai/resources>
- QUL Quran script resources: <https://qul.tarteel.ai/resources/quran-script>
- QUL transliteration resources:
  <https://qul.tarteel.ai/resources/transliteration>
- QUL chapter API used for metadata:
  <https://qul.tarteel.ai/api/v1/chapters?locale=bn>

The current reader data is joined by the canonical verse key format:

```text
surah:ayah
```

Examples:

```text
1:1
10:1
87:5
114:6
```

All three verse-level files currently contain 6,236 entries and use the same
verse keys:

- Arabic IndoPak text
- English transliteration
- Bengali Taisirul translation

The app keeps the downloaded source files unchanged. Runtime data is read from:

```text
src/data/quran/generated/surahs.json
src/data/quran/generated/surahs/001.json
src/data/quran/generated/surahs/002.json
...
src/data/quran/generated/surahs/114.json
```

### Learning Order

The easiest-to-hardest sorting order comes from the user's Notion page named
`Quran Table`.

That mapping is applied during data generation in:

```text
scripts/generate-quran-data.mjs
```

This keeps the runtime data compact while preserving the user's learning order
inside the generated surah metadata.

## Repository Structure

```text
resources/
  Quran JSON files and fonts used by the app

src/components/
  Shared UI components, including the bottom navigation

src/data/quran/
  Typed Quran data access and generated Quran chunks

scripts/generate-quran-data.mjs
  Builds optimized app-ready Quran JSON from the raw resources

src/routes/
  TanStack Router file-based routes

src/routes/__root.tsx
  Root HTML shell, global dark app layout, and bottom navigation

src/routes/index.tsx
  Quran index page

src/routes/surah.$surahId.tsx
  Dynamic surah reader page

src/routes/progress.tsx
  Progress placeholder page

src/styles.css
  Global Tailwind import, theme tokens, and Quran font face
```

## Routes

| Route             | Purpose                                    |
| ----------------- | ------------------------------------------ |
| `/`               | Quran index page with sorting and grouping |
| `/surah/$surahId` | Dynamic surah reader page                  |
| `/progress`       | Progress page placeholder                  |

## Local Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The dev server runs on:

```text
http://localhost:3000
```

## Scripts

| Command                   | Purpose                                   |
| ------------------------- | ----------------------------------------- |
| `npm run dev`             | Start the local development server        |
| `npm run generate-quran-data` | Regenerate optimized Quran data chunks |
| `npm run generate-routes` | Regenerate the TanStack Router route tree |
| `npm run lint`            | Run ESLint                                |
| `npm run test`            | Run Vitest                                |
| `npm run build`           | Create a production build                 |
| `npm run preview`         | Preview the production build              |
| `npm run format`          | Run Prettier and ESLint fixes             |
| `npm run check`           | Check Prettier formatting                 |

## Important Implementation Notes

- The app currently has no backend.
- The app currently has no authentication.
- The app currently has no database.
- The app currently does not store reading progress.
- TanStack Start prerenders the current pages, and the production build uses
  a Nitro lifecycle hook plus Workbox to precache the complete public output
  before local preview or Vercel packaging.
- `src/routeTree.gen.ts` is generated by TanStack Router and should not be
  edited manually.
- The Quran font and Quran script must stay matched. The current Arabic text
  uses Digital Khatt IndoPak data and the matching Digital Khatt IndoPak font.

## Data Performance

The raw Quran files are not imported directly into the main app bundle. The
generator creates:

- one compact `surahs.json` metadata file for the Quran index
- 114 lazy verse chunks, one per surah

This keeps the initial Quran index bundle smaller and loads full verse content
only when a specific surah page is opened.

The current `resources/` directory is acceptable for this stage. If the resource
folder grows, a clearer structure may be introduced:

```text
resources/
  qul/
    raw/
    processed/
  fonts/
```

For now, the files remain where they are to avoid unnecessary churn.
