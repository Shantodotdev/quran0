import path from 'node:path'

import { generateSW } from 'workbox-build'
import type { ManifestTransform } from 'workbox-build'

/**
 * Prerendering writes each page as `<route>/index.html`, but the app links to
 * `/surah/1`, not `/surah/1/index.html`, and Workbox only maps `/` to
 * `index.html` on its own. Precaching those pages under their clean URL lets
 * an offline navigation to `/surah/1` get the real page instead of the home
 * page fallback. Vercel serves the same HTML at both URLs.
 */
const precacheCleanPageUrls: ManifestTransform = (entries) => ({
  manifest: entries.map((entry) =>
    entry.url !== 'index.html' && entry.url.endsWith('/index.html')
      ? { ...entry, url: entry.url.slice(0, -'/index.html'.length) }
      : entry,
  ),
  warnings: [],
})

/**
 * Generates the service worker into the deployed static directory.
 *
 * Must run after TanStack Start's prerender step: an earlier run sees no HTML
 * and ships a worker that cannot open the app offline.
 */
export async function generatePwa(publicDirectory: string) {
  const serviceWorkerPath = path.join(publicDirectory, 'sw.js')
  const { count, size, warnings, manifestEntries } = await generateSW({
    globDirectory: publicDirectory,
    globPatterns: [
      '**/*.{css,html,ico,js,json,otf,png,svg,ttf,webmanifest,woff,woff2}',
    ],
    globIgnores: ['sw.js', 'sw.js.map', 'workbox-*.js', 'workbox-*.js.map'],
    manifestTransforms: [precacheCleanPageUrls],
    swDest: serviceWorkerPath,
    navigateFallback: '/index.html',
    cleanupOutdatedCaches: true,
    clientsClaim: true,
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  })

  for (const warning of warnings) {
    console.warn(`[workbox] ${warning}`)
  }

  // Fail the build rather than deploy a worker that cannot start offline.
  const precachedUrls = new Set(manifestEntries?.map((entry) => entry.url))
  if (!precachedUrls.has('index.html') || !precachedUrls.has('surah/1')) {
    throw new Error(
      `[pwa] Prerendered pages are missing from ${publicDirectory}; sw.js would not work offline.`,
    )
  }

  console.log(
    `Generated ${path.relative(process.cwd(), serviceWorkerPath)} with ${count} precached files (${size} bytes).`,
  )
}
