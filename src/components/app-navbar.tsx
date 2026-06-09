import { Search } from 'lucide-react'
import { ThemeSelector } from './theme-selector'

export function AppNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-(--app-border) bg-(--app-bg)">
      <nav className="mx-auto flex h-20 max-w-2xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Quran0" className="h-14 w-14" />
          <span className="font-['Pacifico'] text-xl">Quran0</span>
        </a>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-(--app-surface) hover:text-slate-200"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <ThemeSelector />
        </div>
      </nav>
    </header>
  )
}
