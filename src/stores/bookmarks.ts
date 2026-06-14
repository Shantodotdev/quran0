import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BookmarksState {
  /** Sorted array of bookmarked surah IDs (1-114). */
  bookmarkIds: number[]
  addBookmark: (surahId: number) => void
  removeBookmark: (surahId: number) => void
  toggleBookmark: (surahId: number) => void
  isBookmarked: (surahId: number) => boolean
}

/**
 * Persisted store for surah-level bookmarks.
 *
 * Bookmark IDs are stored sorted in ascending order so the bookmarks
 * page renders in Quranic order without requiring a separate sort. The
 * store is persisted to localStorage under the key `quran0-bookmarks`,
 * following the same pattern as the theme and settings stores.
 *
 * On the surah page the fill/color of the bookmark icon is driven by CSS
 * custom properties (`--surah-bm-fill`, `--surah-bm-color`). An inline
 * script in the route's `<head>` reads the persisted store before React
 * hydrates, so the button renders in the correct state on first paint
 * without flashing.
 */
export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      bookmarkIds: [],

      addBookmark: (surahId) =>
        set((state) => {
          if (state.bookmarkIds.includes(surahId)) return state
          return { bookmarkIds: [...state.bookmarkIds, surahId].sort((a, b) => a - b) }
        }),

      removeBookmark: (surahId) =>
        set((state) => ({
          bookmarkIds: state.bookmarkIds.filter((id) => id !== surahId),
        })),

      toggleBookmark: (surahId) => {
        const state = get()
        if (state.bookmarkIds.includes(surahId)) {
          set({ bookmarkIds: state.bookmarkIds.filter((id) => id !== surahId) })
        } else {
          set({ bookmarkIds: [...state.bookmarkIds, surahId].sort((a, b) => a - b) })
        }
      },

      isBookmarked: (surahId) => get().bookmarkIds.includes(surahId),
    }),
    {
      name: 'quran0-bookmarks',
    },
  ),
)
