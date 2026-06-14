/**
 * Represents a single Quranic verse recommendation for a feeling.
 */
export interface MotivationQuote {
  /** The 1-based index ID of the Surah (1 to 114) */
  surahId: number
  /** The 1-based index ID of the Ayah within the Surah */
  verseNumber: number
  /** Brief context explanation in English explaining why this verse is relevant */
  contextEn: string
}

/**
 * Details of an emotional category.
 */
export interface FeelingDetail {
  /** Uniquely identifies the emotion (e.g. 'sad', 'anxious') */
  id: string
  /** Visual emoji representing the emotion */
  emoji: string
  /** Human-readable name of the emotion in English */
  nameEn: string
  /** Accent color token identifier for theme synchronization */
  accentColor: string
  /** CSS classes applied to active themed selectors */
  bgClass: string
  /** CSS classes applied to border states of active selectors */
  borderClass: string
  /** CSS color class applied to text states of active components */
  textClass: string
  /** List of curated verse recommendations mapped to this feeling */
  quotes: MotivationQuote[]
}

/**
 * Curated list of emotional states and corresponding Quranic verse references.
 * Contains 44 comfort and guidance verses selected from verified traditional sources.
 */
export const FEELINGS_DATA: FeelingDetail[] = [
  {
    id: 'sad',
    emoji: '😢',
    nameEn: 'Sad / Grieving',
    accentColor: 'blue',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/15 text-blue-600 dark:text-blue-400',
    borderClass: 'border-blue-500/20',
    textClass: 'text-blue-600 dark:text-blue-400',
    quotes: [
      {
        surahId: 93,
        verseNumber: 3,
        contextEn: 'When you feel abandoned, forgotten, or lonely'
      },
      {
        surahId: 12,
        verseNumber: 86,
        contextEn: 'When your heart is heavy with grief and sorrow'
      },
      {
        surahId: 3,
        verseNumber: 139,
        contextEn: 'When you feel weak, defeated, or lose hope'
      },
      {
        surahId: 94,
        verseNumber: 5,
        contextEn: 'When you are going through hard times and need hope'
      },
      {
        surahId: 10,
        verseNumber: 65,
        contextEn: 'When others speak unkindly and you feel down'
      },
      {
        surahId: 2,
        verseNumber: 156,
        contextEn: 'When you experience a sudden loss or tragedy'
      }
    ]
  },
  {
    id: 'anxious',
    emoji: '😰',
    nameEn: 'Anxious / Worried',
    accentColor: 'purple',
    bgClass: 'bg-purple-500/10 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400',
    borderClass: 'border-purple-500/20',
    textClass: 'text-purple-600 dark:text-purple-400',
    quotes: [
      {
        surahId: 13,
        verseNumber: 28,
        contextEn: 'When your mind is racing and you need inner peace'
      },
      {
        surahId: 2,
        verseNumber: 286,
        contextEn: 'When you feel overwhelmed by responsibilities or stress'
      },
      {
        surahId: 65,
        verseNumber: 3,
        contextEn: 'When you worry about your future or provisions'
      },
      {
        surahId: 9,
        verseNumber: 40,
        contextEn: 'When you are in distress and need reassurance'
      },
      {
        surahId: 9,
        verseNumber: 51,
        contextEn: 'When you worry about bad things happening to you'
      },
      {
        surahId: 3,
        verseNumber: 173,
        contextEn: 'When you feel overwhelmed by threats or circumstances'
      }
    ]
  },
  {
    id: 'scared',
    emoji: '😨',
    nameEn: 'Scared / Frightened',
    accentColor: 'indigo',
    bgClass: 'bg-indigo-500/10 hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    borderClass: 'border-indigo-500/20',
    textClass: 'text-indigo-600 dark:text-indigo-400',
    quotes: [
      {
        surahId: 20,
        verseNumber: 46,
        contextEn: 'When facing a daunting challenge or scary situation'
      },
      {
        surahId: 10,
        verseNumber: 62,
        contextEn: 'When you feel insecure and want protection'
      },
      {
        surahId: 2,
        verseNumber: 155,
        contextEn: 'When facing fear, hunger, or loss of resources'
      },
      {
        surahId: 106,
        verseNumber: 4,
        contextEn: 'When you seek physical safety and security'
      },
      {
        surahId: 33,
        verseNumber: 3,
        contextEn: 'When you need courage to do the right thing'
      }
    ]
  },
  {
    id: 'angry',
    emoji: '😠',
    nameEn: 'Angry / Irritated',
    accentColor: 'red',
    bgClass: 'bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400',
    borderClass: 'border-red-500/20',
    textClass: 'text-red-600 dark:text-red-400',
    quotes: [
      {
        surahId: 3,
        verseNumber: 134,
        contextEn: 'When you struggle to control your temper'
      },
      {
        surahId: 42,
        verseNumber: 37,
        contextEn: 'When you want to react harshly but choose patience'
      },
      {
        surahId: 41,
        verseNumber: 36,
        contextEn: 'When you feel an urge to burst out in anger'
      },
      {
        surahId: 7,
        verseNumber: 199,
        contextEn: 'When dealing with ignorant or rude behavior'
      },
      {
        surahId: 25,
        verseNumber: 63,
        contextEn: 'When you want to maintain peace and dignity'
      }
    ]
  },
  {
    id: 'weak',
    emoji: '😫',
    nameEn: 'Weak / Overwhelmed',
    accentColor: 'amber',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-600 dark:text-amber-500',
    borderClass: 'border-amber-500/20',
    textClass: 'text-amber-600 dark:text-amber-500',
    quotes: [
      {
        surahId: 4,
        verseNumber: 28,
        contextEn: 'When you feel powerless and need to accept your human limits'
      },
      {
        surahId: 2,
        verseNumber: 153,
        contextEn: 'When you feel exhausted and need strength to keep going'
      },
      {
        surahId: 30,
        verseNumber: 54,
        contextEn: 'When you are aging or feeling physically/mentally depleted'
      },
      {
        surahId: 8,
        verseNumber: 66,
        contextEn: 'When your burdens feel too heavy to carry'
      },
      {
        surahId: 2,
        verseNumber: 186,
        contextEn: 'When you feel too weak to pray and need Allah to hear you'
      }
    ]
  },
  {
    id: 'lonely',
    emoji: '🥺',
    nameEn: 'Lonely / Abandoned',
    accentColor: 'neutral',
    bgClass: 'bg-neutral-500/10 hover:bg-neutral-500/15 text-neutral-600 dark:text-neutral-400',
    borderClass: 'border-neutral-500/20',
    textClass: 'text-neutral-600 dark:text-neutral-400',
    quotes: [
      {
        surahId: 50,
        verseNumber: 16,
        contextEn: 'When you feel completely isolated and alone'
      },
      {
        surahId: 2,
        verseNumber: 257,
        contextEn: 'When you need a guardian and friend in the dark'
      },
      {
        surahId: 3,
        verseNumber: 150,
        contextEn: 'When you feel like you have no support system'
      },
      {
        surahId: 2,
        verseNumber: 186,
        contextEn: 'When you think no one is listening to you'
      },
      {
        surahId: 9,
        verseNumber: 129,
        contextEn: 'When people walk away and you are left on your own'
      }
    ]
  },
  {
    id: 'guilty',
    emoji: '😔',
    nameEn: 'Guilty / Regretful',
    accentColor: 'teal',
    bgClass: 'bg-teal-500/10 hover:bg-teal-500/15 text-teal-600 dark:text-teal-400',
    borderClass: 'border-teal-500/20',
    textClass: 'text-teal-600 dark:text-teal-400',
    quotes: [
      {
        surahId: 39,
        verseNumber: 53,
        contextEn: 'When you feel you have sinned too much to be forgiven'
      },
      {
        surahId: 7,
        verseNumber: 23,
        contextEn: 'When you realize your mistake and want to seek forgiveness'
      },
      {
        surahId: 3,
        verseNumber: 135,
        contextEn: 'When you seek to turn over a new leaf after a sin'
      },
      {
        surahId: 11,
        verseNumber: 114,
        contextEn: 'When you want your good deeds to wash away mistakes'
      },
      {
        surahId: 20,
        verseNumber: 82,
        contextEn: 'When you want to start fresh with a clean slate'
      },
      {
        surahId: 2,
        verseNumber: 222,
        contextEn: "When you seek Allah's love through repentance"
      }
    ]
  },
  {
    id: 'happy',
    emoji: '😊',
    nameEn: 'Happy / Grateful',
    accentColor: 'emerald',
    bgClass: 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    borderClass: 'border-emerald-500/20',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    quotes: [
      {
        surahId: 14,
        verseNumber: 7,
        contextEn: 'When you want to thank Allah and receive more blessings'
      },
      {
        surahId: 2,
        verseNumber: 152,
        contextEn: 'When you feel blessed and want to remember your Creator'
      },
      {
        surahId: 10,
        verseNumber: 58,
        contextEn: 'When you rejoice in the mercy and guidance of Allah'
      },
      {
        surahId: 27,
        verseNumber: 19,
        contextEn: 'When you are overwhelmed by the favor of Allah on you'
      },
      {
        surahId: 31,
        verseNumber: 12,
        contextEn: 'When you want to use your wisdom to be grateful'
      },
      {
        surahId: 16,
        verseNumber: 18,
        contextEn: 'When you try to count your blessings'
      }
    ]
  }
]
