import { Link, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/progress')({ component: ProgressPage })

function ProgressPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8">
        <header className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <Link to="/" className="text-sm font-medium text-emerald-700">
            Back to Quran Index
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-normal">
            Progress
          </h1>
        </header>
      </div>
    </main>
  )
}
