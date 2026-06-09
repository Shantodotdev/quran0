import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Analytics } from '@vercel/analytics/react'

import { AppBottomNav } from '#/components/app-bottom-nav'
import { AppNavbar } from '#/components/app-navbar'
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
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <div className="min-h-screen bg-(--app-bg) text-slate-100">
          <AppNavbar />
          <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-8">
            {children}
          </main>
          <AppBottomNav />
        </div>
        {/* <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        /> */}
        <Analytics />
        <Scripts />
      </body>
    </html>
  )
}
