'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polygon, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Star } from 'lucide-react'
import { VilleMarquee, VilleAmi } from '@/lib/supabase'
import 'leaflet/dist/leaflet.css'

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface MapProps {
  onVilleSelect: (ville: { nom: string; lat: number; lng: number }) => void
  villesMarquees: VilleMarquee[]
  villesAmis: VilleAmi[]
  onVilleDelete: (villeId: string) => void
}

function MapController({ onVilleSelect }: { onVilleSelect: (ville: { nom: string; lat: number; lng: number }) => void }) {
  const map = useMap()

  useEffect(() => {
    // Gestionnaire de clic sur la carte
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      
      try {
        // Récupérer le nom de la ville via Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        )
        const data = await response.json()
        
        if (data.address && data.address.city) {
          onVilleSelect({
            nom: data.address.city,
            lat,
            lng,
          })
        } else if (data.address && data.address.town) {
          onVilleSelect({
            nom: data.address.town,
            lat,
            lng,
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du nom de ville:', error)
      }
    }

    map.on('click', handleMapClick)

    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, onVilleSelect])

  return null
}

export default function Map({ onVilleSelect, villesMarquees, villesAmis, onVilleDelete }: MapProps) {
  const [mapKey, setMapKey] = useState(0)

  // Recharger la carte si nécessaire
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [])

  return (
    <div className="w-full h-full">
      <MapContainer
        key={mapKey}
        center={[48.8566, 2.3522]}
        zoom={10}
        style={{ height: '100vh', width: '100%' }}
        zoomControl={false} // Désactiver les contrôles par défaut
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController onVilleSelect={onVilleSelect} />
        
        {/* Contrôles de zoom en bas à droite */}
        <ZoomControl position="bottomright" />
        
        {/* Afficher les frontières des villes marquées */}
        {villesMarquees.map((ville) => {
          
          // Vérifier que les coordonnées sont valides
          if (!ville.latitude || !ville.longitude || isNaN(ville.latitude) || isNaN(ville.longitude)) {
            console.error('Coordonnées invalides:', ville.nom_ville)
            return null
          }
          
          return (
          <div key={ville.id}>
            {/* Afficher les frontières si disponibles, sinon un cercle */}
            {ville.frontieres && ville.frontieres.length > 0 ? (
              <Polygon
                positions={ville.frontieres as any}
                pathOptions={{
                  color: '#FF6B35',
                  fillColor: '#FF6B35',
                  fillOpacity: 0.2,
                  weight: 3
                }}
              />
            ) : (
              <Circle
                center={[ville.latitude, ville.longitude]}
                radius={5000} // 5km de rayon par défaut
                pathOptions={{
                  color: '#FF6B35',
                  fillColor: '#FF6B35',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
            )}
            
            <Marker
              position={[ville.latitude, ville.longitude]}
              icon={L.divIcon({
                className: 'custom-marker',
                html: `<div class="bg-fck-orange text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">${ville.note}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{ville.nom_ville}</h3>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">Note: {ville.note}/5</span>
                  </div>

                  <button
                    onClick={() => onVilleDelete(ville.id)}
                    className="mt-2 w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
                  >
                    🗑️ Supprimer cette ville
                  </button>
                </div>
              </Popup>
            </Marker>
          </div>
        )})}

        {/* Afficher les villes des amis */}
        {villesAmis.map((ville) => {
          // Vérifier que les coordonnées sont valides
          if (!ville.latitude || !ville.longitude || isNaN(ville.latitude) || isNaN(ville.longitude)) {
            console.error('Coordonnées invalides ville ami:', ville.nom_ville)
            return null
          }
          
          return (
          <div key={`ami-${ville.id}`}>
            {/* Afficher les frontières si disponibles, sinon un cercle (couleur bleue pour les amis) */}
            {ville.frontieres && ville.frontieres.length > 0 ? (
              <Polygon
                positions={ville.frontieres as any}
                pathOptions={{
                  color: '#3B82F6', // Bleu pour les amis
                  fillColor: '#3B82F6',
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            ) : (
              <Circle
                center={[ville.latitude, ville.longitude]}
                radius={5000} // 5km de rayon par défaut
                pathOptions={{
                  color: '#3B82F6', // Bleu pour les amis
                  fillColor: '#3B82F6',
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            )}
            
            <Marker
              position={[ville.latitude, ville.longitude]}
              icon={L.divIcon({
                className: 'custom-marker-friend',
                html: `<div class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg">${ville.note}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{ville.nom_ville}</h3>
                  <div className="text-xs text-blue-600 font-medium mb-1">
                    Ami: {ville.pseudo_ami}
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">Note: {ville.note}/5</span>
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Code ami: {ville.code_ami}
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        )})}
      </MapContainer>
    </div>
  )
} 