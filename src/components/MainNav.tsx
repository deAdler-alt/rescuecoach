// src/components/MainNav.tsx
import Link from "next/link";

export default function MainNav() {
  return (
    <header className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav
        className="mx-auto max-w-5xl p-4 flex items-center justify-between"
        aria-label="Main navigation"
      >
        <Link href="/" className="font-bold text-lg" aria-label="Go to home">
          RescueCoach
        </Link>
        <ul className="flex gap-4">
          <li><Link href="/coach" className="hover:underline">Coach</Link></li>
          <li><Link href="/guide" className="hover:underline">Guide</Link></li>
          <li><Link href="/scan" className="hover:underline">Scan</Link></li>
          <li><Link href="/hospitals" className="hover:underline">Hospitals</Link></li>
          <li><Link href="/report" className="hover:underline">Report</Link></li>
          <li><Link href="/feedback" className="hover:underline">Feedback</Link></li>
        </ul>
      </nav>
    </header>
  );
}
