'use client'

import { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polygon, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import { MapPin, Star, Users } from 'lucide-react'
import { VilleMarquee, VilleAmi } from '@/lib/supabase'
import { analyzeCityOverlaps, filterNonOverlappingCities, type CityOverlap } from '@/lib/city-overlap-utils'
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
    let isActive = true
    
    // Gestionnaire de clic sur la carte
    const handleMapClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng
      
      try {
        // Récupérer le nom de la ville via Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        )
        
        if (!isActive) return // Éviter les race conditions
        
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
        if (isActive) {
          console.error('Erreur lors de la récupération du nom de ville:', error)
        }
      }
    }

    map.on('click', handleMapClick)

    return () => {
      isActive = false
      map.off('click', handleMapClick)
    }
  }, [map, onVilleSelect])

  return null
}

export default function Map({ onVilleSelect, villesMarquees, villesAmis, onVilleDelete }: MapProps) {
  const [mapKey, setMapKey] = useState(0)

  // Analyser les superpositions de villes
  const cityOverlaps = useMemo(() => {
    return analyzeCityOverlaps(villesMarquees, villesAmis)
  }, [villesMarquees, villesAmis])

  // Filtrer les villes qui ne sont PAS en superposition pour affichage normal
  const nonOverlappingUserCities = useMemo(() => {
    return filterNonOverlappingCities(villesMarquees, cityOverlaps)
  }, [villesMarquees, cityOverlaps])

  const nonOverlappingFriendCities = useMemo(() => {
    return filterNonOverlappingCities(villesAmis, cityOverlaps)
  }, [villesAmis, cityOverlaps])

  // Recharger la carte si nécessaire
  useEffect(() => {
    setMapKey(prev => prev + 1)
  }, [])

  // Debug des superpositions
  useEffect(() => {
    if (cityOverlaps.length > 0) {
      console.log('🔄 Superpositions détectées:', cityOverlaps)
    }
  }, [cityOverlaps])

  // Fonction pour créer le HTML d'un marker composite
  const createCompositeMarkerHTML = (overlap: CityOverlap): string => {
    const mainNote = overlap.userCity?.note || overlap.friendCities[0]?.note || 0
    const isUserCity = !!overlap.userCity
    const friendColors = overlap.friendCities.map(fc => fc.color).slice(0, 3) // Max 3 anneaux
    
    // Couleur principale : orange si utilisateur, sinon couleur du premier ami
    const mainColor = isUserCity ? '#FF6B35' : friendColors[0]
    
    // Générer les anneaux pour les amis
    let ringsHTML = ''
    if (isUserCity && friendColors.length > 0) {
      // Anneaux colorés pour les amis (quand c'est la ville de l'utilisateur)
      friendColors.forEach((color, index) => {
        const ringSize = 38 + (index * 6) // Tailles croissantes: 38, 44, 50
        const ringThickness = 3
        ringsHTML += `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${ringSize}px;
            height: ${ringSize}px;
            border: ${ringThickness}px solid ${color};
            border-radius: 50%;
            pointer-events: none;
          "></div>
        `
      })
    } else if (!isUserCity && friendColors.length > 1) {
      // Plusieurs amis ont marqué la même ville
      friendColors.slice(1).forEach((color, index) => {
        const ringSize = 38 + ((index + 1) * 6)
        const ringThickness = 3
        ringsHTML += `
          <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${ringSize}px;
            height: ${ringSize}px;
            border: ${ringThickness}px solid ${color};
            border-radius: 50%;
            pointer-events: none;
          "></div>
        `
      })
    }
    
    return `
      <div style="position: relative; width: 32px; height: 32px;">
        ${ringsHTML}
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: ${mainColor};
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          z-index: 10;
        ">
          ${mainNote}
        </div>
        ${overlap.totalMarkings > 1 ? `
          <div style="
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: #10B981;
            color: white;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            z-index: 20;
          ">
            ${overlap.totalMarkings}
          </div>
        ` : ''}
      </div>
    `
  }

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
        
        {/* Afficher les villes avec superpositions (markers composites) */}
        {cityOverlaps.map((overlap) => {
          return (
            <div key={`overlap-${overlap.cityName}-${overlap.latitude}-${overlap.longitude}`}>
              {/* Polygon : priorité à l'utilisateur, sinon premier ami */}
              {(() => {
                const ville = overlap.userCity || overlap.friendCities[0]
                if (!ville.frontieres || ville.frontieres.length === 0) {
                  return (
                    <Circle
                      center={[overlap.latitude, overlap.longitude]}
                      radius={5000}
                      pathOptions={{
                        color: overlap.userCity ? '#FF6B35' : overlap.friendCities[0].color,
                        fillColor: overlap.userCity ? '#FF6B35' : overlap.friendCities[0].color,
                        fillOpacity: 0.2,
                        weight: 3
                      }}
                    />
                  )
                }
                return (
                  <Polygon
                    positions={ville.frontieres as any}
                    pathOptions={{
                      color: overlap.userCity ? '#FF6B35' : overlap.friendCities[0].color,
                      fillColor: overlap.userCity ? '#FF6B35' : overlap.friendCities[0].color,
                      fillOpacity: 0.2,
                      weight: 3
                    }}
                  />
                )
              })()}
              
              {/* Marker composite */}
              <Marker
                position={[overlap.latitude, overlap.longitude]}
                icon={L.divIcon({
                  className: 'custom-marker-composite',
                  html: createCompositeMarkerHTML(overlap),
                  iconSize: [60, 60],
                  iconAnchor: [30, 30],
                })}
              >
                <Popup maxWidth={300}>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 text-fck-orange mr-2" />
                      {overlap.cityName}
                    </h3>
                    
                    {overlap.userCity && (
                      <div className="mb-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-center mb-1">
                          <div className="w-3 h-3 bg-fck-orange rounded-full mr-2"></div>
                          <span className="font-medium text-gray-900">Votre note</span>
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm text-gray-600">{overlap.userCity.note}/5 étoiles</span>
                          {overlap.userCity && (
                            <button
                              onClick={() => onVilleDelete(overlap.userCity!.id)}
                              className="ml-auto text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
                            >
                              🗑️ Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {overlap.friendCities.length > 0 && (
                      <div className="mb-3">
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="font-medium text-gray-900">
                            Vos amis qui ont aussi marqué ({overlap.friendCities.length})
                          </span>
                        </div>
                        <div className="space-y-1">
                          {overlap.friendCities.map((friendCity) => (
                            <div key={friendCity.id} className="flex items-center text-sm">
                              <div 
                                className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                                style={{ backgroundColor: friendCity.color }}
                              />
                              <span className="text-gray-700">{friendCity.pseudo_ami}</span>
                              <span className="ml-2 text-gray-500">({friendCity.color_name})</span>
                              <div className="ml-auto flex items-center">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span className="ml-1 text-gray-600">{friendCity.note}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Note moyenne :</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="ml-1 font-medium text-gray-900">{overlap.averageRating}/5</span>
                          <span className="ml-2 text-gray-500">({overlap.totalMarkings} personne{overlap.totalMarkings > 1 ? 's' : ''})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}

        {/* Afficher les frontières des villes marquées (NON superposées) */}
        {nonOverlappingUserCities.map((ville) => {
          
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

        {/* Afficher les villes des amis (NON superposées) */}
        {nonOverlappingFriendCities.map((ville) => {
          // Validation complète des données de ville d'ami
          if (
            !ville.id ||
            !ville.nom_ville ||
            !ville.latitude || 
            !ville.longitude || 
            isNaN(ville.latitude) || 
            isNaN(ville.longitude) ||
            !ville.note ||
            !ville.pseudo_ami ||
            !ville.color ||
            !ville.friend_id
          ) {
            console.error('Données invalides pour ville ami, affichage ignoré:', {
              id: ville.id,
              nom: ville.nom_ville,
              coords: [ville.latitude, ville.longitude],
              note: ville.note,
              pseudo: ville.pseudo_ami,
              color: ville.color
            })
            return null
          }
          
          return (
          <div key={`ami-${ville.id}`}>
            {/* Afficher les frontières si disponibles, sinon un cercle (couleur personnalisée de l'ami) */}
            {ville.frontieres && ville.frontieres.length > 0 ? (
              <Polygon
                positions={ville.frontieres as any}
                pathOptions={{
                  color: ville.color, // Couleur personnalisée de l'ami
                  fillColor: ville.color,
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            ) : (
              <Circle
                center={[ville.latitude, ville.longitude]}
                radius={5000} // 5km de rayon par défaut
                pathOptions={{
                  color: ville.color, // Couleur personnalisée de l'ami
                  fillColor: ville.color,
                  fillOpacity: 0.15,
                  weight: 2
                }}
              />
            )}
            
            <Marker
              position={[ville.latitude, ville.longitude]}
              icon={L.divIcon({
                className: 'custom-marker-friend',
                html: `<div class="text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg" style="background-color: ${ville.color}">${ville.note}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold text-gray-900">{ville.nom_ville}</h3>
                  <div className="text-xs font-medium mb-1" style={{ color: ville.color }}>
                    Ami: {ville.pseudo_ami} ({ville.color_name})
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