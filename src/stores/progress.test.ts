import { beforeEach, describe, expect, it } from 'vitest'

import { getLocalDateString, useProgressStore } from './progress'

beforeEach(() => {
  useProgressStore.getState().clearProgress()
})

describe('progress store', () => {
  it('records only one visit activity per day and updates the streak', () => {
    const today = getLocalDateString()
    const progress = useProgressStore.getState()

    progress.logVisit()
    progress.logVisit()

    expect(useProgressStore.getState().visitedDates).toEqual([today])
    expect(useProgressStore.getState().bestStreak).toBe(1)
    expect(useProgressStore.getState().getCurrentStreak()).toBe(1)
    expect(useProgressStore.getState().activities).toHaveLength(1)
    expect(useProgressStore.getState().activities[0]).toMatchObject({
      type: 'visit',
      label: 'Opened Quran0 App',
    })
  })

  it('keeps the highest reading progress and marks a surah complete at 90 percent', () => {
    const today = getLocalDateString()
    const progress = useProgressStore.getState()

    progress.logReadingProgress(1, 0.6)
    progress.logReadingProgress(1, 0.3)

    expect(useProgressStore.getState().readingProgress[today]?.[1]).toBe(0.6)
    expect(useProgressStore.getState().activities).toHaveLength(1)
    expect(useProgressStore.getState().activities[0]?.detail).toBe(
      'Began reading (আল-ফাতিহা)',
    )

    progress.logReadingProgress(1, 0.95)

    expect(useProgressStore.getState().readingProgress[today]?.[1]).toBe(0.95)
    expect(useProgressStore.getState().activities[0]?.detail).toBe(
      'Completed entire surah',
    )
  })

  it('accumulates listening time and converts it into daily statistics', () => {
    const today = getLocalDateString()
    const progress = useProgressStore.getState()

    progress.logListeningTime(1, 90)
    progress.logListeningTime(1, 30)

    expect(useProgressStore.getState().listeningSeconds[today]?.[1]).toBe(120)
    expect(useProgressStore.getState().activities).toHaveLength(1)
    expect(useProgressStore.getState().getStatsForDate(today)).toEqual({
      mins: 2,
      verses: 0,
      visits: 0,
    })
  })

  it('ignores progress events for unknown surah IDs', () => {
    const today = getLocalDateString()
    const progress = useProgressStore.getState()

    progress.logReadingProgress(999, 1)
    progress.logListeningTime(999, 60)

    expect(useProgressStore.getState().readingProgress[today]).toBeUndefined()
    expect(useProgressStore.getState().listeningSeconds[today]).toBeUndefined()
    expect(useProgressStore.getState().activities).toEqual([])
  })

  it('returns seven consecutive days ending with today', () => {
    const weeklyData = useProgressStore.getState().getWeeklyData()

    expect(weeklyData).toHaveLength(7)
    expect(weeklyData[6]?.dateStr).toBe(getLocalDateString())
    expect(new Set(weeklyData.map((day) => day.dateStr)).size).toBe(7)
  })
})
