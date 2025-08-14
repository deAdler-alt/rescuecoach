// next.config.ts
import withPWA from '@ducanh2912/next-pwa'
import type { NextConfig } from 'next'

const baseConfig: NextConfig = {
  reactStrictMode: true,
}

const runtimeCaching = [
  // Strony (HTML) – cache'uj nawigacje
  {
    urlPattern: ({ request }: any) => request.mode === 'navigate',
    handler: 'NetworkFirst',
    options: {
      cacheName: 'html-cache',
      expiration: { maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 },
    },
  },
  // Assety (js/css/img/font)
  {
    urlPattern: ({ request }: any) =>
      ['style', 'script', 'image', 'font'].includes(request.destination),
    handler: 'StaleWhileRevalidate',
    options: { cacheName: 'assets' },
  },
] as any

export default withPWA({
  dest: 'public',
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  workboxOptions: {
    maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
    runtimeCaching,
  },
})(baseConfig)
