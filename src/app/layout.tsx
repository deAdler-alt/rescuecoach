// app/layout.tsx
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RescueCoach',
  description: 'PWA: pierwsza pomoc offline z OCR i lokalnym LLM',
  manifest: '/manifest.webmanifest',
  themeColor: '#0ea5e9',
  icons: [
    { rel: 'icon', url: '/icon-192.png' },
    { rel: 'apple-touch-icon', url: '/icon-192.png' }
  ]
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  )
}
