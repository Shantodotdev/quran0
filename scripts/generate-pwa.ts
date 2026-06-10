import path from 'node:path'

import { generateSW } from 'workbox-build'

/** Generates the production service worker before Nitro packages deployment output. */
export async function generatePwa(publicDirectory: string) {
  const serviceWorkerPath = path.join(publicDirectory, 'sw.js')
  const { count, size, warnings } = await generateSW({
    globDirectory: publicDirectory,
    globPatterns: [
      '**/*.{css,html,ico,js,json,otf,png,svg,ttf,webmanifest,woff,woff2}',
    ],
    globIgnores: ['sw.js', 'sw.js.map', 'workbox-*.js', 'workbox-*.js.map'],
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

  console.log(
    `Generated ${path.relative(process.cwd(), serviceWorkerPath)} with ${count} precached files (${size} bytes).`,
  )
}
