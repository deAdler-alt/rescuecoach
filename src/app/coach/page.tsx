'use client'
import { useEffect, useMemo, useState } from 'react'
import * as webllm from '@mlc-ai/web-llm'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function Coach() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [engine, setEngine] = useState<webllm.MLCEngineInterface | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [modelId, setModelId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Cześć! Opisz krótko sytuację, a podam kroki pierwszej pomocy.' }
  ])

  const pickModel = useMemo(() => {
    const list = (webllm.prebuiltAppConfig.model_list ?? []).map(m => m.model_id)
    const prefs = [
      'Llama-3.2-1B-Instruct',
      'Qwen2.5-0.5B',
      'Phi-3',
      'Qwen2.5-1.5B',
      'Qwen2.5-3B',
      'Llama-3.1-8B',
    ]
    for (const p of prefs) {
      const found = list.find(id => id.includes(p))
      if (found) return found
    }
    return list[0] ?? null
  }, [])

  useEffect(() => {
    const ok = typeof navigator !== 'undefined' && !!(navigator as unknown as { gpu?: unknown }).gpu
    setSupported(ok)
    if (!ok) return

    ;(async () => {
      try {
        const chosen = pickModel
        if (!chosen) return
        setModelId(chosen)
        setLoading(true)

        const e = await webllm.CreateMLCEngine(chosen, {
          initProgressCallback: (r: webllm.InitProgressReport) => {
            if (typeof r.progress === 'number') setProgress(Math.round(r.progress * 100))
          },
        })
        setEngine(e)
      } finally {
        setLoading(false)
      }
    })()
  }, [pickModel])

  const ask = async () => {
    if (!engine || !input.trim()) return
    const userMsg: Msg = { role: 'user', content: input.trim() }
    setMsgs((m) => [...m, userMsg])
    setInput('')

    const sys = 'Jesteś trenerem pierwszej pomocy. Odpowiadaj krótko, w punktach, po polsku.'
    const reply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: sys },
        ...msgs,
        userMsg
      ],
    })
    const text = reply.choices?.[0]?.message?.content ?? '…'
    setMsgs((m) => [...m, { role: 'assistant', content: text }])
  }

  if (supported === false) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl font-bold">RescueCoach (LLM offline)</h1>
        <p>Twoja przeglądarka nie wspiera WebGPU. Spróbuj w Chrome/Edge 113+ lub na desktopie z WebGPU.</p>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">RescueCoach (LLM offline)</h1>

      {loading && (
        <div aria-live="polite" className="space-y-1">
          <p>Ładuję model{modelId ? `: ${modelId}` : ''}…</p>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div className="h-2 bg-black rounded" style={{ width: `${progress}%`, transition: 'width .2s' }} />
          </div>
          <p className="text-sm opacity-70">{progress}% — pierwsze uruchomienie pobiera pliki, potem działa z cache.</p>
        </div>
      )}

      <div className="space-y-3">
        <div className="space-y-2 p-3 rounded-xl border bg-white">
          {msgs.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div className={`inline-block px-3 py-2 rounded-xl ${m.role === 'user' ? 'bg-black text-white' : 'bg-gray-100'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <textarea
            className="flex-1 border rounded-xl p-3"
            rows={2}
            placeholder="Np. dziecko się zadławiło, co robić?"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Wiadomość do asystenta pierwszej pomocy"
          />
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={ask}
            disabled={!engine || !input.trim()}
            aria-disabled={!engine || !input.trim()}
          >
            Wyślij
          </button>
        </div>

        {engine && modelId && (
          <p className="text-sm opacity-70">Model: {modelId} — działa lokalnie, bez kosztów API.</p>
        )}
      </div>
    </main>
  )
}
