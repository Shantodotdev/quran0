import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { useEffect } from 'react'

import { AppBottomNav } from '#/components/app-bottom-nav'
import { AppNavbar } from '#/components/app-navbar'
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
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
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

function ThemeSync() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
        <div className="min-h-screen bg-(--app-bg) text-(--app-text-primary)">
          <AppNavbar />
          <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
            {children}
          </main>
          <AppBottomNav />
        </div>
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
