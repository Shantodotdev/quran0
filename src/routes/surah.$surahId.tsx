import { useEffect, Suspense, useState } from 'react'
import {
  Link,
  createFileRoute,
  notFound,
  defer,
  Await,
  useNavigate,
} from '@tanstack/react-router'
import { Bookmark, ChevronLeft, ChevronRight } from 'lucide-react'

import { getSurahById, getVersesBySurah } from '#/data/quran/quran-data'
import { useSettingsStore } from '#/stores/settings'
import { useBookmarksStore } from '#/stores/bookmarks'
import { useHorizontalSwipe } from '#/hooks/use-horizontal-swipe'
import { ReadingProgressBar } from '#/components/reading-progress-bar'
import { VerseList, VerseListLoader } from '#/components/verse-list'

/**
 * Route: /surah/$surahId
 *
 * Loads a single surah's metadata and verses. The surah list is resolved
 * eagerly from an in-memory JSON import; verse data is lazy-loaded per surah
 * via Vite's import.meta.glob so each surah chunk can be individually cached
 * and precached by the PWA service worker.
 *
 * The head block sets meta tags for the surah page and injects an inline
 * script that reads persisted settings from localStorage before the first
 * paint. This prevents a flash where default font sizes or toggle states
 * render briefly before React hydrates.
 */
/**
 * Search parameter contract for Surah routes.
 * Supports highlighting and scrolling to specific verses (e.g. from the Motivation page).
 */
type SurahSearch = {
  /** Optional verse number parameter to highlight on page load */
  verse?: number
}

export const Route = createFileRoute('/surah/$surahId')({
  // Parse and validate the optional 'verse' query parameter
  validateSearch: (search: Record<string, unknown>): SurahSearch => {
    return {
      verse: search.verse ? Number(search.verse) : undefined,
    }
  },
  loader: async ({ params }) => {
    const surahId = parseSurahId(params.surahId)
    const surah = getSurahById(surahId)

    if (!surah) {
      throw notFound()
    }

    // Force a minimum loading delay of 250ms on the client to ensure the spinner
    // spins for a deliberate duration, avoiding an irritating 10-30ms flicker on fast loads.
    // Skip this during SSR/prerendering to avoid slowing down build times.
    const isServer = typeof window === 'undefined'
    const versesPromise = isServer
      ? getVersesBySurah(surahId)
      : Promise.all([
          getVersesBySurah(surahId),
          new Promise((resolve) => setTimeout(resolve, 250)),
        ]).then(([verses]) => verses)

    return {
      surah,
      versesPromise: defer(versesPromise),
    }
  },
  head: ({ loaderData }) => {
    const surah = loaderData?.surah
    if (!surah) {
      return {
        meta: [{ title: 'Surah - Quran0' }],
      }
    }

    const surahId = surah.id

    return {
      meta: [
        {
          title: `Surah ${surah.nameSimple} (${surah.banglaName}) - Quran0`,
        },
        {
          name: 'description',
          content: `Read Surah ${surah.nameSimple} (${surah.banglaName}), the ${surah.id}th surah of the Quran with ${surah.versesCount} verses. Includes Bengali translation and transliteration.`,
        },
      ],
      scripts: [
        {
          children: `(function(){try{var s=JSON.parse(localStorage.getItem("quran0-settings")).state;document.documentElement.style.setProperty("--arabic-fs",s.arabicFontSize+"px");document.documentElement.style.setProperty("--english-fs",s.englishFontSize+"px");document.documentElement.style.setProperty("--bengali-fs",s.bengaliFontSize+"px");document.documentElement.style.setProperty("--show-en",s.displayEnglishSpelling?"block":"none");document.documentElement.style.setProperty("--show-bn",s.displayBengaliMeaning?"block":"none")}catch(e){}}());(function(){try{var b=JSON.parse(localStorage.getItem("quran0-bookmarks")||'null');var ids=b&&b.state?b.state.bookmarkIds:[];var f=ids.indexOf(${surahId})!==-1;document.documentElement.style.setProperty("--surah-bm-fill",f?"var(--app-accent)":"transparent");document.documentElement.style.setProperty("--surah-bm-color",f?"var(--app-accent)":"var(--app-text-tertiary)")}catch(e){}})()`,
        },
      ],
    }
  },
  component: SurahPage,
})

