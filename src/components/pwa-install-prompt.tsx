import { Download, Share, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { usePwaStore } from '#/stores/pwa'

const INSTALL_PROMPT_DELAY_MS = 1_000
const SESSION_DISMISSAL_KEY = 'quran0-install-prompt-dismissed'

function wasDismissedThisSession() {
  try {
    return sessionStorage.getItem(SESSION_DISMISSAL_KEY) === 'true'
  } catch {
    return false
  }
}

function rememberSessionDismissal() {
  try {
    sessionStorage.setItem(SESSION_DISMISSAL_KEY, 'true')
  } catch {
    // Storage may be unavailable in private browsing or restricted webviews.
  }
}

/** Registers offline support and offers installation when the browser allows it. */
export function PwaInstallPrompt() {
  const { installPromptEvent, isInstalled, isIos, setInstallPromptEvent } =
    usePwaStore()
  const [promptMode, setPromptMode] = useState<'hidden' | 'native' | 'ios'>(
    'hidden',
  )

  useEffect(() => {
    if (import.meta.env.PROD && 'serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js')
    }
  }, [])

  useEffect(() => {
    if (isInstalled || wasDismissedThisSession()) {
      setPromptMode('hidden')
      return
    }

    let revealTimer: ReturnType<typeof setTimeout> | undefined

    if (installPromptEvent) {
      clearTimeout(revealTimer)
      revealTimer = setTimeout(
        () => setPromptMode('native'),
        INSTALL_PROMPT_DELAY_MS,
      )
    } else if (isIos) {
      clearTimeout(revealTimer)
      revealTimer = setTimeout(
        () => setPromptMode('ios'),
        INSTALL_PROMPT_DELAY_MS,
      )
    } else {
      setPromptMode('hidden')
    }

    return () => {
      clearTimeout(revealTimer)
    }
  }, [installPromptEvent, isInstalled, isIos])

  const dismiss = () => {
    rememberSessionDismissal()
    setPromptMode('hidden')
  }

  const install = async () => {
    if (!installPromptEvent) {
      return
    }

    await installPromptEvent.prompt()
    await installPromptEvent.userChoice
    rememberSessionDismissal()
    setInstallPromptEvent(null)
    setPromptMode('hidden')
  }

  if (promptMode === 'hidden') {
    return null
  }

  return (
    <>
      <style>{`@keyframes slide-up-fade-in {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}`}</style>
      <aside
        className="fixed inset-x-4 bottom-24 z-60 mx-auto max-w-lg rounded-2xl border border-(--app-border) bg-(--app-surface) p-4 shadow-2xl animate-[slide-up-fade-in_0.4s_ease-out]"
        aria-label="Install Quran0"
        role="dialog"
      >
        <div className="flex items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt=""
            className="size-12 shrink-0 rounded-xl"
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-(--app-text-primary)">
              Install Quran0
            </p>
            {promptMode === 'native' ? (
              <p className="mt-1 text-sm leading-5 text-(--app-text-secondary)">
                Read every surah from your home screen, even without internet.
              </p>
            ) : (
              <p className="mt-1 text-sm leading-5 text-(--app-text-secondary)">
                Tap <Share className="mx-1 inline size-4" aria-label="Share" />
                then choose <strong>Add to Home Screen</strong>.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-(--app-text-tertiary) hover:bg-(--app-hover-bg) hover:text-(--app-text-primary)"
            aria-label="Dismiss install prompt"
          >
            <X className="size-5" />
          </button>
        </div>

        {promptMode === 'native' ? (
          <button
            type="button"
            onClick={() => void install()}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-(--app-accent-bg) px-4 text-sm font-semibold text-(--app-accent-text)"
          >
            <Download className="size-4" />
            Install app
          </button>
        ) : null}
      </aside>
    </>
  )
}
