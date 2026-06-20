import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getSurahById } from '#/data/quran/quran-data'

export interface ActivityLog {
  type: 'read' | 'audio' | 'bookmark' | 'visit'
  label: string
  detail?: string
  time: string // ISO string
}

export interface ProgressState {
  // Persisted state
  visitedDates: string[] // List of YYYY-MM-DD dates visited
  bestStreak: number
  readingProgress: Record<string, Record<number, number> | undefined> // date -> { surahId: maxScrollProgress (0 to 1) }
  listeningSeconds: Record<string, Record<number, number> | undefined> // date -> { surahId: secondsPlayed }
  activities: ActivityLog[]

  // Actions
  logVisit: () => void
  logReadingProgress: (surahId: number, progress: number) => void
  logListeningTime: (surahId: number, seconds: number) => void
  logBookmarkActivity: (surahId: number, isBookmarked: boolean) => void
  clearProgress: () => void

  // Selectors/Helpers
  getCurrentStreak: () => number
  getStatsForDate: (dateStr: string) => { mins: number; verses: number; visits: number }
  getWeeklyData: () => { day: string; dateStr: string; mins: number; verses: number; visits: number }[]
}

// Helper to get local YYYY-MM-DD date string
export function getLocalDateString(date: Date = new Date()): string {
  // Use local timezone formatting (YYYY-MM-DD)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateStreak(visitedDates: string[]): number {
  if (visitedDates.length === 0) return 0

  const sortedDates = [...new Set(visitedDates)].sort()
  const todayStr = getLocalDateString()

  // Yesterday date string
  const date = new Date()
  date.setDate(date.getDate() - 1)
  const yesterdayStr = getLocalDateString(date)

  const hasToday = sortedDates.includes(todayStr)
  const hasYesterday = sortedDates.includes(yesterdayStr)

  if (!hasToday && !hasYesterday) {
    return 0 // Streak is broken
  }

  let currentStreak = 0
  const checkDate = new Date(hasToday ? todayStr : yesterdayStr)
  let checkStr = getLocalDateString(checkDate)

  while (sortedDates.includes(checkStr)) {
    currentStreak++
    checkDate.setDate(checkDate.getDate() - 1)
    checkStr = getLocalDateString(checkDate)
  }

  return currentStreak
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      visitedDates: [],
      bestStreak: 0,
      readingProgress: {},
      listeningSeconds: {},
      activities: [],

      logVisit: () => {
        const todayStr = getLocalDateString()
        const state = get()

        // 1. Log visit date if not already recorded today
        let newVisitedDates = state.visitedDates
        if (!state.visitedDates.includes(todayStr)) {
          newVisitedDates = [...state.visitedDates, todayStr]
        }

        // 2. Recalculate streak
        const currentStreak = calculateStreak(newVisitedDates)
        const newBestStreak = Math.max(state.bestStreak, currentStreak)

        // 3. Log visit activity if not logged today
        let newActivities = state.activities
        const todayVisitExists = state.activities.some(
          (act) =>
            act.type === 'visit' &&
            getLocalDateString(new Date(act.time)) === todayStr &&
            act.label.includes('Opened Quran0'),
        )

        if (!todayVisitExists) {
          const newActivity: ActivityLog = {
            type: 'visit',
            label: 'Opened Quran0 App',
            detail: 'Started a new spiritual session',
            time: new Date().toISOString(),
          }
          newActivities = [newActivity, ...state.activities].slice(0, 50)
        }

        set({
          visitedDates: newVisitedDates,
          bestStreak: newBestStreak,
          activities: newActivities,
        })
      },

      logReadingProgress: (surahId, progress) => {
        const todayStr = getLocalDateString()
        const state = get()
        const surah = getSurahById(surahId)
        if (!surah) return

        // 1. Update scroll progress mapping (store maximum progress reached today)
        const todayReading = state.readingProgress[todayStr] || {}
        const prevProgress = todayReading[surahId] || 0
        const newProgress = Math.max(prevProgress, progress)

        const newReadingProgress = {
          ...state.readingProgress,
          [todayStr]: {
            ...todayReading,
            [surahId]: newProgress,
          },
        }

        // 2. Log activity if not logged today for this surah, or if we hit milestones
        let newActivities = state.activities
        const alreadyLoggedReadToday = state.activities.some(
          (act) =>
            act.type === 'read' &&
            getLocalDateString(new Date(act.time)) === todayStr &&
            act.label.includes(surah.nameSimple),
        )

        // Log when they have read at least 5% of the surah
        if (newProgress >= 0.05 && !alreadyLoggedReadToday) {
          const newActivity: ActivityLog = {
            type: 'read',
            label: `Read Surah ${surah.nameSimple}`,
            detail: `Began reading (${surah.banglaName})`,
            time: new Date().toISOString(),
          }
          newActivities = [newActivity, ...state.activities].slice(0, 50)
        }

        // Update details if they reach 90%+ completion
        if (newProgress >= 0.90 && alreadyLoggedReadToday) {
          newActivities = state.activities.map((act) => {
            if (
              act.type === 'read' &&
              getLocalDateString(new Date(act.time)) === todayStr &&
              act.label === `Read Surah ${surah.nameSimple}` &&
              act.detail !== 'Completed entire surah'
            ) {
              return {
                ...act,
                detail: 'Completed entire surah',
              }
            }
            return act
          })
        }

        set({
          readingProgress: newReadingProgress,
          activities: newActivities,
        })
      },

      logListeningTime: (surahId, seconds) => {
        const todayStr = getLocalDateString()
        const state = get()
        const surah = getSurahById(surahId)
        if (!surah) return

        // 1. Update listening time
        const todayListens = state.listeningSeconds[todayStr] || {}
        const prevSeconds = todayListens[surahId] || 0
        const newSeconds = prevSeconds + seconds

        const newListeningSeconds = {
          ...state.listeningSeconds,
          [todayStr]: {
            ...todayListens,
            [surahId]: newSeconds,
          },
        }

        // 2. Log activity if not logged today for this surah
        let newActivities = state.activities
        const alreadyLoggedListenToday = state.activities.some(
          (act) =>
            act.type === 'audio' &&
            getLocalDateString(new Date(act.time)) === todayStr &&
            act.label.includes(surah.nameSimple),
        )

        if (!alreadyLoggedListenToday) {
          const newActivity: ActivityLog = {
            type: 'audio',
            label: `Listened to Surah ${surah.nameSimple}`,
            detail: `Began audio recitation`,
            time: new Date().toISOString(),
          }
          newActivities = [newActivity, ...state.activities].slice(0, 50)
        }

        set({
          listeningSeconds: newListeningSeconds,
          activities: newActivities,
        })
      },

      logBookmarkActivity: (surahId, isBookmarked) => {
        const surah = getSurahById(surahId)
        if (!surah) return

        const state = get()
        const newActivity: ActivityLog = {
          type: 'bookmark',
          label: isBookmarked
            ? `Bookmarked Surah ${surah.nameSimple}`
            : `Removed bookmark for Surah ${surah.nameSimple}`,
          detail: surah.banglaName,
          time: new Date().toISOString(),
        }

        set({
          activities: [newActivity, ...state.activities].slice(0, 50),
        })
      },

      clearProgress: () => {
        set({
          visitedDates: [],
          bestStreak: 0,
          readingProgress: {},
          listeningSeconds: {},
          activities: [],
        })
      },

      getCurrentStreak: () => {
        return calculateStreak(get().visitedDates)
      },

      getStatsForDate: (dateStr) => {
        const state = get()

        // 1. Reading time: estimated at 0.1 mins (6s) per verse read
        const todayReading = state.readingProgress[dateStr] || {}
        let readingMins = 0
        let versesRead = 0

        Object.entries(todayReading).forEach(([idStr, progress]) => {
          const surahId = Number(idStr)
          const surah = getSurahById(surahId)
          if (surah) {
            const read = Math.round(surah.versesCount * progress)
            versesRead += read
            readingMins += read * 0.1
          }
        })

        // 2. Listening time: exact seconds / 60
        const todayListens = state.listeningSeconds[dateStr] || {}
        let listeningMins = 0
        Object.values(todayListens).forEach((seconds) => {
          listeningMins += seconds / 60
        })

        const totalMins = Math.round(readingMins + listeningMins)
        const visits = state.visitedDates.includes(dateStr) ? 1 : 0

        return {
          mins: totalMins,
          verses: versesRead,
          visits,
        }
      },

      getWeeklyData: () => {
        const state = get()
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const result = []

        // Generate the last 7 days of dates, ending with today
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dateStr = getLocalDateString(date)
          const dayName = days[date.getDay()]
          const stats = state.getStatsForDate(dateStr)

          result.push({
            day: dayName,
            dateStr,
            ...stats,
          })
        }

        return result
      },
    }),
    {
      name: 'quran0-progress',
    },
  ),
)
