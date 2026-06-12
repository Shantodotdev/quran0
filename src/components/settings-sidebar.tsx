import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useSettingsStore } from '#/stores/settings'
import { ThemeSelector } from './theme-selector'

interface SettingsSidebarProps {
  open: boolean
  onClose: () => void
}

/**
 * Numeric stepper with minus/plus buttons for adjusting a font-size value.
 * Clamps between min and max; disables the corresponding button at each bound.
 */
function SizeStepper({
  label,
  value,
  min,
  max,
  onIncrease,
  onDecrease,
}: {
  label: string
  value: number
  min: number
  max: number
  onIncrease: () => void
  onDecrease: () => void
}) {
  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-(--app-text-primary)">
        {label}
      </span>
      <div className="flex items-center justify-between rounded-xl bg-(--app-control) px-3 py-2">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= min}
          aria-label="Decrease"
          className="flex size-9 items-center justify-center rounded-lg text-(--app-text-secondary) disabled:opacity-40"
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-[3ch] text-center text-base font-semibold tabular-nums text-(--app-text-primary)">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          disabled={value >= max}
          aria-label="Increase"
          className="flex size-9 items-center justify-center rounded-lg text-(--app-text-secondary) disabled:opacity-40"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  )
}

/**
 * Accessible toggle switch (role="switch") that renders a sliding circle
 * and an accent/control background based on the checked state.
 */
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-(--app-text-primary)">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-250 ease-out focus:outline-none ${
          checked ? 'bg-(--app-accent)' : 'bg-(--app-control)'
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-5.5 rounded-full bg-white shadow-md ring-0 transition-transform duration-250 ease-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

/**
 * Slide-in settings panel from the right edge of the screen.
 *
 * - Locks body scroll while open.
 * - Supports drag-to-close via pointer events: dragging the panel right
 *   beyond 100px fires onClose; otherwise it snaps back in place.
 * - The overlay darkens the background and can also be tapped to close.
 */
export function SettingsSidebar({ open, onClose }: SettingsSidebarProps) {
  const {
    arabicFontSize,
    englishFontSize,
    bengaliFontSize,
    displayEnglishSpelling,
    displayBengaliMeaning,
    setArabicFontSize,
    setEnglishFontSize,
    setBengaliFontSize,
    setDisplayEnglishSpelling,
    setDisplayBengaliMeaning,
  } = useSettingsStore()

  // --- drag-to-close state ---
  const panelRef = useRef<HTMLDivElement>(null)
  const dragX = useRef(0) // pointer X when the drag started
  const [translateX, setTranslateX] = useState(0) // live pixel offset
  const [dragging, setDragging] = useState(false)

  // --- lock body scroll while sidebar is open ---
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      // reset drag position each time it opens
      setTranslateX(0)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  /** Record the starting pointer position and begin tracking the drag. */
  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true)
    dragX.current = e.clientX
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  /** Calculate how far the panel has been dragged to the right (clamped ≥ 0). */
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return
    const delta = e.clientX - dragX.current
    setTranslateX(Math.max(0, delta))
  }

  /**
   * End the drag. If the panel was dragged past 100px, close it.
   * Otherwise snap it back to its resting position.
   */
  function handlePointerUp(e: React.PointerEvent) {
    if (!dragging) return
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)

    if (translateX > 100) {
      onClose()
    }
    setTranslateX(0)
  }

  return (
    <>
      {/* Overlay — tap to close */}
      <div
        className={`fixed inset-0 z-60 bg-black/50 transition-opacity duration-350 ease-out ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Panel — draggable slide-in container */}
      <div
        ref={panelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`fixed right-0 top-0 z-70 flex h-full w-80 flex-col border-l border-(--app-border) bg-(--app-bg) shadow-2xl ${
          dragging
            ? '' // manual transform when dragging (no transition)
            : open
              ? 'translate-x-0 transition-transform duration-350 ease-out'
              : 'translate-x-full transition-transform duration-350 ease-out'
        }`}
        style={
          dragging ? { transform: `translateX(${translateX}px)` } : undefined
        }
      >
        {/* Header — title and close button */}
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

        {/* Scrollable body — font steppers, theme selector, toggles */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="flex flex-col gap-6">
            <SizeStepper
              label="Arabic Font Size"
              value={arabicFontSize}
              min={16}
              max={48}
              onIncrease={() => setArabicFontSize(arabicFontSize + 1)}
              onDecrease={() => setArabicFontSize(arabicFontSize - 1)}
            />

            <div className="h-px bg-(--app-border)" />

            <SizeStepper
              label="English Font Size"
              value={englishFontSize}
              min={10}
              max={28}
              onIncrease={() => setEnglishFontSize(englishFontSize + 1)}
              onDecrease={() => setEnglishFontSize(englishFontSize - 1)}
            />

            <div className="h-px bg-(--app-border)" />

            <SizeStepper
              label="Bengali Font Size"
              value={bengaliFontSize}
              min={10}
              max={28}
              onIncrease={() => setBengaliFontSize(bengaliFontSize + 1)}
              onDecrease={() => setBengaliFontSize(bengaliFontSize - 1)}
            />

            <div className="h-px bg-(--app-border)" />

            <section>
              <span className="mb-2 block text-sm font-medium text-(--app-text-primary)">
                Theme
              </span>
              <ThemeSelector />
            </section>

            <div className="h-px bg-(--app-border)" />

            <section className="flex flex-col gap-4">
              <Toggle
                label="Display English Spelling"
                checked={displayEnglishSpelling}
                onChange={setDisplayEnglishSpelling}
              />
              <Toggle
                label="Display Bengali Meaning"
                checked={displayBengaliMeaning}
                onChange={setDisplayBengaliMeaning}
              />
            </section>
          </div>
        </div>
      </div>
    </>
  )
}
