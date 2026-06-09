import { Link, createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import {
  getAllSurahs,
  getQuranSummary,
  getSurahsByLearningOrder,
} from '#/data/quran/quran-data'
import type { QuranSurah, SurahLearningTier } from '#/data/quran/types'

export const Route = createFileRoute('/')({ component: Home })

type SortMode = 'surah-asc' | 'easy-hard' | 'hard-easy'
type GroupMode = 'none' | 'tier'

const tierOrder: Array<SurahLearningTier> = [
  'Beginner',
  'Easy-medium',
  'Medium-hard',
  'Hardest',
]

function Home() {
  const [sortMode, setSortMode] = useState<SortMode>('surah-asc')
  const [groupMode, setGroupMode] = useState<GroupMode>('none')
  const summary = getQuranSummary()

  const sortedSurahs = useMemo(() => {
    if (sortMode === 'easy-hard') {
      return getSurahsByLearningOrder('asc')
    }

    if (sortMode === 'hard-easy') {
      return getSurahsByLearningOrder('desc')
    }

    return getAllSurahs()
  }, [sortMode])

  const groupedSurahs = useMemo(() => {
    return tierOrder
      .map((tier) => ({
        tier,
        surahs: sortedSurahs.filter((surah) => surah.learningTier === tier),
      }))
      .filter((group) => group.surahs.length > 0)
  }, [sortedSurahs])

  return (
    <main className="min-h-screen bg-stone-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Quran0</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal">
              Quran Index
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {summary.surahCount} surahs, {summary.verseCount} ayahs
            </p>
          </div>
          <Link
            to="/progress"
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm"
          >
            Progress
          </Link>
        </header>

        <section className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Sort
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="min-h-11 rounded-md border border-slate-200 bg-white px-3 text-base text-slate-950 outline-none focus:border-emerald-600"
            >
              <option value="surah-asc">First to last surah</option>
              <option value="easy-hard">Easiest to hardest</option>
              <option value="hard-easy">Hardest to easiest</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3 text-sm font-medium text-slate-700">
            Group by learning tier
            <input
              type="checkbox"
              checked={groupMode === 'tier'}
              onChange={(event) =>
                setGroupMode(event.target.checked ? 'tier' : 'none')
              }
              className="h-5 w-5 accent-emerald-700"
            />
          </label>
        </section>

        {groupMode === 'tier' ? (
          <div className="grid gap-6">
            {groupedSurahs.map((group) => (
              <section key={group.tier} className="grid gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-normal text-slate-500">
                  {group.tier}
                </h2>
                <SurahList surahs={group.surahs} />
              </section>
            ))}
          </div>
        ) : (
          <SurahList surahs={sortedSurahs} />
        )}
      </div>
    </main>
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
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-sm font-semibold text-emerald-800">
            {surah.id}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-slate-950">
              {surah.nameSimple}
            </span>
            <span className="mt-0.5 block truncate text-sm text-slate-500">
              {surah.translatedNameBn} · {surah.versesCount} ayahs · Rank{' '}
              {surah.learningRank}
            </span>
          </span>
          <span
            className="quran-arabic text-right text-xl leading-none text-slate-800"
            dir="rtl"
          >
            {surah.nameArabic}
          </span>
        </Link>
      ))}
    </div>
  )
}
