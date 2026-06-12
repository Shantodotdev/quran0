import { useEffect } from 'react'
import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { getSurahById, getVersesBySurah } from '#/data/quran/quran-data'
import { useSettingsStore } from '#/stores/settings'

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
export const Route = createFileRoute('/surah/$surahId')({
  loader: async ({ params }) => {
    const surahId = parseSurahId(params.surahId)
    const surah = getSurahById(surahId)

    if (!surah) {
      throw notFound()
    }

    return {
      surah,
      verses: await getVersesBySurah(surahId),
    }
  },
  head: ({ loaderData }) => {
    const surah = loaderData?.surah
    if (!surah) {
      return {
        meta: [{ title: 'Surah - Quran0' }],
      }
    }

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
          children:
            '(function(){try{var s=JSON.parse(localStorage.getItem("quran0-settings")).state;document.documentElement.style.setProperty("--arabic-fs",s.arabicFontSize+"px");document.documentElement.style.setProperty("--english-fs",s.englishFontSize+"px");document.documentElement.style.setProperty("--bengali-fs",s.bengaliFontSize+"px");document.documentElement.style.setProperty("--show-en",s.displayEnglishSpelling?"block":"none");document.documentElement.style.setProperty("--show-bn",s.displayBengaliMeaning?"block":"none")}catch(e){}}())',
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
  const { surah, verses } = Route.useLoaderData()
  const arabicFontSize = useSettingsStore((s) => s.arabicFontSize)
  const englishFontSize = useSettingsStore((s) => s.englishFontSize)
  const bengaliFontSize = useSettingsStore((s) => s.bengaliFontSize)
  const displayEnglishSpelling = useSettingsStore(
    (s) => s.displayEnglishSpelling,
  )
  const displayBengaliMeaning = useSettingsStore(
    (s) => s.displayBengaliMeaning,
  )

  // Sync font sizes and display toggles to CSS custom properties.
  // The inline <script> in head sets these before first paint to avoid a
  // flash of default values; this effect keeps them updated after the user
  // changes settings via the sidebar.
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--arabic-fs', `${arabicFontSize}px`)
    root.style.setProperty('--english-fs', `${englishFontSize}px`)
    root.style.setProperty('--bengali-fs', `${bengaliFontSize}px`)
    root.style.setProperty('--show-en', displayEnglishSpelling ? 'block' : 'none')
    root.style.setProperty('--show-bn', displayBengaliMeaning ? 'block' : 'none')
  }, [
    arabicFontSize,
    englishFontSize,
    bengaliFontSize,
    displayEnglishSpelling,
    displayBengaliMeaning,
  ])

  return (
    <>
      {/* Surah header: back link, metadata, names */}
      <header className="rounded-lg border border-(--app-border) bg-(--app-surface) p-4 shadow-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-(--app-accent) transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>All Surahs</span>
        </Link>
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
            <p className="mt-0.5 text-sm text-(--app-text-tertiary)" lang="bn">
              {surah.translatedNameBn}
            </p>
          </div>
          {/* Arabic surah name — right-aligned, RTL */}
          <p
            className="quran-arabic shrink-0 text-right text-3xl leading-tight text-(--app-text-primary)"
            dir="rtl"
          >
            {surah.nameArabic}
          </p>
        </div>
      </header>

      {/* Verse list — each verse has Arabic, optional English, optional Bengali */}
      <section className="grid gap-3">
        {verses.map((verse) => (
          <article key={verse.verseKey} className="p-3">
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
        ))}
      </section>
    </>
  )
}
