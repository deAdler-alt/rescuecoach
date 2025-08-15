// src/lib/useSearch.ts
import FlexSearch from 'flexsearch'
import protocolsJson from '@/data/protocols.json'

export type Protocol = { title: string; body: string }
const protocols = protocolsJson as Protocol[]

type FlexIndexInstance = {
  add: (id: string, text: string) => void
  search: (query: string) => unknown | Promise<unknown>
}

const IndexCtor = (FlexSearch as unknown as {
  Index: new (options?: Record<string, unknown>) => FlexIndexInstance
}).Index

const index = new IndexCtor({ tokenize: 'forward' })

protocols.forEach((p, i) => index.add(String(i), `${p.title} ${p.body}`))

function normalizeIds(res: unknown): number[] {
  const toNum = (v: string | number): number =>
    typeof v === 'number' ? v : Number.parseInt(v, 10)

  if (Array.isArray(res)) {
    return (res as Array<string | number>)
      .map(toNum)
      .filter((n) => Number.isFinite(n))
  }
  if (res && typeof res === 'object' && 'result' in (res as Record<string, unknown>)) {
    const r = (res as Record<string, unknown>).result
    if (Array.isArray(r)) {
      return (r as Array<string | number>)
        .map(toNum)
        .filter((n) => Number.isFinite(n))
    }
  }
  return []
}

export async function search(q: string): Promise<Protocol[]> {
  if (!q) return []
  const raw = await index.search(q)
  const ids = normalizeIds(raw).slice(0, 5)
  return ids
    .map((id) => protocols[id])
    .filter((p): p is Protocol => Boolean(p))
}
