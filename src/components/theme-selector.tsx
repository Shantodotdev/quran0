import { useEffect, useRef, useState } from 'react'

const themes = [
  { value: 'dark', label: 'Dark', color: '#0d1117' },
  { value: 'white', label: 'White', color: '#f8f9fa' },
  { value: 'sepia', label: 'Sepia', color: '#f5e6c8' },
  { value: 'green', label: 'Green', color: '#1b4332' },
] as const

export type Theme = (typeof themes)[number]['value']

export function ThemeSelector() {
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [theme, setTheme] = useState<Theme>('dark')
  const menuRef = useRef<HTMLDivElement>(null)

  const current = themes.find((t) => t.value === theme)!

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
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => (visible ? close() : open())}
        className="flex h-9 items-center gap-2 rounded-full bg-(--app-surface) pl-3 pr-4 text-sm text-slate-300 transition-colors hover:text-slate-200 active:scale-95"
      >
        <span
          className="size-3.5 rounded-full ring-1 ring-white/10"
          style={{ backgroundColor: current.color }}
        />
        <span>{current.label}</span>
      </button>

      {visible && (
        <div
          className={`absolute right-0 top-full z-50 mt-1.5 w-40 overflow-hidden rounded-xl bg-(--app-surface-raised) py-1 shadow-lg shadow-black/50 ring-1 ring-(--app-border) ${
            closing ? 'animate-dropdown-out' : 'animate-dropdown-in'
          }`}
        >
          {themes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTheme(t.value)
                close()
              }}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-(--app-surface) ${
                theme === t.value
                  ? 'bg-(--app-surface) text-slate-200'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`size-4 shrink-0 rounded-full ring-1 ${
                  theme === t.value ? 'ring-2 ring-slate-400' : 'ring-white/10'
                }`}
                style={{ backgroundColor: t.color }}
              />
              <span className="flex-1 text-left">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