/**
 * Parse and validate the $surahId route parameter.
 * Accepts an integer between 1 and 114 (inclusive). Throws a 404 for
 * anything outside that range so TanStack Router renders its not-found
 * boundary instead of a broken page.
 */
function parseSurahId(value: string) {
  const surahId = Number(value)

  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) {
    throw notFound()
  }

  return surahId
}

/**
 * Main surah reader page.
 *
 * Renders the surah header (name, metadata, Arabic title) followed by a
 * list of verses. Each verse shows:
 *  - Arabic text (Indo-Pak script) with a user-configurable font size
 *  - English transliteration, togglable via settings
 *  - Bengali meaning, togglable via settings
 *
 * Font sizes and display toggles are synced to CSS custom properties so
 * the inline script in <head> sets the correct values before first paint,
 * and this component's useEffect keeps them updated when the user changes
 * settings in the sidebar.
 */
function SurahPage() {
  const { surah, versesPromise } = Route.useLoaderData()
  const { verse } = Route.useSearch()
  const arabicFontSize = useSettingsStore((s) => s.arabicFontSize)
  const englishFontSize = useSettingsStore((s) => s.englishFontSize)
  const bengaliFontSize = useSettingsStore((s) => s.bengaliFontSize)
  const displayEnglishSpelling = useSettingsStore(
    (s) => s.displayEnglishSpelling,
  )
  const displayBengaliMeaning = useSettingsStore((s) => s.displayBengaliMeaning)
  const isBookmarked = useBookmarksStore((s) => s.isBookmarked(surah.id))
  const toggleBookmark = useBookmarksStore((s) => s.toggleBookmark)

  const navigate = useNavigate()

  // Track animation and navigation state
  const [currentSurahId, setCurrentSurahId] = useState(surah.id)
  const [entryClass, setEntryClass] = useState('animate-slide-in-from-right')
  const [shouldRenderVerses, setShouldRenderVerses] = useState(false)

  // Derive animation direction synchronously during render to avoid flashes
  if (surah.id !== currentSurahId) {
    const dir = surah.id > currentSurahId ? 'right' : 'left'
    setEntryClass(`animate-slide-in-from-${dir}`)
    setCurrentSurahId(surah.id)
  }

  // Clear animation class once transition completes
  useEffect(() => {
    if (entryClass) {
      const timer = setTimeout(() => {
        setEntryClass('')
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [entryClass])

  // Delay rendering the verses list until the slide animation completes
  useEffect(() => {
    setShouldRenderVerses(false)
    const timer = setTimeout(() => {
      setShouldRenderVerses(true)
    }, 250) // 250ms matches the snappy transition duration
    return () => clearTimeout(timer)
  }, [surah.id])

  // Set up swipe gesture handlers
  const swipeProps = useHorizontalSwipe({
    onSwipeLeft: () => {
      const nextId = surah.id + 1
      setTimeout(() => {
        navigate({ to: '/surah/$surahId', params: { surahId: String(nextId) } })
      }, 180)
    },
    onSwipeRight: () => {
      const prevId = surah.id - 1
      setTimeout(() => {
        navigate({ to: '/surah/$surahId', params: { surahId: String(prevId) } })
      }, 180)
    },
    resistanceRightBoundary: surah.id === 1,
    resistanceLeftBoundary: surah.id === 114,
  })

  // Sync bookmark fill/color CSS custom properties on state change.
  // The inline <script> in head sets these before first paint via
  // localStorage so there's no flash of the wrong icon state.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty(
      '--surah-bm-fill',
      isBookmarked ? 'var(--app-accent)' : 'transparent',
    )
    root.style.setProperty(
      '--surah-bm-color',
      isBookmarked ? 'var(--app-accent)' : 'var(--app-text-tertiary)',
    )
  }, [isBookmarked])

  // Sync font sizes and display toggles to CSS custom properties.
  // The inline <script> in head sets these before first paint to avoid a
  // flash of default values; this effect keeps them updated after the user
  // changes settings via the sidebar.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--arabic-fs', `${arabicFontSize}px`)
    root.style.setProperty('--english-fs', `${englishFontSize}px`)
    root.style.setProperty('--bengali-fs', `${bengaliFontSize}px`)
    root.style.setProperty(
      '--show-en',
      displayEnglishSpelling ? 'block' : 'none',
    )
    root.style.setProperty(
      '--show-bn',
      displayBengaliMeaning ? 'block' : 'none',
    )
  }, [
    arabicFontSize,
    englishFontSize,
    bengaliFontSize,
    displayEnglishSpelling,
    displayBengaliMeaning,
  ])

  return (
    <div className="relative w-full overflow-x-hidden">
      <ReadingProgressBar />

      <div
        key={surah.id}
        className={`w-full will-change-transform ${entryClass}`}
        {...swipeProps}
      >
        {/* Surah header: back link, metadata, names */}
        <header className="rounded-lg border border-(--app-border) bg-(--app-surface) p-4 shadow-sm">
          {/* Top navigation row */}
          <div className="flex items-center justify-between border-b border-(--app-border) pb-3 mb-4">
            {surah.id > 1 ? (
              <Link
                to="/surah/$surahId"
                params={{ surahId: String(surah.id - 1) }}
                className="inline-flex items-center gap-1 text-sm text-(--app-text-secondary) hover:text-(--app-accent) transition-colors font-medium"
              >
                <ChevronLeft className="size-4" />
                <span>{getSurahById(surah.id - 1)?.nameSimple}</span>
              </Link>
            ) : (
              <div className="w-10" />
            )}

            {surah.id < 114 ? (
              <Link
                to="/surah/$surahId"
                params={{ surahId: String(surah.id + 1) }}
                className="inline-flex items-center gap-1 text-sm text-(--app-text-secondary) hover:text-(--app-accent) transition-colors font-medium"
              >
                <span>{getSurahById(surah.id + 1)?.nameSimple}</span>
                <ChevronRight className="size-4" />
              </Link>
            ) : (
              <div className="w-10" />
            )}
          </div>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-(--app-text-tertiary) uppercase tracking-wider">
                Surah {surah.id} · {surah.versesCount} Ayahs
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-(--app-text-primary)">
                {surah.nameSimple}
              </h1>
              <p
                className="mt-0.5 text-base text-(--app-text-secondary)"
                lang="bn"
              >
                {surah.banglaName}
              </p>
              <p
                className="mt-0.5 text-sm text-(--app-text-tertiary)"
                lang="bn"
              >
                {surah.translatedNameBn}
              </p>
            </div>
            {/* Arabic surah name + bookmark button — right-aligned, RTL */}
            <div className="flex shrink-0 flex-col items-center gap-3">
              <p
                className="quran-arabic text-right text-3xl leading-tight text-(--app-text-primary)"
                dir="rtl"
              >
                {surah.nameArabic}
              </p>
              <button
                type="button"
                onClick={() => toggleBookmark(surah.id)}
                className="flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-(--app-hover-bg)"
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark surah'}
              >
                <Bookmark
                  className="size-5"
                  style={{
                    fill: 'var(--surah-bm-fill, transparent)',
                    color: 'var(--surah-bm-color, var(--app-text-tertiary))',
                  }}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Verse list with Suspense / Await deferred loading */}
        {shouldRenderVerses ? (
          <Suspense fallback={<VerseListLoader />}>
            <Await promise={versesPromise}>
              {(verses) => <VerseList verses={verses} highlightVerse={verse} />}
            </Await>
          </Suspense>
        ) : (
          <VerseListLoader />
        )}
      </div>
    </div>
  )
}
