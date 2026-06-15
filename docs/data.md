# Data Architecture & Processing

This document explains the origin, structure, and loading strategies of the Quranic text, translations, and learning tier metadata in Quran0.

---

## 1. Source Resources

Before compilation, the application uses raw JSON datasets located in the root `resources/` directory. These datasets contain the core textual and translation data:

| File Name                                        | Purpose                        | Data Fields Included                           |
| :----------------------------------------------- | :----------------------------- | :--------------------------------------------- |
| `qul-chapters-bn.json`                           | Surah metadata & names         | Arabic/English names, verse count, page bounds |
| `digital-khatt-indopak-ayah-by-ayah-script.json` | Indo-Pak Arabic script         | Indo-Pak glyphs suited for South Asian readers |
| `english-transliteration-tajweed.json`           | English phonetic pronunciation | Transliteration mapping for ease of reading    |
| `bn-taisirul-quran-simple.json`                  | Bengali translation            | Standard _Taisirul Quran_ Bengali meanings     |

---

## 2. Compilation and Generation Script

To optimize loading speeds and reduce initial bundle sizes, raw datasets are processed at build time.

The generation is executed via the script:

```bash
node scripts/generate-quran-data.mjs
```

### Process Lifecycle

1. **Sort by Learning Order**: The script assigns each Surah a learning rank (1–114) defined in `learningOrder` (e.g., shorter and easier surahs like Al-Fatihah, Al-Ikhlas, and Al-Nas are listed first).
2. **Assign Tiers**: It categorizes each Surah into one of four learning difficulty tiers:
   - **Beginner**: Ranks 1 to 25
   - **Easy-medium**: Ranks 26 to 55
   - **Medium-hard**: Ranks 56 to 85
   - **Hardest**: Ranks 86 to 114
3. **Build the Index (`surahs.json`)**: Emits a lightweight index metadata payload at `src/data/quran/generated/surahs.json` containing only surah names, verse counts, and learning metadata.
4. **Generate Verse Chunks**: Splits the comprehensive Arabic, translation, and transliteration databases into 114 separate JSON files located at `src/data/quran/generated/surahs/{id}.json` (zero-padded, e.g., `001.json` to `114.json`).

---

## 3. Runtime Lazy Loading

Instead of loading the entire Quran dataset (several megabytes of text) into the client's memory upfront, Quran0 implements a lazy chunk-loading strategy.

### Code-splitting with Vite

The application utilizes Vite's `import.meta.glob` feature inside `src/data/quran/quran-data.ts` to dynamically resolve verse chunks:

```typescript
const verseChunkLoaders = import.meta.glob<Array<QuranVerse>>(
  './generated/surahs/*.json',
  {
    import: 'default',
  },
) as Partial<Record<string, () => Promise<Array<QuranVerse>>>>
```

### Data Loading Hook

When navigating to `/surah/$surahId`, the route loader calls `getVersesBySurah(surahId)`. It resolves the appropriate JSON loader and loads only the visited Surah's text on-demand:

```typescript
export async function getVersesBySurah(surahId: number) {
  const fileName = String(surahId).padStart(3, '0')
  const loadVerseChunk =
    verseChunkLoaders[`./generated/surahs/${fileName}.json`]

  if (!loadVerseChunk) {
    throw new Error(`Missing verse chunk for surah ${surahId}`)
  }

  return loadVerseChunk()
}
```

### Key Benefits

- **Optimized Initial Load**: Reduces the JS/data footprint of the home page to just a few kilobytes.
- **Granular Offline Caching**: The PWA service worker caches each dynamic `{id}.json` chunk individually as the user browse surahs, or precaches them during production build.
