import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Search, X } from 'lucide-react'

import { getAllSurahs } from '#/data/quran/quran-data'

interface SearchBarProps {
  open: boolean
  onClose: () => void
}

/**
 * Search panel that slides down below the navbar. Filters all 114 surahs
 * in memory against nameSimple, banglaName, translatedNameBn, and nameArabic.
 * Displays matching results as links to /surah/$surahId.
 *
 * Closes on Escape, overlay tap, or result navigation.
 */
export function SearchBar({ open, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter surahs against the query — runs synchronously on every keystroke
  // since 114 items is trivially fast.
  const results = useMemo(() => {
    if (!query.trim()) return getAllSurahs()

    const q = query.toLowerCase()
    return getAllSurahs().filter(
      (s) =>
        s.nameSimple.toLowerCase().includes(q) ||
        s.banglaName.toLowerCase().includes(q) ||
        s.translatedNameBn.toLowerCase().includes(q) ||
        s.nameArabic.includes(query), // Arabic is already in its own script
    )
  }, [query])

  // Auto-focus the input when the panel opens.
  useEffect(() => {
    if (open) {
      // Small delay so the transition starts before focus triggers the
      // virtual keyboard on mobile.
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
        className={`fixed left-2 right-2 top-[5.5rem] z-45 mx-auto max-w-[36rem] overflow-hidden rounded-2xl border border-(--app-border) bg-(--app-bg) shadow-2xl transition-all duration-300 ease-out sm:left-4 sm:right-4 ${
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

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-(--app-text-muted)">
              No surahs match "{query}"
            </p>
          ) : (
            results.map((surah) => (
              <Link
                key={surah.id}
                to="/surah/$surahId"
                params={{ surahId: String(surah.id) }}
                onClick={onClose}
                className="flex items-center gap-3 border-b border-(--app-border) px-4 py-3 transition-colors last:border-b-0 hover:bg-(--app-hover-bg)"
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
            ))
          )}
        </div>
      </div>
    </>
  )
}
