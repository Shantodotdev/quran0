import path from 'node:path'

import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
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
    nitro(),
    viteReact(),
    pwaServiceWorker(),
  ],
})

/**
 * Builds sw.js once the static output is complete. TanStack Start prerenders
 * pages in its own post `buildApp` hook, after Nitro's `compiled` hook has
 * already fired, so this plugin is also `post` and listed after
 * `tanstackStart()` to run after the HTML exists.
 */
function pwaServiceWorker(): Plugin {
  return {
    name: 'quran0:pwa-service-worker',
    apply: 'build',
    enforce: 'post',
    buildApp: {
      order: 'post',
      async handler(builder) {
        // Prerender writes HTML into the client environment's outDir, which
        // Nitro points at the deployed static folder (.vercel/output/static).
        const clientOutDir = builder.environments.client?.config.build.outDir
        if (!clientOutDir) {
          throw new Error('[pwa] Vite client environment not found')
        }
        await generatePwa(path.resolve(builder.config.root, clientOutDir))
      },
    },
  }
}

export default config
