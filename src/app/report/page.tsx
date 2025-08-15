'use client'
import { useEffect, useState } from 'react'
import { addIncident, getIncidents, type Incident } from '@/lib/localdb'
import { toast } from 'sonner'

export default function Report() {
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [recent, setRecent] = useState<Incident[]>([])

  useEffect(() => { setRecent(getIncidents(5)) }, [])

  const submit = async () => {
    if (description.trim().length < 5) {
      toast.error('Please add a brief description (≥ 5 chars).'); return
    }
    addIncident({ category, description })
    toast.success('Incident saved locally.')
    setDescription('')
    setRecent(getIncidents(5))
  }

  return (
    <main id="content" className="space-y-6 py-6">
      <h1 className="text-2xl font-bold">Report an incident (demo)</h1>

      <section className="rc-card rc-card-pad space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="block text-sm font-medium">Category</span>
            <select className="rc-input" value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="bleeding">Bleeding</option>
              <option value="burn">Burn</option>
              <option value="choking">Choking</option>
              <option value="seizure">Seizure</option>
              <option value="hypoglycemia">Hypoglycemia</option>
              <option value="other">Other</option>
            </select>
          </label>
          <div />
        </div>

        <label>
          <span className="block text-sm font-medium">Description</span>
          <textarea className="rc-textarea" rows={4} placeholder="What happened?"
            value={description} onChange={e=>setDescription(e.target.value)} />
        </label>

        <div className="flex gap-2">
          <button className="rc-btn rc-btn-primary" onClick={submit}>Send</button>
          <button className="rc-btn rc-btn-ghost" onClick={() => setDescription('')}>Clear</button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent reports</h2>
        {recent.length === 0 && <p className="text-sm opacity-70">No reports yet.</p>}
        <ul className="grid gap-3">
          {recent.map(r => (
            <li key={r.id} className="rc-card rc-card-pad">
              <div className="font-medium">{r.category}</div>
              <div className="text-sm whitespace-pre-wrap opacity-80">{r.description}</div>
              <div className="text-xs opacity-60">{new Date(r.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
