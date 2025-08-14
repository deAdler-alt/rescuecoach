'use client'
import 'leaflet/dist/leaflet.css'
import dynamic from 'next/dynamic'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false })

const youIcon = L.divIcon({
  className: 'you-marker',
  html: '<div style="width:12px;height:12px;border:2px solid #000;border-radius:50%;background:#fff;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
})

export default function Map({ lat, lon }: { lat: number; lon: number }) {
  return (
    <div className="h-[60vh] w-full rounded-2xl overflow-hidden border">
      <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[lat, lon]} icon={youIcon}>
          <Popup>Jesteś tutaj</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
