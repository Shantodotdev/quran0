import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 text-slate-950">
      <div className="mx-auto w-full max-w-md">
        <p className="text-sm font-medium text-teal-700">Quran0</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Quran website starter
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          TanStack Start is ready. We can build the Quran reader step by step
          from here.
        </p>
      </div>
    </main>
  )
}
