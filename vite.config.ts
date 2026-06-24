import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

import { generatePwa } from './scripts/generate-pwa'

const prerenderPages = [
  { path: '/' },
  { path: '/bookmarks' },
  { path: '/progress' },
  ...Array.from({ length: 114 }, (_, index) => ({
    path: `/surah/${index + 1}`,
  })),
]

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(process.env.npm_package_version || '0.1.0'),
  },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        autoStaticPathsDiscovery: false,
        crawlLinks: false,
        failOnError: true,
      },
      pages: prerenderPages,
    }),
    nitro({
      modules: [
        (nitroApp) => {
          nitroApp.hooks.hook('compiled', async () => {
            await generatePwa(nitroApp.options.output.publicDir)
          })
        },
      ],
    }),
    viteReact(),
  ],
})

export default config
