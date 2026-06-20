import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronRight, BookOpen, Volume2, Bookmark } from 'lucide-react'

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

function ProgressPage() {
  // Standard mock data
  const streak = 5
  const readingTimeToday = 18
  const versesReadToday = 12

  const weeklyData = [
    { day: 'Mon', mins: 15 },
    { day: 'Tue', mins: 8 },
    { day: 'Wed', mins: 25 },
    { day: 'Thu', mins: 12 },
    { day: 'Fri', mins: 0 },
    { day: 'Sat', mins: 18 },
    { day: 'Sun', mins: 5 },
  ]

  const activities = [
    { type: 'read', label: 'Read Surah Ya-Sin', time: '15 mins ago' },
    { type: 'audio', label: 'Listened to Surah Ya-Sin', time: '1 hour ago' },
    { type: 'bookmark', label: 'Bookmarked verse in Surah Al-Baqarah', time: 'Yesterday' },
    { type: 'read', label: 'Read Surah Al-Mulk', time: 'Yesterday' },
  ]

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
            {streak} Days
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
            {versesReadToday} Verses
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
            // Scale bar height relative to a 30 mins standard target
            const pct = Math.min(100, (d.mins / 30) * 100)
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-(--app-text-muted) font-semibold">
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
        <div className="flex flex-col gap-3.5">
          {activities.map((act, i) => {
            // Pick a suitable icon based on type
            const getIcon = () => {
              switch (act.type) {
                case 'read':
                  return <BookOpen className="size-4 text-emerald-400" />
                case 'audio':
                  return <Volume2 className="size-4 text-sky-400" />
                case 'bookmark':
                  return <Bookmark className="size-4 text-pink-400 fill-current" />
                default:
                  return <ChevronRight className="size-4 text-(--app-text-muted)" />
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
                  <span className="text-xs font-semibold text-(--app-text-primary)">
                    {act.label}
                  </span>
                </div>
                <span className="text-[10px] text-(--app-text-muted) font-semibold whitespace-nowrap">
                  {act.time}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Footer Navigation Link */}
      <footer className="mt-2 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-bold text-(--app-accent) hover:underline p-1 cursor-pointer"
        >
          <span>Return to Quran Index</span>
          <ChevronRight className="size-3.5" />
        </Link>
      </footer>
    </div>
  )
}

