import { useState } from 'react'
import { Search, Settings } from 'lucide-react'
import { SettingsSidebar } from './settings-sidebar'
import { Link } from '@tanstack/react-router'

export function Navbar() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-(--app-border) bg-(--app-bg)">
      <nav className="mx-auto flex h-20 max-w-2xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Quran0" className="h-14 w-14" />
          <span className="text-xl font-semibold tracking-tight">Quran0</span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-lg text-(--app-text-tertiary) transition-colors hover:bg-(--app-surface) hover:text-(--app-text-primary)"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-(--app-text-tertiary) transition-colors hover:bg-(--app-surface) hover:text-(--app-text-primary)"
            aria-label="Settings"
          >
            <Settings className="size-5" />
          </button>

          <SettingsSidebar
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
        </div>
      </nav>
    </header>
  )
}
