import type { SurahLearningTier } from './types'

const EASY_TO_HARD_SURAH_IDS = [
  1, 112, 108, 114, 113, 103, 106, 110, 105, 111, 109, 107, 97, 94, 102, 95,
  99, 104, 101, 93, 100, 91, 86, 87, 96, 92, 82, 90, 98, 88, 85, 84, 81, 89,
  80, 83, 75, 77, 78, 62, 73, 63, 79, 71, 76, 70, 61, 64, 72, 69, 66, 74, 68,
  55, 52, 67, 54, 65, 32, 50, 44, 49, 51, 53, 60, 59, 56, 45, 58, 47, 31, 48,
  57, 46, 15, 36, 38, 41, 35, 30, 14, 43, 13, 42, 34, 25, 29, 19, 37, 23, 27,
  39, 21, 40, 8, 22, 33, 24, 20, 28, 26, 17, 18, 12, 10, 16, 11, 9, 5, 6, 7, 3,
  4, 2,
]

const tierByRank = [
  { maxRank: 25, tier: 'Beginner' },
  { maxRank: 55, tier: 'Easy-medium' },
  { maxRank: 85, tier: 'Medium-hard' },
  { maxRank: 114, tier: 'Hardest' },
] satisfies Array<{ maxRank: number; tier: SurahLearningTier }>

const rankBySurahId = new Map(
  EASY_TO_HARD_SURAH_IDS.map((surahId, index) => [surahId, index + 1]),
)

/**
 * User learning order from the Notion page "Quran Table", fetched 2026-06-09.
 * Ranks are easiest-to-hardest and tiers come from that same table.
 */
export function getSurahLearningMeta(surahId: number) {
  const rank = rankBySurahId.get(surahId)

  if (!rank) {
    throw new Error(`Missing learning rank for surah ${surahId}`)
  }

  const tier = tierByRank.find((item) => rank <= item.maxRank)?.tier

  if (!tier) {
    throw new Error(`Missing learning tier for surah ${surahId}`)
  }

  return {
    rank,
    tier,
  }
}
