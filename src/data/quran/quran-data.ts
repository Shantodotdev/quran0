import chaptersPayload from '../../../resources/qul-chapters-bn.json'
import indopakPayload from '../../../resources/digital-khatt-indopak-ayah-by-ayah-script.json'
import transliterationPayload from '../../../resources/english-transliteration-tajweed.json'
import translationPayload from '../../../resources/bn-taisirul-quran-simple.json'
import { getSurahLearningMeta } from './surah-learning-order'
import type { QuranSurah, QuranVerse, VerseKey } from './types'

type RawChapter = {
  id: number
  bismillah_pre: boolean
  revelation_order: number
  revelation_place: string
  name_complex: string
  name_arabic: string
  name_simple: string
  verses_count: number
  pages: Array<number>
  translated_name: {
    language_name: string
    name: string
  }
}

type RawChaptersPayload = {
  chapters: Array<RawChapter>
}

type RawArabicVerse = {
  id: number
  verse_key: VerseKey
  surah: number
  ayah: number
  text: string
}

type RawTranslationVerse = {
  t: string
}

const rawChapters = chaptersPayload as RawChaptersPayload
const rawArabicByKey = indopakPayload as Record<VerseKey, RawArabicVerse>
const rawTransliterationByKey = transliterationPayload as Partial<
  Record<VerseKey, string>
>
const rawTranslationByKey = translationPayload as Partial<
  Record<VerseKey, RawTranslationVerse>
>

/**
 * QUL source contract:
 * - chapter metadata comes from /api/v1/chapters?locale=bn
 * - Arabic script is Digital Khatt IndoPak ayah-by-ayah JSON
 * - English pronunciation comes from QUL English Transliteration(Tajweed)
 * - Bengali translation is Taisirul Quran simple JSON
 * All verse joins use the canonical "surah:ayah" key, for example "87:3".
 */
const surahs: Array<QuranSurah> = rawChapters.chapters.map((chapter) => {
  const learningMeta = getSurahLearningMeta(chapter.id)
  const pages = chapter.pages
  const revelationPlace = chapter.revelation_place

  if (pages.length !== 2) {
    throw new Error(`Invalid page range for surah ${chapter.id}`)
  }

  if (revelationPlace !== 'makkah' && revelationPlace !== 'madinah') {
    throw new Error(`Invalid revelation place for surah ${chapter.id}`)
  }

  return {
    id: chapter.id,
    nameArabic: chapter.name_arabic,
    nameSimple: chapter.name_simple,
    nameComplex: chapter.name_complex,
    translatedNameBn: chapter.translated_name.name,
    learningRank: learningMeta.rank,
    learningTier: learningMeta.tier,
    revelationPlace,
    revelationOrder: chapter.revelation_order,
    versesCount: chapter.verses_count,
    pages: [pages[0], pages[1]],
    bismillahPre: chapter.bismillah_pre,
  }
})

const verses: Array<QuranVerse> = Object.entries(rawArabicByKey).map(
  ([verseKey, arabicVerse]) => {
    const transliteration = rawTransliterationByKey[verseKey as VerseKey]
    const translation = rawTranslationByKey[verseKey as VerseKey]

    if (!transliteration) {
      throw new Error(`Missing English transliteration for verse ${verseKey}`)
    }

    if (!translation) {
      throw new Error(`Missing Bengali translation for verse ${verseKey}`)
    }

    return {
      id: arabicVerse.id,
      verseKey: verseKey as VerseKey,
      surahNumber: arabicVerse.surah,
      ayahNumber: arabicVerse.ayah,
      arabicIndopak: arabicVerse.text,
      transliterationEn: transliteration,
      translationBnTaisirul: translation.t,
    }
  },
)

const surahsById = new Map(surahs.map((surah) => [surah.id, surah]))
const versesBySurah = new Map<number, Array<QuranVerse>>()

for (const verse of verses) {
  const existingVerses = versesBySurah.get(verse.surahNumber) ?? []
  existingVerses.push(verse)
  versesBySurah.set(verse.surahNumber, existingVerses)
}

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

export function getVersesBySurah(surahId: number) {
  return versesBySurah.get(surahId) ?? []
}

export function getQuranSummary() {
  return {
    surahCount: surahs.length,
    verseCount: verses.length,
  }
}
