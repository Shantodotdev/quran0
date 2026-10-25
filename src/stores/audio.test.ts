import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AVAILABLE_RECITERS, getReciterName, useAudioStore } from './audio'
import type { TimestampSegment } from './audio'

const timestamps: TimestampSegment[] = [
  {
    verse_key: '1:1',
    timestamp_from: 0,
    timestamp_to: 2_000,
    duration: 2_000,
  },
  {
    verse_key: '1:2',
    timestamp_from: 2_000,
    timestamp_to: 4_000,
    duration: 2_000,
  },
]

beforeEach(() => {
  useAudioStore.setState({
    autoplay: true,
    repeat: false,
    playbackRate: 1,
    reciterId: 7,
    currentSurahId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    isBuffering: false,
    audioUrl: null,
    timestamps: [],
    activeVerseKey: null,
    seekTimeTarget: null,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('audio store', () => {
  it('returns the configured reciter name and a safe fallback', () => {
    expect(AVAILABLE_RECITERS).toContainEqual({
      id: 7,
      name: 'Mishary Rashid Alafasy',
    })
    expect(getReciterName(7)).toBe('Mishary Rashid Alafasy')
    expect(getReciterName(999)).toBe('Unknown Reciter')
  })

  it('maps playback time to the active verse timing segment', () => {
    useAudioStore.setState({ timestamps })

    useAudioStore.getState().setCurrentTime(2.5)

    expect(useAudioStore.getState().currentTime).toBe(2.5)
    expect(useAudioStore.getState().activeVerseKey).toBe('1:2')

    useAudioStore.getState().setCurrentTime(4)

    expect(useAudioStore.getState().activeVerseKey).toBeNull()
  })

  it('only seeks to a verse while playback is active', () => {
    useAudioStore.setState({ timestamps })

    useAudioStore.getState().seekToVerse('1:2')
    expect(useAudioStore.getState().seekTimeTarget).toBeNull()

    useAudioStore.setState({ isPlaying: true })
    useAudioStore.getState().seekToVerse('1:2')

    expect(useAudioStore.getState().seekTimeTarget).toBe(2)
  })

  it('loads audio metadata and timing segments from the recitation API', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        audio_file: {
          audio_url: 'https://cdn.example.com/surah-1.mp3',
          timestamps,
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await useAudioStore.getState().playSurah(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.quran.com/api/v4/chapter_recitations/7/1?segments=true',
    )
    expect(useAudioStore.getState()).toMatchObject({
      currentSurahId: 1,
      isPlaying: true,
      isBuffering: false,
      audioUrl: 'https://cdn.example.com/surah-1.mp3',
      timestamps,
    })
  })

  it('falls back to the direct CDN when the recitation API is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    await useAudioStore.getState().playSurah(2)

    expect(useAudioStore.getState()).toMatchObject({
      currentSurahId: 2,
      isPlaying: true,
      isBuffering: false,
      audioUrl:
        'https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/2.mp3',
      timestamps: [],
    })
  })
})
