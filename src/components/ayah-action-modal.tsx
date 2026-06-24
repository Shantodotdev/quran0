import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Play, Bookmark } from 'lucide-react'

interface AyahActionModalProps {
  verseKey: string
  isOpen: boolean
  onClose: () => void
  onPlayFromAyah: () => void
}

export function AyahActionModal({
  verseKey,
  isOpen,
  onClose,
  onPlayFromAyah,
}: AyahActionModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 animate-fade-in bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={`Actions for verse ${verseKey}`}
        className="relative w-full max-w-lg animate-slide-up-from-bottom rounded-t-2xl bg-(--app-surface) px-5 pb-8 pt-5 shadow-2xl"
      >
        <div className="mb-1 flex items-center justify-center">
          <div className="h-1 w-10 rounded-full bg-(--app-border)" />
        </div>
        <div className="mb-1 text-center">
          <p className="text-xs font-medium text-(--app-text-tertiary) uppercase tracking-wider">
            Ayah {verseKey}
          </p>
        </div>
        <div className="mt-4 grid gap-1.5">
          <button
            type="button"
            onClick={() => {
              onPlayFromAyah()
              onClose()
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium text-(--app-text-primary) transition-colors hover:bg-(--app-hover-bg)"
          >
            <Play className="size-5 shrink-0 text-(--app-accent)" />
            <span>Play recitation from this ayah</span>
          </button>
          <button
            type="button"
            disabled
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3.5 text-left text-sm font-medium text-(--app-text-tertiary) transition-colors"
          >
            <Bookmark className="size-5 shrink-0 text-(--app-text-muted)" />
            <span>Bookmark ayah</span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
