import { useRef } from 'react'

interface SwipeConfig {
  /** Callback triggered when swiped to the left (finger moves left, e.g. next page) */
  onSwipeLeft?: () => void
  /** Callback triggered when swiped to the right (finger moves right, e.g. prev page) */
  onSwipeRight?: () => void
  /** Pixels of drag required to trigger the swipe action (default: 100) */
  threshold?: number
  /** Enable resistance on left-swipe (next) at boundaries (e.g. last page) */
  resistanceLeftBoundary?: boolean
  /** Enable resistance on right-swipe (prev) at boundaries (e.g. first page) */
  resistanceRightBoundary?: boolean
}

/**
 * Custom hook to handle high-performance, hardware-accelerated horizontal swipe gestures.
 * Direct DOM manipulation of the element's transform is used during active dragging
 * to bypass React's rendering loop, ensuring buttery smooth 60fps/120fps movements.
 */
export function useHorizontalSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
  resistanceLeftBoundary = false,
  resistanceRightBoundary = false,
}: SwipeConfig) {
  const containerRef = useRef<HTMLDivElement>(null)

  const swipeStateRef = useRef<{
    startX: number
    startY: number
    isSwiping: boolean
    isScrolling: boolean
    diffX: number
  }>({
    startX: 0,
    startY: 0,
    isSwiping: false,
    isScrolling: false,
    diffX: 0,
  })

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    // Reset touch gesture tracking state
    swipeStateRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      isSwiping: false,
      isScrolling: false,
      diffX: 0,
    }

    // Disable CSS transitions so container moves synchronously with finger drags
    if (containerRef.current) {
      containerRef.current.style.transition = 'none'
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const state = swipeStateRef.current
    // Skip processing if user is already scrolling vertically
    if (state.isScrolling) return

    const touch = e.touches[0]
    const diffX = touch.clientX - state.startX
    const diffY = touch.clientY - state.startY

    // Lock swipe/scroll direction: check if horizontal drag exceeds vertical
    if (!state.isSwiping) {
      const absDiffX = Math.abs(diffX)
      const absDiffY = Math.abs(diffY)

      if (absDiffX > 10 && absDiffX > absDiffY) {
        state.isSwiping = true // Lock into horizontal swipe gesture
      } else if (absDiffY > 10) {
        state.isScrolling = true // Lock into vertical page scroll, ignore further moves
        return
      }
    }

    // Interactively translate container to follow user's finger in real time
    if (state.isSwiping) {
      state.diffX = diffX

      // Apply rubber-band resistance when swiping past boundaries (e.g. Surah 1 or 114)
      let adjustedDiffX = diffX
      if (resistanceRightBoundary && diffX > 0) {
        adjustedDiffX = diffX * 0.35 // 35% drag weight resistance
      } else if (resistanceLeftBoundary && diffX < 0) {
        adjustedDiffX = diffX * 0.35
      }

      // Update transform directly on DOM style to bypass React render loop overhead (120fps)
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${adjustedDiffX}px, 0, 0)`
      }
    }
  }

  const handleTouchEnd = () => {
    const state = swipeStateRef.current
    if (!state.isSwiping) return

    const diffX = state.diffX

    // Trigger navigation if finger was dragged past threshold
    if (Math.abs(diffX) > threshold) {
      if (diffX < 0 && onSwipeLeft && !resistanceLeftBoundary) {
        // Swipe left -> slide off-screen to left and execute callback
        if (containerRef.current) {
          containerRef.current.style.transition =
            'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s'
          containerRef.current.style.transform = `translate3d(-100vw, 0, 0)`
          containerRef.current.style.opacity = '0'
        }
        onSwipeLeft()
        return
      } else if (diffX > 0 && onSwipeRight && !resistanceRightBoundary) {
        // Swipe right -> slide off-screen to right and execute callback
        if (containerRef.current) {
          containerRef.current.style.transition =
            'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s'
          containerRef.current.style.transform = `translate3d(100vw, 0, 0)`
          containerRef.current.style.opacity = '0'
        }
        onSwipeRight()
        return
      }
    }

    // Swipe was cancelled or blocked at boundary: smoothly bounce back to center
    if (containerRef.current) {
      containerRef.current.style.transition =
        'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      containerRef.current.style.transform = 'translate3d(0, 0, 0)'
    }
  }

  return {
    ref: containerRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
}
