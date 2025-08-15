// src/app/layout.tsx
import "./globals.css"
import type { Metadata, Viewport } from "next"
import MainNav from "@/components/MainNav"
import { Toaster } from "sonner"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RescueCoach",
  description: "PWA: first aid, OCR, nearby hospitals, and a local LLM coach.",
  manifest: "/manifest.webmanifest",
  icons: [
    { rel: "icon", url: "/icon-192.png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
}

export const viewport: Viewport = { themeColor: "#0ea5e9" }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased`}>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-white focus:border focus:shadow"
        >
          Skip to content
        </a>
        <MainNav />
        <div className="container mx-auto max-w-5xl px-4">{children}</div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
