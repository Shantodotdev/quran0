import { useEffect, useRef, useState } from 'react'
import { Headphones, ChevronDown, Check } from 'lucide-react'
import { useAudioStore, AVAILABLE_RECITERS } from '#/stores/audio'

export function ReciterSelector() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const reciterId = useAudioStore((s) => s.reciterId)
  const setReciterId = useAudioStore((s) => s.setReciterId)
  const currentSurahId = useAudioStore((s) => s.currentSurahId)
  const playSurah = useAudioStore((s) => s.playSurah)

  const menuRef = useRef<HTMLDivElement>(null)

  const activeReciter =
    AVAILABLE_RECITERS.find((r) => r.id === reciterId) || AVAILABLE_RECITERS[0]

  function open() {
    setVisible(true)
    setClosing(false)
  }

  function close() {
    setClosing(true)
  }

  useEffect(() => {
    if (!closing) return
    const timer = setTimeout(() => {
      setVisible(false)
      setClosing(false)
    }, 150)
    return () => clearTimeout(timer)
  }, [closing])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close()
      }
    }
    if (visible) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [visible])

  return (
    <div className="relative font-sans" ref={menuRef}>
      <button
        type="button"
        onClick={() => (visible ? close() : open())}
        className="flex w-full items-center justify-between gap-2 rounded-xl bg-(--app-control) px-3 py-2.5 text-sm font-medium text-(--app-text-primary) transition-colors hover:bg-(--app-hover-bg) cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Headphones className="size-4 shrink-0 text-(--app-text-tertiary)" />
          <span className="truncate text-left">{activeReciter.name}</span>
        </div>
        <ChevronDown
          className={`size-4 shrink-0 text-(--app-text-tertiary) transition-transform duration-150 ${
            visible ? 'rotate-180' : ''
          }`}
        />
      </button>

      {visible && (
        <div
          className={`absolute left-0 bottom-full z-50 mb-1 w-full overflow-hidden rounded-xl bg-(--app-surface-raised) py-1 shadow-lg shadow-black/50 ring-1 ring-(--app-border) ${
            closing ? 'animate-dropdown-up-out' : 'animate-dropdown-up-in'
          }`}
        >
          {AVAILABLE_RECITERS.map((r) => {
            const isSelected = r.id === reciterId
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setReciterId(r.id)
                  if (currentSurahId !== null) {
                    playSurah(currentSurahId).catch(console.warn)
                  }
                  close()
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-(--app-hover-bg) cursor-pointer focus:outline-none ${
                  isSelected
                    ? 'bg-(--app-hover-bg) text-(--app-text-primary)'
                    : 'text-(--app-text-tertiary)'
                }`}
              >
                <div className="flex-1 text-left truncate">
                  <span className={isSelected ? 'font-semibold' : ''}>
                    {r.name}
                  </span>
                </div>
                {isSelected && (
                  <Check className="size-4 shrink-0 text-(--app-accent)" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
