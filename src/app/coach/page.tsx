'use client'
import { useEffect, useMemo, useState } from 'react'
import * as webllm from '@mlc-ai/web-llm'

type Msg = { role: 'user' | 'assistant'; content: string }

type Protocol = { title: string; steps: string[] }

function normalizeAscii(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
}

function getProtocolByQueryEN(q: string): Protocol | null {
  const nq = normalizeAscii(q)
  const bank: Array<{ keys: string[]; proto: Protocol }> = [
    {
      keys: ['drowning', 'drown', 'under water', 'in water'],
      proto: {
        title: 'Drowning – First Aid (Adult)',
        steps: [
          '1) **Call 112** immediately. Give location and situation.',
          '2) **Do not endanger yourself.** Reach – throw – go (reach with a stick, throw a rope/float; swim only if trained and safe).',
          '3) Once out of water: **check breathing** (max 10s).',
          '4) **Not breathing:** start CPR 30:2 (100–120/min). Use AED if available.',
          '5) **Breathing:** recovery position, keep warm, monitor breathing.',
          '6) Remove wet clothing; protect from wind/cold.',
          '7) **Do not** hang upside down / try to “drain water” – unsafe and ineffective.',
        ],
      },
    },
    {
      keys: ['bleeding', 'severe bleeding', 'heavy bleeding', 'amputation', 'deep cut'],
      proto: {
        title: 'Severe Bleeding – First Aid',
        steps: [
          '1) **Call 112**.',
          '2) **Direct pressure** on the wound (clean dressing/gloves).',
          '3) Elevate the limb if possible.',
          '4) Do **not** remove soaked dressings — **add more** on top.',
          '5) Amputation: wrap the part (sterile), bag it, cool indirectly (no direct ice).',
          '6) Watch for shock (pale, cold sweat). Lay down, keep warm.',
        ],
      },
    },
    {
      keys: ['choking', 'heimlich', 'airway blockage'],
      proto: {
        title: 'Choking (Adult, Conscious)',
        steps: [
          '1) Encourage coughing.',
          '2) **5 back blows** between shoulder blades.',
          '3) **5 abdominal thrusts** (Heimlich).',
          '4) Alternate 5 + 5 until relief or loss of consciousness.',
          '5) If unconscious → **start CPR** and call 112.',
        ],
      },
    },
    {
      keys: ['burn', 'burned', 'scald'],
      proto: {
        title: 'Burn – First Aid',
        steps: [
          '1) **Cool with water** for 15–20 min (no ice).',
          '2) Remove jewelry/loose clothing.',
          '3) **Dry sterile dressing**; do not pop blisters.',
          '4) Chemical burns: rinse with plenty of water.',
          '5) Face/airway/large area → **call 112**.',
        ],
      },
    },
  ]
  for (const item of bank) {
    if (item.keys.some(k => nq.includes(normalizeAscii(k)))) return item.proto
  }
  return null
}

export default function Coach() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [engine, setEngine] = useState<webllm.MLCEngineInterface | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [modelId, setModelId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: 'assistant', content: 'Hi! Briefly describe the situation and I will list clear first-aid steps.' }
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

  const SYS = [
    'You are a first-aid coach in Europe.',
    'Always respond in **English**, concise, numbered steps (1) (2) (3) ...',
    'Start with emergency action (e.g., "Call 112") when appropriate.',
    'Do not include jokes, religious content, or unsafe advice. If unsure, advise calling 112.',
    'Keep to 4–6 short steps. End with: "Note: Educational information. In an emergency, call 112."'
  ].join(' ')

  async function ask() {
    const question = input.trim()
    if (!question) return

    // 1) Safety fallback for critical topics (no LLM)
    const proto = getProtocolByQueryEN(question)
    if (proto) {
      const out = ['**' + proto.title + '**', ...proto.steps, 'Note: Educational information. In an emergency, call **112**.'].join('\n')
      setMsgs(m => [...m, { role: 'user', content: question }, { role: 'assistant', content: out }])
      setInput('')
      return
    }

    // 2) Otherwise, use on-device LLM with tight constraints
    if (!engine) return
    const userMsg: Msg = { role: 'user', content: question }
    setMsgs(m => [...m, userMsg])
    setInput('')

    const reply = await engine.chat.completions.create({
      messages: [
        { role: 'system', content: SYS },
        ...msgs,
        userMsg
      ],
      temperature: 0.2,
      top_p: 0.9,
      max_tokens: 220
    })

    const raw = reply.choices?.[0]?.message?.content ?? ''
    const lines = raw
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(Boolean)
    const capped = lines.slice(0, 8).join('\n')
    setMsgs(m => [...m, { role: 'assistant', content: capped }])
  }

  if (supported === false) {
    return (
      <main className="p-6 max-w-2xl mx-auto space-y-3">
        <h1 className="text-2xl font-bold">RescueCoach (On-device LLM)</h1>
        <p>Your browser does not support WebGPU. Try Chrome/Edge 113+ on desktop with WebGPU enabled.</p>
      </main>
    )
  }

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">RescueCoach (On-device LLM)</h1>

      {loading && (
        <div aria-live="polite" className="space-y-1">
          <p>Loading model{modelId ? `: ${modelId}` : ''}…</p>
          <div className="w-full h-2 bg-gray-200 rounded">
            <div className="h-2 bg-black rounded" style={{ width: `${progress}%`, transition: 'width .2s' }} />
          </div>
          <p className="text-sm opacity-70">{progress}% — first run downloads files; next runs are cached (offline).</p>
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
            placeholder="E.g., child has a cut finger—what to do?"
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Message to the first-aid coach"
          />
          <button
            className="px-4 py-2 rounded-xl border"
            onClick={ask}
            disabled={!engine && !getProtocolByQueryEN(input)}
            aria-disabled={!engine && !getProtocolByQueryEN(input)}
          >
            Send
          </button>
        </div>

        <p className="text-xs opacity-60">
          Note: Educational information. In an emergency, call <strong>112</strong>.
        </p>
      </div>
    </main>
  )
}
