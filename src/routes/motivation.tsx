import { useState, useEffect, useRef } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Heart, Loader2 } from 'lucide-react'

import { FEELINGS_DATA } from '#/data/motivation-data'
import { getSurahById, getVersesBySurah } from '#/data/quran/quran-data'
import { useSettingsStore } from '#/stores/settings'
import type { QuranVerse } from '#/data/quran/types'

/**
 * Route definition for `/motivation`.
 * Displays feelings selection grid and corresponding comfort verses.
 */
export const Route = createFileRoute('/motivation')({
  component: MotivationPage,
  head: () => ({
    meta: [
      {
        title: 'Motivation - Quran0',
      },
      {
        name: 'description',
        content: 'Find comfort, reassurance, and inspiration from the Quran based on how you are currently feeling.',
      },
    ],
  }),
})

/**
 * Paired structure matching a curated recommendation quote with its resolved local verse details.
 */
interface PairedQuoteWithVerse {
  surahId: number
  verseNumber: number
  contextEn: string
  surahNameSimple: string
  surahNameBangla: string
  verse: QuranVerse
}

/**
 * MotivationPage Component.
 *
 * Prompts the user to choose their current emotional state, dynamically loads matching 
 * comforting verses from local JSON files, and renders clickable verse cards.
 */
function MotivationPage() {
  // Start with no emotion selected (null) to let the user choose first
  const [activeFeelingId, setActiveFeelingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [pairedQuotes, setPairedQuotes] = useState<PairedQuoteWithVerse[]>([])

  // Container reference to scroll to the quotes after selecting a feeling
  const quotesContainerRef = useRef<HTMLDivElement>(null)

  // Sync with global settings for dynamic font size and visibility formatting
  const arabicFontSize = useSettingsStore((s) => s.arabicFontSize)
  const englishFontSize = useSettingsStore((s) => s.englishFontSize)
  const bengaliFontSize = useSettingsStore((s) => s.bengaliFontSize)
  const displayEnglishSpelling = useSettingsStore((s) => s.displayEnglishSpelling)
  const displayBengaliMeaning = useSettingsStore((s) => s.displayBengaliMeaning)

  const activeFeeling = FEELINGS_DATA.find((f) => f.id === activeFeelingId)

  // Dynamically resolve verse details when the selected emotion changes
  useEffect(() => {
    if (!activeFeelingId || !activeFeeling) {
      setPairedQuotes([])
      return
    }

    let isMounted = true
    setLoading(true)

    async function loadQuotes() {
      try {
        // Fetch matching verses asynchronously from chunked local files
        const results = await Promise.all(
          activeFeeling!.quotes.map(async (quote) => {
            const verses = await getVersesBySurah(quote.surahId)
            const surah = getSurahById(quote.surahId)
            const verseKey = `${quote.surahId}:${quote.verseNumber}`
            const verse = verses.find((v) => v.verseKey === verseKey)
            
            return {
              ...quote,
              surahNameSimple: surah?.nameSimple || '',
              surahNameBangla: surah?.banglaName || '',
              verse: verse!,
            }
          })
        )

        if (isMounted) {
          // Keep only successfully matched verses
          setPairedQuotes(results)
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load verses for motivation:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadQuotes()

    return () => {
      isMounted = false
    }
  }, [activeFeelingId, activeFeeling])

  // Smooth scroll down to the quotes list container once loading completes
  useEffect(() => {
    if (!loading && pairedQuotes.length > 0 && activeFeelingId) {
      const timer = setTimeout(() => {
        quotesContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [loading, pairedQuotes.length, activeFeelingId])

  return (
    <div className="flex flex-col gap-6">
      {/* Banner / Header */}
      <header className="rounded-2xl border border-(--app-border) bg-(--app-surface) p-5 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 pointer-events-none">
          <Heart className="size-40 text-(--app-accent)" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-(--app-accent)">
          <Heart className="size-4.5 fill-current" />
          <span>Solace & Guidance</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-(--app-text-primary) sm:text-3xl">
          How are you feeling?
        </h1>
        <p className="mt-2 text-sm text-(--app-text-secondary) leading-relaxed max-w-lg">
          Choose an emotion to find comfort, reassurance, and guidance from the Quran.
        </p>
      </header>

      {/* Emotion Selector Grid */}
      <section className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {FEELINGS_DATA.map((feeling) => {
          const isActive = activeFeelingId === feeling.id
          return (
            <button
              key={feeling.id}
              type="button"
              onClick={() => setActiveFeelingId(feeling.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300 cursor-pointer select-none active:scale-95 ${
                isActive
                  ? `${feeling.bgClass} ${feeling.borderClass} ring-2 ring-current ring-offset-2 ring-offset-(--app-bg) scale-[1.02] shadow-sm`
                  : 'border-(--app-border) bg-(--app-surface) text-(--app-text-secondary) hover:text-(--app-text-primary) hover:bg-(--app-hover-bg) hover:scale-[1.01]'
              }`}
            >
              <span className="text-3xl mb-1.5 filter drop-shadow-sm">{feeling.emoji}</span>
              <span className="text-xs font-semibold tracking-wide">{feeling.nameEn}</span>
            </button>
          )
        })}
      </section>

      {/* Quotes Cards Container */}
      <section ref={quotesContainerRef} className="flex flex-col gap-4 scroll-mt-24">
        {!activeFeelingId ? (
          /* Empty state shown before any selection has been made */
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl border border-dashed border-(--app-border) bg-(--app-surface)/30 text-center py-16">
            <Heart className="size-8 text-(--app-text-muted) animate-pulse mb-3" />
            <p className="text-sm font-semibold text-(--app-text-secondary)">
              Choose how you are feeling above
            </p>
            <p className="text-xs text-(--app-text-muted) mt-1">
              Select an emotion to see comforting verses from the Quran.
            </p>
          </div>
        ) : loading ? (
          /* Visual loader shown during dynamic chunk retrieval */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Loader2 className={`size-8 animate-spin ${activeFeeling?.textClass || 'text-(--app-accent)'}`} />
            <p className="mt-3 text-sm text-(--app-text-tertiary) animate-pulse font-medium">
              Retrieving comforting verses…
            </p>
          </div>
        ) : (
          pairedQuotes.map((item, index) => (
            <Link
              key={`${item.surahId}-${item.verseNumber}-${index}`}
              to="/surah/$surahId"
              params={{ surahId: String(item.surahId) }}
              search={{ verse: item.verseNumber }}
              className="block border border-(--app-border) bg-(--app-surface) p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md hover:bg-(--app-hover-bg)/30 transition-all duration-200 text-left cursor-pointer"
            >
              {/* Context Description */}
              <div className="border-b border-(--app-border)/40 pb-3 mb-4">
                <p className="text-sm font-semibold text-(--app-text-primary) leading-snug">
                  {item.contextEn}
                </p>
              </div>

              {/* Quranic Verse content */}
              <div className="flex flex-col gap-4">
                <p
                  className="quran-arabic mt-1 text-right leading-relaxed text-(--app-text-primary)"
                  style={{ fontSize: `${arabicFontSize}px` }}
                  dir="rtl"
                  lang="ar"
                >
                  {item.verse.arabicIndopak}
                </p>
                
                {displayEnglishSpelling && (
                  <p
                    className="leading-7 text-(--app-text-secondary)"
                    style={{ fontSize: `${englishFontSize}px` }}
                  >
                    {item.verse.transliterationEn}
                  </p>
                )}
                
                {displayBengaliMeaning && (
                  <p
                    className="leading-7 text-(--app-text-muted)"
                    style={{ fontSize: `${bengaliFontSize}px` }}
                    lang="bn"
                  >
                    {item.verse.translationBnTaisirul}
                  </p>
                )}
              </div>

              {/* Card Footer Reference Info */}
              <div className="mt-4 pt-3 border-t border-(--app-border)/40 text-xs font-semibold text-(--app-text-tertiary)">
                Surah {item.surahNameSimple} ({item.surahNameBangla}) · {item.surahId}:{item.verseNumber}
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}
