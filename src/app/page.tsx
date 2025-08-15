import Link from "next/link";

function Tile({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="rc-card block transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-900">
      <div className="rc-card-pad">
        <div className="text-xl font-semibold">{title}</div>
        <div className="text-sm opacity-70">{desc}</div>
      </div>
    </Link>
  );
}

export default function Home() {
  return (
    <main id="content" className="py-8 space-y-6">
      <section className="rc-card">
        <div className="rc-card-pad">
          <h1 className="text-3xl font-bold">RescueCoach</h1>
          <p className="opacity-80">
            Quick first-aid guidance, OCR for labels, nearest hospitals, and an on-device coach. Works offline (PWA).
          </p>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile href="/coach" title="Coach (LLM)" desc="On-device first-aid assistant" />
        <Tile href="/guide" title="Guide" desc="Step-by-step procedures with search" />
        <Tile href="/scan" title="Scan (OCR)" desc="Recognize text from a label/photo" />
        <Tile href="/hospitals" title="Hospitals" desc="Nearest healthcare facilities" />
        <Tile href="/report" title="Report incident" desc="Send a demo incident (local storage)" />
        <Tile href="/feedback" title="Feedback" desc="Share your thoughts" />
      </div>
    </main>
  );
}
