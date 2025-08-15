'use client'
import { useEffect, useState } from 'react'
import { search, type Protocol } from '@/lib/useSearch'

export default function Guide() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Protocol[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!q) { setResults([]); return }
      const r = await search(q)
      if (alive) setResults(r)
    })()
    return () => { alive = false }
  }, [q])

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">First Aid Guide</h1>
      <input
        className="w-full border p-3 rounded"
        placeholder="e.g., bleeding, burn, choking…"
        value={q}
        onChange={e => setQ(e.target.value)}
        aria-label="Search for a procedure"
      />
      <ul className="space-y-3">
        {results.map((r, i) => (
          <li key={i} className="p-4 rounded border bg-white">
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm whitespace-pre-wrap">{r.body}</div>
          </li>
        ))}
      </ul>
    </main>
  )
}
