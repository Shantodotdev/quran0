export type VerseKey = `${number}:${number}`

export type QuranVerse = {
  id: number
  verseKey: VerseKey
  surahNumber: number
  ayahNumber: number
  arabicIndopak: string
  transliterationEn: string
  translationBnTaisirul: string
}

export type QuranSurah = {
  id: number
  nameArabic: string
  nameSimple: string
  nameComplex: string
  translatedNameBn: string
  learningRank: number
  learningTier: SurahLearningTier
  revelationPlace: 'makkah' | 'madinah'
  revelationOrder: number
  versesCount: number
  pages: [number, number]
  bismillahPre: boolean
}

export type SurahLearningTier =
  | 'Beginner'
  | 'Easy-medium'
  | 'Medium-hard'
  | 'Hardest'
