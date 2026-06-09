export type VerseKey = `${number}:${number}`

export type QuranVerse = {
  verseKey: VerseKey
  arabicIndopak: string
  transliterationEn: string
  translationBnTaisirul: string
}

export type QuranSurah = {
  id: number
  nameArabic: string
  nameSimple: string
  banglaName: string
  translatedNameBn: string
  learningRank: number
  learningTier: SurahLearningTier
  versesCount: number
}

export type SurahLearningTier =
  | 'Beginner'
  | 'Easy-medium'
  | 'Medium-hard'
  | 'Hardest'
