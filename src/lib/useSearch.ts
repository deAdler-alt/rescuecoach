// src/lib/useSearch.ts
import FlexSearch from 'flexsearch'
import protocols from '@/data/protocols.json'

const index = new (FlexSearch as any).Index({ tokenize: 'forward' })
;(protocols as any[]).forEach((p, i) => index.add(i, `${p.title} ${p.body}`))

export function search(q: string) {
  if (!q) return []
  const ids = index.search(q).slice(0, 5)
  return ids.map((id: number) => (protocols as any[])[id])
}
