'use client'
import { useState } from 'react'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [ok, setOk] = useState<string>('')

  const submit = async () => {
    setOk('')
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    })
    setOk(res.ok ? 'Thanks for your feedback!' : 'Error')
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Feedback</h1>
      <textarea className="w-full border p-2 rounded" rows={4} placeholder="Your thoughts…" value={message} onChange={e=>setMessage(e.target.value)} />
      <button className="px-4 py-2 rounded border" onClick={submit}>Send</button>
      {ok && <p role="status">{ok}</p>}
    </main>
  )
}
