import { Link, useRouterState } from '@tanstack/react-router'
import { Activity, BookOpen } from 'lucide-react'

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isQuranActive = pathname === '/' || pathname.startsWith('/surah')
  const isProgressActive = pathname.startsWith('/progress')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-(--app-border) bg-(--app-surface-raised) px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-2">
        <Link
          to="/"
          className={getNavItemClassName(isQuranActive)}
          aria-label="Quran Index"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
          <span>Quran</span>
        </Link>
        <Link
          to="/progress"
          className={getNavItemClassName(isProgressActive)}
          aria-label="Progress"
        >
          <Activity className="h-5 w-5" aria-hidden="true" />
          <span>Progress</span>
        </Link>
      </div>
    </nav>
  )
}

function getNavItemClassName(isActive: boolean) {
  return [
    'flex min-h-12 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors',
    isActive
      ? 'bg-(--app-accent-bg) text-(--app-accent-text)'
      : 'text-(--app-text-muted) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary)',
  ].join(' ')
}
