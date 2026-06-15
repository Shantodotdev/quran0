import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { useEffect } from 'react'

import { BottomNav } from '#/components/bottom-nav'
import { Navbar } from '#/components/navbar'
import { PwaInstallPrompt } from '#/components/pwa-install-prompt'
import { AudioPlayer } from '#/components/audio-player'
import { useThemeStore } from '#/stores/theme'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#0d1117',
      },
      {
        name: 'apple-mobile-web-app-capable',
        content: 'yes',
      },
      {
        name: 'apple-mobile-web-app-status-bar-style',
        content: 'black-translucent',
      },
      {
        name: 'apple-mobile-web-app-title',
        content: 'Quran0',
      },
      {
        title: 'Quran0 — Read the Quran Online',
      },
      {
        name: 'description',
        content:
          'Read the Quran online with Bengali translations. Browse all 114 surahs, search by ease of learning, and follow along with transliteration.',
      },
    ],
    links: [
      {
        rel: 'icon',
        href: '/logo.png',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'manifest',
        href: '/manifest.webmanifest',
      },
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
      },
    ],
    scripts: [
      {
        children:
          "(()=>{try{const value=JSON.parse(localStorage.getItem('quran0-theme')||'null')?.state?.theme;document.documentElement.setAttribute('data-theme',['dark','white','sepia','green'].includes(value)?value:'dark')}catch{document.documentElement.setAttribute('data-theme','dark')}})()",
      },
    ],
  }),
  shellComponent: RootDocument,
})

// Global module-level flag to track the initial execution load of the client application.
// Set to true immediately when the JS bundle evaluates, surviving React hydration, mounts,
// and router-settling.
if (
  typeof window !== 'undefined' &&
  (window as any).__quran0_first_load === undefined
) {
  ;(window as any).__quran0_first_load = true
}

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return null
}

// Mounts client-side and registers when the first page load has fully settled.
// Flips the first_load flag to false after a 500ms delay to ensure subsequent
// navigations play the transitions correctly.
function NavigationTracker() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        ;(window as any).__quran0_first_load = false
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  return null
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeSync />
        <NavigationTracker />
        <div className="min-h-screen bg-(--app-bg) text-(--app-text-primary)">
          <Navbar />
          <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
            {children}
          </main>
          <AudioPlayer />
          <PwaInstallPrompt />
          <BottomNav />
        </div>
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
