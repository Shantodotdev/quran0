import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  arabicFontSize: number
  englishFontSize: number
  bengaliFontSize: number
  displayEnglishSpelling: boolean
  displayBengaliMeaning: boolean

  setArabicFontSize: (size: number) => void
  setEnglishFontSize: (size: number) => void
  setBengaliFontSize: (size: number) => void
  setDisplayEnglishSpelling: (display: boolean) => void
  setDisplayBengaliMeaning: (display: boolean) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      arabicFontSize: 26,
      englishFontSize: 15,
      bengaliFontSize: 14,
      displayEnglishSpelling: true,
      displayBengaliMeaning: true,

      setArabicFontSize: (size) => set({ arabicFontSize: size }),
      setEnglishFontSize: (size) => set({ englishFontSize: size }),
      setBengaliFontSize: (size) => set({ bengaliFontSize: size }),
      setDisplayEnglishSpelling: (display) =>
        set({ displayEnglishSpelling: display }),
      setDisplayBengaliMeaning: (display) =>
        set({ displayBengaliMeaning: display }),
      resetSettings: () =>
        set({
          arabicFontSize: 26,
          englishFontSize: 15,
          bengaliFontSize: 14,
          displayEnglishSpelling: true,
          displayBengaliMeaning: true,
        }),
    }),
    {
      name: 'quran0-settings',
    },
  ),
)
