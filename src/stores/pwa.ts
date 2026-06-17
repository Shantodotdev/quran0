import { create } from 'zustand'

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}

interface PwaState {
  installPromptEvent: BeforeInstallPromptEvent | null
  isInstalled: boolean
  isIos: boolean
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void
  setIsInstalled: (installed: boolean) => void
  initPwaListeners: () => () => void
}

function isRunningAsInstalledApp() {
  if (typeof window === 'undefined') return false
  const navigatorWithStandalone = navigator as Navigator & {
    standalone?: boolean
  }
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    navigatorWithStandalone.standalone === true
  )
}

function isIosDevice() {
  if (typeof window === 'undefined') return false
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/**
 * Global store to manage PWA states, capturing beforeinstallprompt
 * events and standalone status. Safe for SSR contexts.
 */
export const usePwaStore = create<PwaState>((set) => ({
  installPromptEvent: null,
  isInstalled: false,
  isIos: false,
  setInstallPromptEvent: (event) => set({ installPromptEvent: event }),
  setIsInstalled: (installed) => set({ isInstalled: installed }),
  initPwaListeners: () => {
    if (typeof window === 'undefined') return () => {}

    const installed = isRunningAsInstalledApp()
    const ios = isIosDevice()
    set({ isInstalled: installed, isIos: ios })

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault()
      set({ installPromptEvent: event as BeforeInstallPromptEvent })
    }

    const handleInstalled = () => {
      set({ installPromptEvent: null, isInstalled: true })
    }

    window.addEventListener('beforeinstallprompt', handleInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    // Sync on focus to catch standalone mode changes or external installs
    const checkInstalled = () => {
      set({ isInstalled: isRunningAsInstalledApp() })
    }
    window.addEventListener('focus', checkInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      window.removeEventListener('focus', checkInstalled)
    }
  },
}))
