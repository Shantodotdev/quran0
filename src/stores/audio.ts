import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Represents a single verse timing segment within a surah recitation file.
 * Used to highlight the active verse (ayah) on the page in sync with the audio track.
 */
export interface TimestampSegment {
  verse_key: string
  timestamp_from: number // Start time in milliseconds
  timestamp_to: number   // End time in milliseconds
  duration: number       // Segment duration in milliseconds
}

/**
 * Shape of the response returned by Quran.com's chapter recitations endpoint
 * when queried with the `segments=true` parameter.
 */
interface AudioFileResponse {
  audio_file: {
    audio_url: string
    timestamps?: TimestampSegment[]
  }
}

/**
 * Zustand store interface for managing global audio recitation state,
 * player preferences, and current playing verse timing segments.
 */
export interface AudioState {
  // Persisted state
  autoplay: boolean
  repeat: boolean
  playbackRate: number
  reciterId: number

  // Runtime state
  currentSurahId: number | null
  isPlaying: boolean
  currentTime: number
  duration: number
  isBuffering: boolean
  audioUrl: string | null
  timestamps: TimestampSegment[]
  activeVerseKey: string | null

  // Actions
  setAutoplay: (autoplay: boolean) => void
  setRepeat: (repeat: boolean) => void
  setPlaybackRate: (rate: number) => void
  setReciterId: (id: number) => void

  playSurah: (surahId: number) => Promise<void>
  togglePlay: () => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setBuffering: (buffering: boolean) => void
  stop: () => void
}

/**
 * Persistent Zustand store that manages Quran recitation audio playback.
 * 
 * Persists user playback settings (autoplay, repeat, playbackRate, and reciterId)
 * to localStorage under 'quran0-audio-settings'. Runtime states (currentTime, isPlaying,
 * activeVerseKey, etc.) are kept in memory to manage playback events reactively.
 */
export const useAudioStore = create<AudioState>()(
  persist(
    (set, get) => ({
      // Persisted defaults
      autoplay: true,
      repeat: false,
      playbackRate: 1.0,
      reciterId: 7, // Default reciter: Mishary Rashid Alafasy

      // Runtime defaults
      currentSurahId: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isBuffering: false,
      audioUrl: null,
      timestamps: [],
      activeVerseKey: null,

      setAutoplay: (autoplay) => set({ autoplay }),
      setRepeat: (repeat) => set({ repeat }),
      setPlaybackRate: (rate) => set({ playbackRate: rate }),
      setReciterId: (id) => set({ reciterId: id }),

      /**
       * Prepares and starts playback for the requested Surah.
       * Queries the Quran.com API to fetch timing segments for verse highlighting.
       * 
       * Provider Contract:
       * - API Endpoint: `https://api.quran.com/api/v4/chapter_recitations/{reciterId}/{surahId}?segments=true`
       * - Timestamps: Millisecond timing ranges mapping parts of the audio file to individual verses (e.g. `1:1`, `1:2`).
       * - Fallback behavior: If offline or the API fails, streams directly from the Al Quran Cloud CDN
       *   (`https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/{surahId}.mp3`) with timing segments disabled.
       */
      playSurah: async (surahId) => {
        // Reset player state immediately to prepare for the new track
        set({
          currentSurahId: surahId,
          isPlaying: true,
          isBuffering: true,
          currentTime: 0,
          duration: 0,
          activeVerseKey: null,
          timestamps: [],
          audioUrl: null,
        })

        const reciterId = get().reciterId

        try {
          // Fetch audio URL and segments from Quran.com API
          const response = await fetch(
            `https://api.quran.com/api/v4/chapter_recitations/${reciterId}/${surahId}?segments=true`,
          )

          if (!response.ok) {
            throw new Error(`API returned status ${response.status}`)
          }

          const data = (await response.json()) as AudioFileResponse
          const audioFile = data.audio_file

          set({
            audioUrl: audioFile.audio_url,
            timestamps: audioFile.timestamps || [],
            isBuffering: false,
          })
        } catch (error) {
          console.warn(
            `Failed to fetch audio metadata for surah ${surahId}, falling back to direct CDN:`,
            error,
          )

          // Fallback to direct CDN link if API is unavailable or offline
          set({
            audioUrl: `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${surahId}.mp3`,
            timestamps: [],
            isBuffering: false,
          })
        }
      },

      togglePlay: () => {
        const { isPlaying, currentSurahId } = get()
        if (currentSurahId !== null) {
          set({ isPlaying: !isPlaying })
        }
      },

      setPlaying: (playing) => set({ isPlaying: playing }),

      /**
       * Updates the current time of the player.
       * Maps the elapsed seconds (multiplied by 1000) to millisecond timing segments
       * to determine which verse (ayah) key is currently active.
       */
      setCurrentTime: (time) =>
        set((state) => {
          const currentTimeMs = time * 1000
          
          // Scan segment timestamps to find the verse key corresponding to the elapsed time
          const match = state.timestamps.find(
            (t) =>
              currentTimeMs >= t.timestamp_from &&
              currentTimeMs < t.timestamp_to,
          )

          return {
            currentTime: time,
            activeVerseKey: match ? match.verse_key : null,
          }
        }),

      setDuration: (duration) => set({ duration }),
      setBuffering: (buffering) => set({ isBuffering: buffering }),

      stop: () =>
        set({
          currentSurahId: null,
          isPlaying: false,
          currentTime: 0,
          duration: 0,
          audioUrl: null,
          timestamps: [],
          activeVerseKey: null,
          isBuffering: false,
        }),
    }),
    {
      name: 'quran0-audio-settings',
      // Only persist configuration preferences, not transient playback states
      partialize: (state) => ({
        autoplay: state.autoplay,
        repeat: state.repeat,
        playbackRate: state.playbackRate,
        reciterId: state.reciterId,
      }),
    },
  ),
)
