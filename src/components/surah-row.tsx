import { Link } from '@tanstack/react-router'
import { Play, Pause } from 'lucide-react'
import { useAudioStore } from '#/stores/audio'
import type { QuranSurah } from '#/data/quran/types'

export function SurahRow({ surah }: { surah: QuranSurah }) {
  const { currentSurahId, isPlaying, playSurah, togglePlay } = useAudioStore()
  const isCurrent = surah.id === currentSurahId
  const isPlayingSurah = isCurrent && isPlaying

  return (
    <Link
      to="/surah/$surahId"
      params={{ surahId: String(surah.id) }}
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 p-3 rounded-xl transition-all ${
        isCurrent
          ? 'bg-(--app-accent-soft)/30 ring-1 ring-(--app-accent)/30'
          : 'hover:bg-(--app-surface)'
      }`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-(--app-accent-soft) text-lg font-semibold text-(--app-accent)">
        {isPlayingSurah ? (
          <span className="flex items-end justify-center gap-[2.5px] h-4 w-5">
            <span
              className="w-1 bg-(--app-accent) rounded-full animate-soundwave-1"
              style={{ height: '4px' }}
            />
            <span
              className="w-1 bg-(--app-accent) rounded-full animate-soundwave-2"
              style={{ height: '4px' }}
            />
            <span
              className="w-1 bg-(--app-accent) rounded-full animate-soundwave-3"
              style={{ height: '4px' }}
            />
          </span>
        ) : (
          surah.id
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-base font-semibold text-(--app-text-primary)">
          {surah.nameSimple}
        </span>
        <span className="mt-0.5 block truncate text-sm text-(--app-text-tertiary)">
          {surah.banglaName} | {surah.translatedNameBn}
        </span>
      </span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          if (isCurrent) {
            togglePlay()
          } else {
            playSurah(surah.id).catch(console.warn)
          }
        }}
        className={`flex size-9 items-center justify-center rounded-lg border transition-colors ${
          isPlayingSurah
            ? 'border-(--app-accent)/40 bg-(--app-accent-soft) text-(--app-accent)'
            : 'border-transparent text-(--app-text-tertiary) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary)'
        }`}
        title={isPlayingSurah ? 'Pause recitation' : 'Play recitation'}
      >
        {isPlayingSurah ? (
          <Pause className="size-4 fill-current" />
        ) : (
          <Play className="size-4 fill-current translate-x-px" />
        )}
      </button>
    </Link>
  )
}
