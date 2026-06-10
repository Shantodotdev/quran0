import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/progress')({ component: ProgressPage })

function ProgressPage() {
  return (
    <header className="rounded-lg border border-(--app-border) bg-(--app-surface) p-4 shadow-sm">
      <Link to="/" className="text-sm font-medium text-(--app-accent)">
        Back to Quran Index
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-normal">Progress</h1>
    </header>
  )
}
