import { useState, useEffect, useRef } from 'react'
import type { QuranVerse } from '#/data/quran/types'

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
}: {
  verses: QuranVerse[]
  highlightVerse?: number
}) {
  const [displayLimit, setDisplayLimit] = useState(() => {
    // During SSR or initial load, render all verses.
    if (typeof window === 'undefined' || isInitialLoad) {
      return verses.length
    }
    // If a verse is highlighted, override progressive rendering limit to render 
    // it immediately so it exists in the DOM for scrollIntoView.
    if (highlightVerse) {
      return Math.max(20, highlightVerse + 5)
    }
    return 20
  })

  useEffect(() => {
    isInitialLoad = false
  }, [])

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
        return (
          <VerseCard
            key={verse.verseKey}
            verse={verse}
            isHighlighted={isHighlighted}
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
  isHighlighted,
}: {
  verse: QuranVerse
  isHighlighted?: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      // Helper function to smooth scroll the verse card to the center of the viewport
      const scroll = () => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }

      // Multi-stage timers prevent router scroll restoration and async elements 
      // from overriding or cancelling our custom scroll position.
      const timers = [
        setTimeout(scroll, 100),
        setTimeout(scroll, 400),
        setTimeout(scroll, 800), // Catch-all backup for slow devices
      ]

      // Custom font files (Indo-Pak script font) load asynchronously and cause 
      // significant layout/height shifts. Listening to 'fonts.ready' ensures 
      // we scroll only after the final page heights have resolved.
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

  return (
    <article
      ref={cardRef}
      className={`p-3 rounded-lg transition-all duration-300 ${
        isHighlighted
          ? 'animate-highlight bg-(--app-accent-soft)/40'
          : ''
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
  )
}
