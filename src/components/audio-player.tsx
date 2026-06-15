import { useEffect, useRef } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Play,
  Pause,
  X,
  SkipForward,
  SkipBack,
  Repeat,
  Loader2,
} from 'lucide-react'
import { useAudioStore, getReciterName } from '#/stores/audio'
import { getSurahById } from '#/data/quran/quran-data'

export function AudioPlayer() {
  const {
    currentSurahId,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    autoplay,
    repeat,
    isBuffering,
    audioUrl,
    reciterId,
    setPlaying,
    setCurrentTime,
    setDuration,
    setBuffering,
    setPlaybackRate,
    setAutoplay,
    setRepeat,
    playSurah,
    stop,
  } = useAudioStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const lastSurahIdRef = useRef<number | null>(null)

  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const surah = currentSurahId ? getSurahById(currentSurahId) : null

  // Route auto-switching: if user is on a surah page and the surah changes, switch view to it
  useEffect(() => {
    if (currentSurahId && currentSurahId !== lastSurahIdRef.current) {
      lastSurahIdRef.current = currentSurahId
      if (pathname.startsWith('/surah/')) {
        navigate({
          to: '/surah/$surahId',
          params: { surahId: String(currentSurahId) },
        }).catch(console.warn)
      }
    }
  }, [currentSurahId, pathname, navigate])

  // Sync isPlaying with HTML audio play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return

    if (isPlaying) {
      audio.play().catch((err) => {
        console.warn('Playback failed or interrupted:', err)
        setPlaying(false)
      })
    } else {
      audio.pause()
    }
  }, [isPlaying, audioUrl, setPlaying])

  // Helper to re-apply stored playback rate
  const syncPlaybackRate = () => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }

  // Sync playback rate when it changes
  useEffect(() => {
    syncPlaybackRate()
  }, [playbackRate, audioUrl])

  // Sync position state with lock screen media player
  useEffect(() => {
    if (
      'mediaSession' in navigator &&
      duration > 0 &&
      !isNaN(duration) &&
      !isNaN(currentTime) &&
      !isNaN(playbackRate)
    ) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: playbackRate,
          position: Math.max(0, Math.min(currentTime, duration)),
        })
      } catch (err) {
        console.warn('Error setting mediaSession position state:', err)
      }
    }
  }, [currentTime, duration, playbackRate])

  // Media Session API Sync for lock screen controls
  useEffect(() => {
    if (!surah || !('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: surah.nameSimple,
      artist: getReciterName(reciterId),
      album: 'Quran Recitation',
      artwork: [
        { src: '/logo.png', sizes: '192x192', type: 'image/png' },
        { src: '/logo.png', sizes: '512x512', type: 'image/png' },
      ],
    })

    navigator.mediaSession.setActionHandler('play', () => setPlaying(true))
    navigator.mediaSession.setActionHandler('pause', () => setPlaying(false))

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (currentSurahId && currentSurahId > 1) {
        playSurah(currentSurahId - 1)
      }
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (currentSurahId && currentSurahId < 114) {
        playSurah(currentSurahId + 1)
      }
    })

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null)
        navigator.mediaSession.setActionHandler('pause', null)
        navigator.mediaSession.setActionHandler('previoustrack', null)
        navigator.mediaSession.setActionHandler('nexttrack', null)
      }
    }
  }, [surah, currentSurahId, reciterId, playSurah, setPlaying])

  if (!currentSurahId || !surah) return null

  // Format seconds to mm:ss or h:mm:ss
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00'
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = Math.floor(secs % 60)
    const sStr = s < 10 ? `0${s}` : s
    if (h > 0) {
      const mStr = m < 10 ? `0${m}` : m
      return `${h}:${mStr}:${sStr}`
    }
    return `${m}:${sStr}`
  }

  const cycleSpeed = () => {
    const speeds = [1.0, 1.5, 2.0]
    const current = Number(playbackRate) || 1.0
    // Find closest speed using simple epsilon to avoid floating point bugs
    const currentIndex = speeds.findIndex((s) => Math.abs(s - current) < 0.01)
    const nextIndex =
      currentIndex === -1 ? 1 : (currentIndex + 1) % speeds.length
    setPlaybackRate(speeds[nextIndex])
  }

  const handlePrev = () => {
    if (currentSurahId > 1) {
      playSurah(currentSurahId - 1)
    }
  }

  const handleNext = () => {
    if (currentSurahId < 114) {
      playSurah(currentSurahId + 1)
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="fixed bottom-[calc(70px+env(safe-area-inset-bottom))] left-4 right-4 z-40 mx-auto w-[calc(100%-2rem)] max-w-xl animate-fade-in-up rounded-xl border border-(--app-border) bg-(--app-surface-raised)/90 p-3.5 shadow-xl backdrop-blur-md md:bottom-[calc(76px+env(safe-area-inset-bottom))]">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onPlay={() => {
          setPlaying(true)
          syncPlaybackRate()
        }}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={syncPlaybackRate}
        onCanPlay={syncPlaybackRate}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime)
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={() => {
          if (repeat) {
            // Loop single surah
            if (audioRef.current) {
              audioRef.current.currentTime = 0
              audioRef.current.play().catch(console.warn)
            }
          } else if (autoplay && currentSurahId < 114) {
            // Autoplay next surah
            playSurah(currentSurahId + 1)
          } else {
            setPlaying(false)
          }
        }}
      />

      <div className="flex flex-col gap-2.5">
        {/* Top details row */}
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-bold text-(--app-text-primary)">
              {surah.nameSimple}
            </h4>
            <p className="truncate text-xs text-(--app-text-tertiary)">
              {surah.banglaName} · Reciter: {getReciterName(reciterId)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cycleSpeed}
              className="flex h-7 items-center justify-center rounded bg-(--app-control) px-2 text-xs font-semibold text-(--app-text-secondary) hover:text-(--app-text-primary) transition-colors border border-(--app-border)"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={() => setAutoplay(!autoplay)}
              className={`flex h-7 items-center justify-center rounded px-2 text-xs font-bold border transition-colors ${
                autoplay
                  ? 'border-(--app-accent)/40 bg-(--app-accent-soft) text-(--app-accent)'
                  : 'border-(--app-border) bg-(--app-control) text-(--app-text-secondary) hover:text-(--app-text-primary)'
              }`}
              title={
                autoplay
                  ? 'Autoplay Next Surah Enabled'
                  : 'Autoplay Next Surah Disabled'
              }
            >
              Autoplay
            </button>

            <button
              type="button"
              onClick={() => setRepeat(!repeat)}
              className={`relative flex size-7 items-center justify-center rounded border transition-colors ${
                repeat
                  ? 'border-(--app-accent)/40 bg-(--app-accent-soft) text-(--app-accent)'
                  : 'border-(--app-border) bg-(--app-control) text-(--app-text-tertiary) hover:text-(--app-text-primary)'
              }`}
              title={
                repeat
                  ? 'Repeat Current Surah Enabled'
                  : 'Repeat Current Surah Disabled'
              }
            >
              <Repeat className="size-3.5" />
              {repeat && (
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-(--app-accent) text-[8px] font-black text-(--app-accent-text) leading-none ring-1 ring-(--app-surface-raised)">
                  1
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={stop}
              className="flex size-7 items-center justify-center rounded border border-(--app-border) bg-(--app-control) text-(--app-text-tertiary) hover:text-(--app-text-primary) transition-colors"
              title="Close Player"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Progress bar (Read-only) */}
        <div className="flex items-center gap-2.5">
          <span className="w-9 text-right text-[10px] font-medium text-(--app-text-tertiary) tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="relative flex-1 py-2">
            <div className="h-1 w-full rounded-full bg-(--app-border) overflow-hidden">
              <div
                className="h-full bg-(--app-accent) transition-all duration-100 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <span className="w-9 text-left text-[10px] font-medium tabular-nums text-(--app-text-tertiary)">
            {formatTime(duration)}
          </span>
        </div>

        {/* Media controls */}
        <div className="flex items-center justify-center gap-5 mt-0.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSurahId <= 1}
            className="flex size-8 items-center justify-center rounded-lg text-(--app-text-secondary) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary) disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Previous Surah"
          >
            <SkipBack className="size-4.5" />
          </button>

          <button
            type="button"
            onClick={() => useAudioStore.getState().togglePlay()}
            disabled={!audioUrl && !isBuffering}
            className="flex size-10 items-center justify-center rounded-full bg-(--app-accent) text-(--app-accent-text) shadow hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isBuffering ? (
              <Loader2 className="size-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={currentSurahId >= 114}
            className="flex size-8 items-center justify-center rounded-lg text-(--app-text-secondary) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary) disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            title="Next Surah"
          >
            <SkipForward className="size-4.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
