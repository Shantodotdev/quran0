import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { getAllSurahs, getSurahsByLearningOrder } from '#/data/quran/quran-data'

export const Route = createFileRoute('/')({ component: Home })

type SortMode = 'surah-asc' | 'easy-hard' | 'hard-easy'

function Home() {
  const [sortMode, setSortMode] = useState<SortMode>('surah-asc')

  const surahs = useMemo(() => {
    if (sortMode === 'easy-hard') {
      return getSurahsByLearningOrder('asc')
    }

    if (sortMode === 'hard-easy') {
      return getSurahsByLearningOrder('desc')
    }

    return getAllSurahs()
  }, [sortMode])

  return (
    <>
      <section className="flex gap-1 rounded-xl bg-(--app-surface) p-1 shadow-sm ring-1 ring-(--app-border)">
        {(
          [
            { value: 'surah-asc', label: 'Default' },
            { value: 'easy-hard', label: 'Easiest' },
            { value: 'hard-easy', label: 'Hardest' },
          ] as { value: SortMode; label: string }[]
        ).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSortMode(option.value)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
              sortMode === option.value
                ? 'bg-(--app-control) text-slate-100 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </section>

      <div className="grid gap-2">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            to="/surah/$surahId"
            params={{ surahId: String(surah.id) }}
            className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-(--app-border) bg-(--app-surface) p-3 shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/15 text-lg font-semibold text-emerald-300">
              {surah.id}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-slate-100">
                {surah.nameSimple}
              </span>
              <span className="mt-0.5 block truncate text-sm text-slate-400">
                {surah.banglaName} | {surah.translatedNameBn}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  )
}
