'use client'
import { useEffect, useState } from 'react'
import Map from '@/components/Map'

type OSMElement = {
  id: number
  tags?: Record<string, string>
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
}

export default function Hospitals() {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null)
  const [places, setPlaces] = useState<OSMElement[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setErr('Brak wsparcia geolokacji w przeglądarce')
      return
    }
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude
      const lon = p.coords.longitude
      setPos({ lat, lon })
      setLoading(true)
      try {
        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:5000,${lat},${lon});
            way["amenity"="hospital"](around:5000,${lat},${lon});
            relation["amenity"="hospital"](around:5000,${lat},${lon});
          );
          out center;`
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ data: query })
        })
        const data = await res.json()
        const list: OSMElement[] = data?.elements || []
        setPlaces(list)
        localStorage.setItem('hospitals_cache', JSON.stringify(list))
      } catch (e: any) {
        setErr('Problem z Overpass API — pokazuję ostatnio zapisane dane')
        const cached = localStorage.getItem('hospitals_cache')
        if (cached) setPlaces(JSON.parse(cached))
      } finally {
        setLoading(false)
      }
    }, () => setErr('Odmówiono dostępu do lokalizacji'))
  }, [])

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Najbliższe szpitale</h1>
      {err && <p role="alert" className="text-red-600">{err}</p>}
      {!pos && !err && <p>Pobieram Twoją lokalizację…</p>}
      {pos && <Map lat={pos.lat} lon={pos.lon} />}

      {loading && <p>Ładuję listę placówek…</p>}

      <ul className="space-y-2">
        {places.map((e) => {
          const center = e.center || (('lat' in e && 'lon' in e) ? { lat: (e as any).lat, lon: (e as any).lon } : undefined)
          return (
            <li key={e.id} className="p-3 rounded-xl border">
              <div className="font-medium">{e.tags?.name || 'Szpital'}</div>
              <div className="text-sm opacity-70">
                {center ? `${center.lat.toFixed(5)}, ${center.lon.toFixed(5)}` : ''}
              </div>
              {e.tags?.addr_full && (
                <div className="text-sm opacity-70">{e.tags.addr_full}</div>
              )}
            </li>
          )
        })}
      </ul>
    </main>
  )
}
