'use client'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { Marker, Popup, CircleMarker } from 'react-leaflet'

// SSR-safe: te komponenty ładujemy dynamicznie tylko w przeglądarce
const MapContainer = dynamic(
  () => import('react-leaflet').then((m) => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then((m) => m.TileLayer),
  { ssr: false }
)

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  return (
    <div className="h-[60vh] w-full rounded-2xl overflow-hidden border">
      <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {/* Delikatne kółko w miejscu użytkownika */}
        <CircleMarker center={[lat, lon]} radius={8} pathOptions={{ color: '#000' }}>
          <Popup>Jesteś tutaj</Popup>
        </CircleMarker>
        {/* Dodatkowo zwykły marker (opcjonalny) */}
        <Marker position={[lat, lon]}>
          <Popup>Jesteś tutaj</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
