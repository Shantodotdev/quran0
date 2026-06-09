import surahsPayload from './generated/surahs.json'
import type { QuranSurah, QuranVerse } from './types'

const surahs = surahsPayload as Array<QuranSurah>
const surahsById = new Map(surahs.map((surah) => [surah.id, surah]))
const verseChunkLoaders = import.meta.glob<Array<QuranVerse>>(
  './generated/surahs/*.json',
  {
    import: 'default',
  },
) as Partial<Record<string, () => Promise<Array<QuranVerse>>>>

/**
 * Runtime data contract:
 * - `generated/surahs.json` is small metadata used by the Quran index.
 * - `generated/surahs/001.json` through `114.json` are lazy-loaded verse chunks.
 * - Generated files come from `resources/*` via `scripts/generate-quran-data.mjs`.
 */
export function getAllSurahs() {
  return surahs
}

export function getSurahsByLearningOrder(direction: 'asc' | 'desc') {
  return [...surahs].sort((a, b) =>
    direction === 'asc'
      ? a.learningRank - b.learningRank
      : b.learningRank - a.learningRank,
  )
}

export function getSurahById(surahId: number) {
  return surahsById.get(surahId)
}

export async function getVersesBySurah(surahId: number) {
  const fileName = String(surahId).padStart(3, '0')
  const loadVerseChunk = verseChunkLoaders[`./generated/surahs/${fileName}.json`]

  if (!loadVerseChunk) {
    throw new Error(`Missing verse chunk for surah ${surahId}`)
  }

  return loadVerseChunk()
}
