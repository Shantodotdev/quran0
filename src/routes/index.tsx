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

        <label className="flex items-center justify-between gap-3 rounded-md border border-slate-700 px-3 py-3 text-sm font-medium text-slate-300">
          Group by learning tier
          <input
            type="checkbox"
            checked={groupMode === 'tier'}
            onChange={(event) =>
              setGroupMode(event.target.checked ? 'tier' : 'none')
            }
            className="h-5 w-5 accent-emerald-500"
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
          className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-(--app-border) bg-(--app-surface) p-3 shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-500/15 text-sm font-semibold text-emerald-300">
            {surah.id}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-slate-100">
              {surah.nameSimple}
            </span>
            <span className="mt-0.5 block truncate text-sm text-slate-400">
              {surah.translatedNameBn} | {surah.versesCount} ayahs | Rank{' '}
              {surah.learningRank}
            </span>
          </span>
          <span
            className="quran-arabic text-right text-xl leading-none text-slate-100"
            dir="rtl"
          >
            {surah.nameArabic}
          </span>
        </Link>
      ))}
    </div>
  )
}
