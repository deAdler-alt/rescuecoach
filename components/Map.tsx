'use client'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'

const MapContainer = dynamic(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamic(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
)
const Marker = dynamic(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
)
const Popup = dynamic(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
)
const CircleMarker = dynamic(
  () => import('react-leaflet').then(m => m.CircleMarker),
  { ssr: false }
)

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  return (
    <div className="h-[60vh] w-full rounded-2xl overflow-hidden border">
      <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <CircleMarker center={[lat, lon]} radius={8} pathOptions={{ color: '#000' }}>
          <Popup>Jesteś tutaj</Popup>
        </CircleMarker>
        <Marker position={[lat, lon]}>
          <Popup>Jesteś tutaj</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
