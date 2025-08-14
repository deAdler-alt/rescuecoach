'use client'
import { useEffect, useState } from 'react'
import { CreateMLCEngine } from '@mlc-ai/web-llm'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function Coach() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [engine, setEngine] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [modelReady, setModelReady] = useState(false)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Cześć! Opisz krótko sytuację, a podam kroki pierwszej pomocy.' }
  ])

  useEffect(() => {
    const ok = typeof navigator !== 'undefined' && !!(navigator as any).gpu
    setSupported(ok)

    ;(async () => {
      if (!ok) return
      setLoading(true)
      try {
        const e = await CreateMLCEngine({
          model: 'Qwen2.5-3B-Instruct-q4f32_1',
        })
        setEngine(e)
        setModelReady(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const ask = async () => {
    if (!engine || !input.trim()) return
    const userMsg: Msg = { role: 'user', content: input.trim() }
    setMsgs((m) => [...m, userMsg])
    setInput('')

    const sys = 'Jesteś trenerem pierwszej pomocy. Odpowiadaj krótko, w punktach, po polsku.'
    const resp = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: sys },
        ...msgs,
        userMsg
      ]
    })
    const text = resp.choices?.[0]?.message?.content || '…'
    setMsgs((m) => [...m, { role: 'assistant', content: text }])
  }

  if (supported === false) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl font-bold">RescueCoach (LLM offline)</h1>
        <p>Twoja przeglądarka nie wspiera WebGPU. Spróbuj w Chrome/Edge 113+ lub na desktopie z włączonym WebGPU.</p>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">RescueCoach (LLM offline)</h1>

      {loading && <p>Ładuję model… pierwsze uruchomienie może potrwać ⏳</p>}
      {!loading && !modelReady && <p>Inicjalizacja…</p>}

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
            disabled={!modelReady || !input.trim()}
            aria-disabled={!modelReady || !input.trim()}
          >
            Wyślij
          </button>
        </div>

        {!loading && modelReady && (
          <p className="text-sm opacity-70">Model wczytany lokalnie – brak kosztów API.</p>
        )}
      </div>
    </main>
  )
}
