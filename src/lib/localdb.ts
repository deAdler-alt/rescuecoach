// src/lib/localdb.ts
export type Incident = { id: string; createdAt: string; category: string; description: string }
export type Feedback = { id: string; createdAt: string; message: string }

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) ?? "[]") as T[] } catch { return [] }
}
function write<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items))
}
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const K_INC = "rc_incidents"
const K_FB  = "rc_feedback"

export function addIncident(input: { category: string; description: string }): Incident {
  const all = read<Incident>(K_INC)
  const item: Incident = {
    id: uid(),
    createdAt: new Date().toISOString(),
    category: input.category,
    description: input.description,
  }
  all.unshift(item); write(K_INC, all)
  return item
}
export function getIncidents(limit = 5): Incident[] {
  return read<Incident>(K_INC).slice(0, limit)
}

export function addFeedback(input: { message: string }): Feedback {
  const all = read<Feedback>(K_FB)
  const item: Feedback = {
    id: uid(),
    createdAt: new Date().toISOString(),
    message: input.message,
  }
  all.unshift(item); write(K_FB, all)
  return item
}
export function getFeedbacks(limit = 5): Feedback[] {
  return read<Feedback>(K_FB).slice(0, limit)
}
