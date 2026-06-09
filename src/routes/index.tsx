import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import {
  getAllSurahs,
  getQuranSummary,
  getSurahsByLearningOrder,
} from '#/data/quran/quran-data'
import type { QuranSurah } from '#/data/quran/types'

export const Route = createFileRoute('/')({ component: Home })

type SortMode = 'surah-asc' | 'easy-hard' | 'hard-easy'

function Home() {
  const [sortMode, setSortMode] = useState<SortMode>('surah-asc')
  const summary = getQuranSummary()

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
      <header>
        <p className="text-sm font-semibold text-emerald-400">Quran0</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal">
          Quran Index
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {summary.surahCount} surahs, {summary.verseCount} ayahs
        </p>
      </header>

      <section className="grid gap-3 rounded-lg border border-(--app-border) bg-(--app-surface) p-3 shadow-sm">
        <label className="grid gap-1 text-sm font-medium text-slate-300">
          Sort
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="min-h-11 rounded-md border border-slate-700 bg-(--app-control) px-3 text-base text-slate-100 outline-none focus:border-emerald-500"
          >
            <option value="surah-asc">First to last surah</option>
            <option value="easy-hard">Easiest to hardest</option>
            <option value="hard-easy">Hardest to easiest</option>
          </select>
        </label>
      </section>

      <SurahList surahs={surahs} />
    </>
  )
}

function SurahList({ surahs }: { surahs: Array<QuranSurah> }) {
  return (
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
  )
}
