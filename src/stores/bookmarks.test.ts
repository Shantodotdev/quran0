import { beforeEach, describe, expect, it } from 'vitest'

import { useBookmarksStore } from './bookmarks'
import { getLocalDateString, useProgressStore } from './progress'

beforeEach(() => {
  useBookmarksStore.setState({ bookmarkIds: [] })
  useProgressStore.getState().clearProgress()
})

describe('bookmarks store', () => {
  it('keeps bookmark IDs unique and in Quranic order', () => {
    const bookmarks = useBookmarksStore.getState()

    bookmarks.addBookmark(55)
    bookmarks.addBookmark(1)
    bookmarks.addBookmark(55)

    expect(useBookmarksStore.getState().bookmarkIds).toEqual([1, 55])
    expect(useBookmarksStore.getState().isBookmarked(1)).toBe(true)
    expect(useBookmarksStore.getState().isBookmarked(2)).toBe(false)
  })

  it('toggles a bookmark and records the activity for the current day', () => {
    const bookmarks = useBookmarksStore.getState()

    bookmarks.toggleBookmark(1)

    expect(useBookmarksStore.getState().bookmarkIds).toEqual([1])
    expect(useProgressStore.getState().activities[0]).toMatchObject({
      type: 'bookmark',
      label: 'Bookmarked Surah Al-Fatihah',
    })

    bookmarks.toggleBookmark(1)

    expect(useBookmarksStore.getState().bookmarkIds).toEqual([])
    expect(useProgressStore.getState().activities).toHaveLength(2)
    const latestActivity = useProgressStore.getState().activities[0]
    expect(latestActivity).toMatchObject({
      type: 'bookmark',
      label: 'Removed bookmark for Surah Al-Fatihah',
    })
    expect(getLocalDateString(new Date(latestActivity.time))).toBe(
      getLocalDateString(),
    )
  })

  it('removes only the requested bookmark', () => {
    const bookmarks = useBookmarksStore.getState()

    bookmarks.addBookmark(1)
    bookmarks.addBookmark(36)
    bookmarks.removeBookmark(1)

    expect(useBookmarksStore.getState().bookmarkIds).toEqual([36])
  })
})
