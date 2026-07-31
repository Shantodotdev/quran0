import { describe, expect, it } from 'vitest'

import {
  getAllSurahs,
  getSurahById,
  getSurahsByLearningOrder,
  getVersesBySurah,
} from './quran-data'

describe('Quran data access', () => {
  it('exposes metadata for all 114 surahs', () => {
    const surahs = getAllSurahs()

    expect(surahs).toHaveLength(114)
    expect(getSurahById(1)).toMatchObject({
      id: 1,
      nameSimple: 'Al-Fatihah',
      versesCount: 7,
    })
    expect(getSurahById(114)?.nameSimple).toBe('An-Nas')
    expect(getSurahById(0)).toBeUndefined()
  })

  it('returns surahs ordered by learning rank without mutating metadata', () => {
    const original = getAllSurahs()
    const ascending = getSurahsByLearningOrder('asc')
    const descending = getSurahsByLearningOrder('desc')

    expect(ascending).not.toBe(original)
    expect(ascending[0]?.learningRank).toBe(1)
    expect(ascending.at(-1)?.learningRank).toBe(114)
    expect(descending[0]?.learningRank).toBe(114)
    expect(descending.at(-1)?.learningRank).toBe(1)
    expect(original[0]?.id).toBe(1)
  })

  it('loads the requested surah verse chunk', async () => {
    const verses = await getVersesBySurah(1)

    expect(verses).toHaveLength(7)
    expect(verses[0]).toMatchObject({
      verseKey: '1:1',
      transliterationEn: 'Bismil laahir Rahmaanir Raheem',
    })
  })
})
