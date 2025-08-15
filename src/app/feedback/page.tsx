'use client'
import { useEffect, useState } from 'react'
import { addFeedback, getFeedbacks, type Feedback } from '@/lib/localdb'
import { toast } from 'sonner'

export default function FeedbackPage() {
  const [message, setMessage] = useState('')
  const [recent, setRecent] = useState<Feedback[]>([])
  const max = 500

  useEffect(() => { setRecent(getFeedbacks(5)) }, [])

  const submit = () => {
    const txt = message.trim()
    if (txt.length < 3) { toast.error('Please write at least 3 characters.'); return }
    if (txt.length > max) { toast.error('Message too long.'); return }
    addFeedback({ message: txt })
    toast.success('Thanks for your feedback!')
    setMessage('')
    setRecent(getFeedbacks(5))
  }

  return (
    <main className="py-6 space-y-6">
      <h1 className="text-2xl font-bold">Feedback</h1>

      <section className="rc-card rc-card-pad space-y-3">
        <label>
          <span className="block text-sm font-medium">Your message</span>
          <textarea
            className="rc-textarea"
            rows={4}
            maxLength={max}
            placeholder="Your thoughts…"
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="text-xs opacity-60 text-right">{message.length}/{max}</div>
        </label>

        <div className="flex gap-2">
          <button className="rc-btn rc-btn-primary" onClick={submit}>Send</button>
          <button className="rc-btn rc-btn-ghost" onClick={() => setMessage('')}>Clear</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent feedback</h2>
        {recent.length === 0 && <p className="text-sm opacity-70">No feedback yet.</p>}
        <ul className="grid gap-3">
          {recent.map(f => (
            <li key={f.id} className="rc-card rc-card-pad">
              <div className="text-sm whitespace-pre-wrap">{f.message}</div>
              <div className="text-xs opacity-60">{new Date(f.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
