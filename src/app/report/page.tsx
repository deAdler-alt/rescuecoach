'use client'
import { useState } from 'react'

export default function Report() {
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [ok, setOk] = useState<string>('')

  const submit = async () => {
    setOk('')
    const res = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, description })
    })
    const data = await res.json()
    setOk(res.ok ? 'Submitted 👌' : 'Error: ' + (data.error || ''))
  }

  return (
    <main className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Report an incident (demo)</h1>
      <select className="border p-2 rounded" value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="bleeding">Bleeding</option>
        <option value="burn">Burn</option>
        <option value="choking">Choking</option>
        <option value="seizure">Seizure</option>
        <option value="hypoglycemia">Hypoglycemia</option>
        <option value="other">Other</option>
      </select>
      <textarea className="w-full border p-2 rounded" rows={4} placeholder="Describe…" value={description} onChange={e=>setDescription(e.target.value)} />
      <button className="px-4 py-2 rounded border" onClick={submit}>Send</button>
      {ok && <p role="status">{ok}</p>}
    </main>
  )
}
