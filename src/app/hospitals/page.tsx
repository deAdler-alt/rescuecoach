'use client'
export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import Map from '@/components/Map'
import { toast } from 'sonner'

type OSMTags = Record<string, string>
type OSMCenter = { lat: number; lon: number }
type OSMElementNode = { id: number; type: 'node'; lat: number; lon: number; tags?: OSMTags }
type OSMElementWayRel = { id: number; type: 'way' | 'relation'; center?: OSMCenter; tags?: OSMTags }
type OSMElement = OSMElementNode | OSMElementWayRel

const isNode = (e: OSMElement): e is OSMElementNode =>
  (e as OSMElementNode).lat !== undefined && (e as OSMElementNode).lon !== undefined

function km(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371e3
  const φ1 = aLat * Math.PI/180, φ2 = bLat * Math.PI/180
  const Δφ = (bLat-aLat) * Math.PI/180
  const Δλ = (bLon-aLon) * Math.PI/180
  const s = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2
  const d = 2*R*Math.asin(Math.sqrt(s))
  return d/1000
}

type WithDist = { e: OSMElement; d: number }

export default function Hospitals() {
  const [pos, setPos] = useState<{ lat: number; lon: number } | null>(null)
  const [places, setPlaces] = useState<OSMElement[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by this browser.'); return
    }
    navigator.geolocation.getCurrentPosition(async (p) => {
      const lat = p.coords.latitude, lon = p.coords.longitude
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
        const data = (await res.json()) as { elements?: OSMElement[] }
        const list = data?.elements ?? []
        setPlaces(list)
        localStorage.setItem('hospitals_cache', JSON.stringify(list))
      } catch {
        toast.warning('Overpass API issue — showing cached results if available.')
        const cached = localStorage.getItem('hospitals_cache')
        if (cached) setPlaces(JSON.parse(cached) as OSMElement[])
      } finally {
        setLoading(false)
      }
    }, () => toast.error('Location permission denied.'))
  }, [])

  const sorted: WithDist[] = useMemo(() => {
    return places
      .map<WithDist>((e) => {
        const c = isNode(e) ? { lat: e.lat, lon: e.lon } : e.center
        const d = pos && c ? km(pos.lat, pos.lon, c.lat, c.lon) : Number.POSITIVE_INFINITY
        return { e, d }
      })
      .sort((a, b) => a.d - b.d)
  }, [places, pos])

  return (
    <main className="py-6 space-y-4">
      <h1 className="text-2xl font-bold">Nearby hospitals</h1>
      {!pos && <p>Getting your location…</p>}
      {pos && <Map lat={pos.lat} lon={pos.lon} />}

      {loading && (
        <div className="rc-card rc-card-pad animate-pulse space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      )}

      <ul className="grid gap-3">
        {sorted.map(({ e, d }) => {
          const center = isNode(e) ? { lat: e.lat, lon: e.lon } : e.center
          const title = e.tags?.name ?? 'Hospital'
          const dist = isFinite(d) ? `${d.toFixed(1)} km` : ''
          const maps = center ? `https://www.google.com/maps?q=${center.lat},${center.lon}` : '#'
          return (
            <li key={e.id} className="rc-card rc-card-pad">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{title}</div>
                  <div className="text-sm opacity-70">
                    {center ? `${center.lat.toFixed(5)}, ${center.lon.toFixed(5)}` : ''}
                  </div>
                </div>
                <div className="text-sm font-medium">{dist}</div>
              </div>
              <div className="mt-2">
                <a href={maps} target="_blank" className="rc-btn rc-btn-ghost" rel="noreferrer">
                  Open in Maps
                </a>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
