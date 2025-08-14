// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import MainNav from "../../components/MainNav";

export const metadata: Metadata = {
  title: "RescueCoach",
  description: "PWA: pierwsza pomoc offline z OCR i lokalnym LLM",
  manifest: "/manifest.webmanifest",
  themeColor: "#0ea5e9",
  icons: [
    { rel: "icon", url: "/icon-192.png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className="bg-white text-black">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-white focus:border focus:shadow"
        >
          Przejdź do treści
        </a>

        <MainNav />
        {children}
      </body>
    </html>
  );
}
