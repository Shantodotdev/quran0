import { useState, useEffect, useRef, useCallback } from 'react'
import type { QuranVerse } from '#/data/quran/types'
import { useAudioStore } from '#/stores/audio'
import { AyahActionModal } from '#/components/ayah-action-modal'

// Module-level flag to track initial load
let isInitialLoad = true

/**
 * Elegant circular loading spinner shown while verses are loading.
 */
export function VerseListLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="size-8 animate-spin rounded-full border-2 border-(--app-accent) border-t-transparent" />
    </div>
  )
}

/**
 * Renders the list of verses progressively.
 * It renders the first 20 verses immediately, then schedules timeouts to load
 * the rest in increments of 30. During SSR or initial client hydration, it
 * renders all verses instantly to prevent hydration mismatches and allow search engine indexing.
 */
export function VerseList({
  verses,
  highlightVerse,
  activePlayingVerse,
  surahId,
}: {
  verses: QuranVerse[]
  highlightVerse?: number
  activePlayingVerse?: string | null
  surahId: number
}) {
  const activePlayingVerseNum = activePlayingVerse
    ? Number(activePlayingVerse.split(':')[1])
    : undefined

  const [displayLimit, setDisplayLimit] = useState(() => {
    // During SSR or initial load, render all verses.
    if (typeof window === 'undefined' || isInitialLoad) {
      return verses.length
    }
    // If a verse is highlighted or active in audio, override progressive rendering limit
    // to render it immediately so it exists in the DOM for scrollIntoView.
    if (highlightVerse) {
      return Math.max(20, highlightVerse + 5)
    }
    if (activePlayingVerseNum) {
      return Math.max(20, activePlayingVerseNum + 5)
    }
    return 20
  })

  useEffect(() => {
    isInitialLoad = false
  }, [])

  // Auto-expand progressive loading limit if the playing audio advances beyond current limits
  useEffect(() => {
    if (activePlayingVerseNum && activePlayingVerseNum > displayLimit) {
      setDisplayLimit((prev) => Math.max(prev, activePlayingVerseNum + 5))
    }
  }, [activePlayingVerseNum, displayLimit])

  useEffect(() => {
    if (displayLimit >= verses.length) return

    const timer = setTimeout(() => {
      setDisplayLimit((prev) => Math.min(prev + 30, verses.length))
    }, 50)

    return () => clearTimeout(timer)
  }, [displayLimit, verses.length])

  const visibleVerses = verses.slice(0, displayLimit)

  return (
    <section className="grid gap-3">
      {visibleVerses.map((verse) => {
        const verseNum = Number(verse.verseKey.split(':')[1])
        const isHighlighted = highlightVerse === verseNum
        const isPlayingHighlighted = activePlayingVerse === verse.verseKey

        return (
          <VerseCard
            key={verse.verseKey}
            verse={verse}
            surahId={surahId}
            isHighlighted={isHighlighted}
            isPlayingHighlighted={isPlayingHighlighted}
          />
        )
      })}
      {displayLimit < verses.length && (
        <div className="flex justify-center p-6">
          <p className="text-sm text-(--app-text-tertiary) animate-pulse">
            Loading more verses ({displayLimit} of {verses.length})...
          </p>
        </div>
      )}
    </section>
  )
}

/**
 * Individual verse card.
 * Renders the Arabic text, English transliteration, and Bengali meaning.
 */
function VerseCard({
  verse,
  surahId,
  isHighlighted,
  isPlayingHighlighted,
}: {
  verse: QuranVerse
  surahId: number
  isHighlighted?: boolean
  isPlayingHighlighted?: boolean
}) {
  const isPlaying = useAudioStore((s) => s.isPlaying)
  const seekToVerse = useAudioStore((s) => s.seekToVerse)
  const cardRef = useRef<HTMLDivElement>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  )
  const [showModal, setShowModal] = useState(false)

  const handlePlayFromAyah = useCallback(async () => {
    const store = useAudioStore.getState()
    if (store.currentSurahId !== surahId) {
      await store.playSurah(surahId)
    } else if (!store.isPlaying) {
      store.togglePlay()
    }
    store.seekToVerse(verse.verseKey)
  }, [surahId, verse.verseKey])

  const startLongPress = useCallback(() => {
    longPressTimer.current = setTimeout(() => {
      setShowModal(true)
    }, 500)
  }, [])

  const cancelLongPress = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = undefined
    }
  }, [])

  // Scroll handler for search highlight (run on mount/trigger)
  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      const scroll = () => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      const timers = [
        setTimeout(scroll, 100),
        setTimeout(scroll, 400),
        setTimeout(scroll, 800),
      ]

      if (typeof window !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          requestAnimationFrame(scroll)
        })
      }

      return () => {
        timers.forEach(clearTimeout)
      }
    }
  }, [isHighlighted])

  // Scroll handler for active recitation playing verse (runs when active state toggles to true)
  useEffect(() => {
    if (isPlayingHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [isPlayingHighlighted])

  return (
    <>
      <article
        ref={cardRef}
        onClick={() => {
          if (isPlaying) {
            seekToVerse(verse.verseKey)
          }
        }}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onTouchMove={cancelLongPress}
        className={`p-3 rounded-lg transition-all duration-300 border-l-4 select-none ${
          isPlaying ? 'cursor-pointer hover:bg-(--app-hover-bg)/30' : ''
        } ${
          isHighlighted
            ? 'animate-highlight bg-(--app-accent-soft)/40 border-transparent'
            : isPlayingHighlighted
              ? 'bg-(--app-accent-soft)/15 border-(--app-accent) shadow-sm'
              : 'border-transparent'
        }`}
      >
        {/* Verse key badge (surah:ayah) */}
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-md bg-(--app-surface-raised) px-2 py-1 text-sm font-semibold text-(--app-text-secondary)">
            {verse.verseKey}
          </span>
        </div>
        {/* Arabic — font size from CSS var (set by settings), fallback 26px */}
        <p
          className="quran-arabic mt-5 text-right leading-relaxed text-(--app-text-primary)"
          style={{ fontSize: 'var(--arabic-fs, 26px)' }}
          dir="rtl"
          lang="ar"
        >
          {verse.arabicIndopak}
        </p>
        {/* English transliteration — hidden via CSS var when toggled off */}
        <p
          className="mt-4 leading-7 text-(--app-text-secondary)"
          style={{
            fontSize: 'var(--english-fs, 16px)',
            display: 'var(--show-en, block)',
          }}
        >
          {verse.transliterationEn}
        </p>
        {/* Bengali meaning — hidden via CSS var when toggled off */}
        <p
          className="mt-3 leading-7 text-(--app-text-muted)"
          style={{
            fontSize: 'var(--bengali-fs, 16px)',
            display: 'var(--show-bn, block)',
          }}
          lang="bn"
        >
          {verse.translationBnTaisirul}
        </p>
      </article>
      <AyahActionModal
        verseKey={verse.verseKey}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onPlayFromAyah={handlePlayFromAyah}
      />
    </>
  )
}
