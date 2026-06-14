import { useEffect, useState } from 'react'

/**
 * Sticky full-width reading progress bar that fills as the user scrolls
 * through the page. Pinned below the navbar (top-20) and sits below the
 * settings sidebar in the stacking order (z-40).
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight
      const winHeight = window.innerHeight
      const maxScroll = docHeight - winHeight
      setProgress(maxScroll > 0 ? Math.min(scrollTop / maxScroll, 1) : 0)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    // Observe size changes of the document element (e.g., when verses load/render or font sizes change)
    const observer = new ResizeObserver(onScroll)
    observer.observe(document.documentElement)

    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="sticky top-20 z-40 -mx-4 sm:-mx-6 w-screen">
      <div className="h-1 ">
        <div
          className="h-full rounded-full bg-(--app-accent) transition-[width] duration-200 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  )
}
