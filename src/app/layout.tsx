// src/app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"
import MainNav from "@/components/MainNav"

export const metadata: Metadata = {
  title: "RescueCoach",
  description: "PWA: first aid, OCR, nearby hospitals, and a local LLM coach.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/icon-192.png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
}

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-white text-black">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-white focus:border focus:shadow"
        >
          Skip to content
        </a>
        <MainNav />
        {children}
      </body>
    </html>
  )
}
