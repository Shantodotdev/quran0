import { X } from 'lucide-react'

interface SettingsSidebarProps {
  open: boolean
  onClose: () => void
}

export function SettingsSidebar({ open, onClose }: SettingsSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-60 bg-black/50 transition-opacity duration-350 ease-out ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 z-70 h-full w-80 border-l border-(--app-border) bg-(--app-bg) shadow-2xl transition-transform duration-350 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-(--app-border) px-4 py-4">
          <h2 className="text-lg font-semibold text-(--app-text-primary)">
            Settings
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-(--app-text-tertiary) transition-colors hover:bg-(--app-hover-bg) hover:text-(--app-text-primary)"
            aria-label="Close settings"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </>
  )
}
