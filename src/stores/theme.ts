import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'dark' | 'white' | 'sepia' | 'green'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'quran0-theme',
    },
  ),
)
