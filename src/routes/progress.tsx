import { createFileRoute } from '@tanstack/react-router'
import {
  ChevronRight,
  BookOpen,
  Volume2,
  Bookmark,
  Activity,
} from 'lucide-react'
import { useProgressStore, getLocalDateString } from '#/stores/progress'

export const Route = createFileRoute('/progress')({
  component: ProgressPage,
  head: () => ({
    meta: [
      {
        title: 'Progress - Quran0',
      },
      {
        name: 'description',
        content: 'Track your daily visits and Quran reading consistency.',
      },
    ],
  }),
})

function formatTimeAgo(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)

    if (diffMs < 0 || diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`

    // Check if yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Recently'
  }
}

function ProgressPage() {
  const activities = useProgressStore((s) => s.activities)

  const getCurrentStreak = useProgressStore((s) => s.getCurrentStreak)
  const getStatsForDate = useProgressStore((s) => s.getStatsForDate)
  const getWeeklyData = useProgressStore((s) => s.getWeeklyData)

  // Compute reactive progress statistics
  const streak = getCurrentStreak()
  const todayStr = getLocalDateString()
  const statsToday = getStatsForDate(todayStr)
  const readingTimeToday = statsToday.mins
  const versesReadToday = statsToday.verses
  const weeklyData = getWeeklyData()

  // Get max metric value to scale weekly bar chart (min scale of 30 mins)
  const maxMins = Math.max(30, ...weeklyData.map((d) => d.mins))

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Page Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-(--app-text-primary)">
          Your Progress
        </h1>
        <p className="text-sm text-(--app-text-tertiary)">
          Track your daily Quran reading habits, streak, and goals.
        </p>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-(--app-surface) border border-(--app-border) rounded-xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold text-(--app-text-muted) uppercase tracking-wider whitespace-nowrap block w-full truncate">
            Streak
          </span>
          <div className="mt-0.5 text-sm sm:text-xl font-bold text-(--app-text-primary) whitespace-nowrap w-full truncate">
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </div>
        </div>

        <div className="bg-(--app-surface) border border-(--app-border) rounded-xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold text-(--app-text-muted) uppercase tracking-wider whitespace-nowrap block w-full truncate">
            Time Today
          </span>
          <div className="mt-0.5 text-sm sm:text-xl font-bold text-(--app-text-primary) whitespace-nowrap w-full truncate">
            {readingTimeToday}m
          </div>
        </div>

        <div className="bg-(--app-surface) border border-(--app-border) rounded-xl p-2.5 sm:p-4 text-center shadow-sm flex flex-col items-center justify-center min-w-0">
          <span className="text-[10px] sm:text-xs font-semibold text-(--app-text-muted) uppercase tracking-wider whitespace-nowrap block w-full truncate">
            Read Today
          </span>
          <div className="mt-0.5 text-sm sm:text-xl font-bold text-(--app-text-primary) whitespace-nowrap w-full truncate">
            {versesReadToday} {versesReadToday === 1 ? 'Verse' : 'Verses'}
          </div>
        </div>
      </section>

      {/* Weekly Reading Time Chart */}
      <section className="bg-(--app-surface) border border-(--app-border) p-5 rounded-xl shadow-sm">
        <h2 className="text-sm font-semibold text-(--app-text-primary) mb-4">
          Weekly Reading Time
        </h2>
        <div className="h-36 flex items-end justify-between gap-3 px-1">
          {weeklyData.map((d) => {
            const pct = Math.min(100, (d.mins / maxMins) * 100)
            return (
              <div
                key={d.dateStr}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                <span className="text-xs text-(--app-text-muted) font-semibold">
                  {d.mins > 0 ? `${d.mins}m` : '-'}
                </span>
                <div className="w-full h-24 bg-(--app-control) rounded-md overflow-hidden flex items-end">
                  <div
                    className="w-full bg-(--app-accent) opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer"
                    style={{ height: `${pct}%` }}
                    title={`${d.mins} minutes`}
                  />
                </div>
                <span className="text-xs text-(--app-text-muted) font-medium">
                  {d.day}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent Activity Log */}
      <section className="bg-(--app-surface) border border-(--app-border) p-5 rounded-xl shadow-sm flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-(--app-text-primary) mb-1 border-b border-(--app-border)/40 pb-2">
          Recent Activity
        </h2>
        {activities.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-xs text-(--app-text-muted)">
              No recent activity. Read a surah or play recitations to log your
              progress.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {activities.map((act, i) => {
              // Pick a suitable icon based on type
              const getIcon = () => {
                switch (act.type) {
                  case 'read':
                    return <BookOpen className="size-4.5 text-emerald-400" />
                  case 'audio':
                    return <Volume2 className="size-4.5 text-sky-400" />
                  case 'bookmark':
                    return (
                      <Bookmark className="size-4.5 text-pink-400 fill-current" />
                    )
                  case 'visit':
                    return <Activity className="size-4.5 text-orange-400" />
                  default:
                    return (
                      <ChevronRight className="size-4.5 text-(--app-text-muted)" />
                    )
                }
              }

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 border-b border-(--app-border)/30 pb-3 last:border-0 last:pb-0"
                >
                  <span className="shrink-0 flex items-center">
                    {getIcon()}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-(--app-text-primary)">
                      {act.label}
                    </span>
                    {act.detail && (
                      <span className="text-xs text-(--app-text-muted) block mt-0.5 leading-normal">
                        {act.detail}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-(--app-text-muted) font-semibold whitespace-nowrap">
                    {formatTimeAgo(act.time)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
