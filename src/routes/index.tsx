import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { getAllSurahs, getSurahsByLearningOrder } from '#/data/quran/quran-data'
import { SurahRow } from '#/components/surah-row'

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
                ? 'bg-(--app-control) text-(--app-text-primary) shadow-sm'
                : 'text-(--app-text-secondary) hover:text-(--app-text-primary)'
            }`}
          >
            {option.label}
          </button>
        ))}
      </section>

      <div className="grid gap-2">
        {surahs.map((surah) => (
          <SurahRow key={surah.id} surah={surah} />
        ))}
      </div>
    </>
  )
}
