import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, X, Clock, Sparkles } from 'lucide-react'

import { getAllSurahs } from '#/data/quran/quran-data'
import type { QuranSurah } from '#/data/quran/types'

interface SearchBarProps {
  open: boolean
  onClose: () => void
}

const RECENT_KEY = 'quran0-recent-searches'
const MAX_RECENT = 5

const SUGGESTED_SURAHS = [1, 36, 55, 112] // Al-Fatihah, Ya-Sin, Ar-Rahman, Al-Ikhlas,

/**
 * Search panel that slides down below the navbar. Filters all 114 surahs
 * in memory against nameSimple, banglaName, translatedNameBn, and nameArabic.
 * Displays matching results as links to /surah/$surahId.
 *
 * Closes on Escape, overlay tap, or result navigation.
 */
export function SearchBar({ open, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [recent, setRecent] = useState<number[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter surahs against the query — runs synchronously on every keystroke
  // since 114 items is trivially fast.
  const results = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase()
    return getAllSurahs()
      .filter(
        (s) =>
          s.nameSimple.toLowerCase().includes(q) ||
          s.banglaName.toLowerCase().includes(q) ||
          s.translatedNameBn.toLowerCase().includes(q) ||
          s.nameArabic.includes(query),
      )
      .slice(0, 30)
  }, [query])

  const suggestions = useMemo<QuranSurah[]>(
    () =>
      SUGGESTED_SURAHS.map((id) => getAllSurahs().find((s) => s.id === id)!),
    [],
  )

  const recentSurahs = useMemo<QuranSurah[]>(
    () => recent.map((id) => getAllSurahs().find((s) => s.id === id)!),
    [recent],
  )

  // Load recent searches from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY)
      if (raw) setRecent(JSON.parse(raw))
    } catch {}
  }, [])

  // Auto-focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      const id = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(id)
    }
  }, [open])

  // Close on Escape.
  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // Reset query on close (with a delay so the transition plays out).
  useEffect(() => {
    if (!open) {
      const id = setTimeout(() => setQuery(''), 200)
      return () => clearTimeout(id)
    }
  }, [open])

  // Lock body scroll while the panel is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  function handleResultClick(surahId: number) {
    const next = [surahId, ...recent.filter((id) => id !== surahId)].slice(
      0,
      MAX_RECENT,
    )
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ease-out ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel — sits below the navbar in stacking order (z-45 < navbar z-50) */}
      <div
        className={`fixed left-2 right-2 top-22 z-45 mx-auto flex max-w-xl flex-col overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-bg) shadow-2xl transition-all duration-300 ease-out sm:left-4 sm:right-4 ${
          open
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-full opacity-0'
        }`}
      >
        {/* Input row */}
        <div className="flex items-center gap-2 border-b border-(--app-border) px-4 py-3">
          <Search className="size-5 shrink-0 text-(--app-text-tertiary)" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search surahs by name…"
            className="flex-1 bg-transparent text-base text-(--app-text-primary) outline-none placeholder:text-(--app-text-muted)"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="flex size-7 items-center justify-center rounded-md text-(--app-text-tertiary) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary)"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Body — has a min-height so a single result still feels like a modal */}
        <div className="min-h-72 max-h-[60vh] overflow-y-auto">
          {query.trim() === '' ? (
            <EmptyState
              recent={recentSurahs}
              suggestions={suggestions}
              onSelect={handleResultClick}
            />
          ) : results.length === 0 ? (
            <NoResults query={query} />
          ) : (
            <ResultsList results={results} onSelect={handleResultClick} />
          )}
        </div>
      </div>
    </>
  )
}

function EmptyState({
  recent,
  suggestions,
  onSelect,
}: {
  recent: QuranSurah[]
  suggestions: QuranSurah[]
  onSelect: (id: number) => void
}) {
  return (
    <div className="flex flex-col gap-5 p-4">
      {/* Tip block */}
      <div className="flex flex-col gap-2 rounded-xl bg-(--app-control) p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--app-text-primary)">
          <Search className="size-4 text-(--app-accent)" />
          <span>Search by surah name</span>
        </div>
        <p className="text-sm leading-relaxed text-(--app-text-secondary)">
          Type the name in{' '}
          <span className="font-medium text-(--app-text-primary)">English</span>
          , <span className="font-medium text-(--app-text-primary)">বাংলা</span>
          , or{' '}
          <span className="font-medium text-(--app-text-primary)">العربية</span>
          .
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1">
          <ExampleChip label="Al-Fatihah" />
          <ExampleChip label="ফাতিহা" lang="bn" />
          <ExampleChip label="الفاتحة" lang="ar" />
        </div>
      </div>

      {/* Recent searches */}
      {recent.length > 0 && (
        <section>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--app-text-tertiary)">
            <Clock className="size-3.5" />
            <span>Recent</span>
          </div>
          <div className="grid gap-1">
            {recent.map((surah) => (
              <ResultRow
                key={surah.id}
                surah={surah}
                onClick={() => onSelect(surah.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-(--app-text-tertiary)">
          <Sparkles className="size-3.5" />
          <span>Popular</span>
        </div>
        <div className="grid gap-1">
          {suggestions.map((surah) => (
            <ResultRow
              key={surah.id}
              surah={surah}
              onClick={() => onSelect(surah.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function NoResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
      <Search className="size-8 text-(--app-text-muted)" />
      <p className="text-sm font-medium text-(--app-text-primary)">
        No surahs match "{query}"
      </p>
      <p className="text-xs text-(--app-text-tertiary)">
        Try a partial name in English, বাংলা, or العربية
      </p>
    </div>
  )
}

function ResultsList({
  results,
  onSelect,
}: {
  results: ReturnType<typeof getAllSurahs>
  onSelect: (id: number) => void
}) {
  return (
    <div className="grid gap-0.5 p-2">
      {results.map((surah) => (
        <ResultRow
          key={surah.id}
          surah={surah}
          onClick={() => onSelect(surah.id)}
        />
      ))}
    </div>
  )
}

function ResultRow({
  surah,
  onClick,
}: {
  surah: QuranSurah
  onClick: () => void
}) {
  return (
    <Link
      to="/surah/$surahId"
      params={{ surahId: String(surah.id) }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-(--app-hover-bg)"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-(--app-accent-soft) text-sm font-semibold text-(--app-accent)">
        {surah.id}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-(--app-text-primary)">
          {surah.nameSimple}
        </p>
        <p className="truncate text-xs text-(--app-text-tertiary)">
          {surah.banglaName} | {surah.translatedNameBn}
        </p>
      </div>
    </Link>
  )
}

function ExampleChip({ label, lang }: { label: string; lang?: string }) {
  return (
    <span
      lang={lang}
      className="rounded-full bg-(--app-surface-raised) px-2.5 py-1 text-xs text-(--app-text-secondary)"
    >
      {label}
    </span>
  )
}
