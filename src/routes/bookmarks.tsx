import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Bookmark, Loader2 } from 'lucide-react'

import { getSurahById } from '#/data/quran/quran-data'
import { useBookmarksStore } from '#/stores/bookmarks'

export const Route = createFileRoute('/bookmarks')({
  component: BookmarksPage,
  head: () => ({
    meta: [
      {
        title: 'Bookmarks - Quran0',
      },
    ],
  }),
})

/**
 * Tracks whether the Zustand persist store has finished rehydrating from
 * localStorage. On the first visit the SSR render always sees hydrated =
 * false, and the useEffect fires on the client to signal completion.
 * This prevents a flash where the store's default state (empty array)
 * briefly shows the "no bookmarks" empty state before the persisted data
 * is available.
 */
function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // Hydration may have already happened before this effect mounted.
    if (useBookmarksStore.persist.hasHydrated()) {
      setHydrated(true)
      return
    }
    const unsub = useBookmarksStore.persist.onFinishHydration(() =>
      setHydrated(true),
    )
    return unsub
  }, [])

  return hydrated
}

/**
 * Bookmarks page at /bookmarks.
 *
 * Shows a spinning loader while Zustand rehydrates from localStorage.
 * Once hydrated, renders a list of bookmarked surahs as links to the
 * surah reader page. If there are no bookmarks, shows an empty state
 * with a prompt to bookmark surahs from the surah reader.
 */
function BookmarksPage() {
  const hydrated = useHydrated()
  const bookmarkIds = useBookmarksStore((s) => s.bookmarkIds)

  if (!hydrated) {
    return (
      <div className="mt-24 flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-10 animate-spin text-(--app-accent)" />
        <p className="text-sm text-(--app-text-tertiary)">Loading bookmarks…</p>
      </div>
    )
  }

  const surahs = bookmarkIds
    .map((id) => getSurahById(id))
    .filter((s): s is NonNullable<typeof s> => s != null)

  if (surahs.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-center">
        <Bookmark className="size-12 text-(--app-text-tertiary)" />
        <div>
          <h2 className="text-lg font-semibold text-(--app-text-primary)">
            No bookmarks yet
          </h2>
          <p className="mt-1 text-sm text-(--app-text-tertiary)">
            Bookmark surahs from the reader page to access them quickly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <section className="grid gap-2">
      {surahs.map((surah) => (
        <Link
          key={surah.id}
          to="/surah/$surahId"
          params={{ surahId: String(surah.id) }}
          className="grid grid-cols-[auto_1fr] items-center gap-3 p-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-(--app-accent-soft) text-lg font-semibold text-(--app-accent)">
            {surah.id}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-(--app-text-primary)">
              {surah.nameSimple}
            </span>
            <span className="mt-0.5 block truncate text-sm text-(--app-text-tertiary)">
              {surah.banglaName} | {surah.translatedNameBn}
            </span>
          </span>
        </Link>
      ))}
    </section>
  )
}
