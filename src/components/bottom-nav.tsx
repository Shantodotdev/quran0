import { Link, useRouterState } from '@tanstack/react-router'
import { BookOpen, Bookmark, Brain, TrendingUp } from 'lucide-react'

export function BottomNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isQuranActive = pathname === '/' || pathname.startsWith('/surah')
  const isBookmarksActive = pathname.startsWith('/bookmarks')
  const isProgressActive = pathname.startsWith('/progress')
  const isMemorizeActive = pathname.startsWith('/memorize')

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-(--app-border) bg-(--app-surface-raised) px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur">
      <div className="mx-auto grid max-w-2xl grid-cols-4 gap-2">
        <Link
          to="/"
          className={getNavItemClassName(isQuranActive)}
          aria-label="Quran Index"
        >
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          to="/bookmarks"
          className={getNavItemClassName(isBookmarksActive)}
          aria-label="Bookmarks"
        >
          <Bookmark className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          to="/progress"
          className={getNavItemClassName(isProgressActive)}
          aria-label="Progress"
        >
          <TrendingUp className="h-5 w-5" aria-hidden="true" />
        </Link>
        <Link
          to="/memorize"
          className={getNavItemClassName(isMemorizeActive)}
          aria-label="Memorization Helper"
        >
          <Brain className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}

function getNavItemClassName(isActive: boolean) {
  return [
    'flex min-h-12 items-center justify-center rounded-lg transition-colors',
    isActive
      ? 'bg-(--app-accent-bg) text-(--app-accent-text)'
      : 'text-(--app-text-muted)',
  ].join(' ')
}
