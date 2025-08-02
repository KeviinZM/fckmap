'use client'

import { useState } from 'react'
import { Star, X, MapPin, Heart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

interface VilleRatingModalProps {
  ville: { nom: string; lat: number; lng: number } | null
  isOpen: boolean
  onClose: () => void
  onVilleMarquee: () => void
}

export default function VilleRatingModal({ ville, isOpen, onClose, onVilleMarquee }: VilleRatingModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen || !ville) return null

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Veuillez sélectionner une note')
      return
    }
    if (!user) {
      setError('Vous devez être connecté')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Plus besoin de vérifier/créer dans table utilisateurs - tout est dans Auth metadata

      // Récupérer les frontières de la ville
      console.log('Récupération des frontières pour:', ville.nom)
      let frontieres = null
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 secondes de timeout
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(ville.nom)}&format=json&polygon_geojson=1&limit=1&countrycodes=fr`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.length > 0 && data[0].geojson && data[0].geojson.coordinates) {
          // Convertir les coordonnées pour Leaflet (lat, lng)
          const coordinates = data[0].geojson.coordinates[0]
          if (Array.isArray(coordinates) && coordinates.length > 0) {
            frontieres = coordinates.map((coord: number[]) => [coord[1], coord[0]])
            console.log('Frontières récupérées:', frontieres?.length, 'points')
          }
        }
      } catch (frontieresError: any) {
        if (frontieresError.name === 'AbortError') {
          console.warn('Timeout lors de la récupération des frontières')
        } else {
          console.error('Erreur lors de la récupération des frontières:', frontieresError.message)
        }
        // Continuer sans les frontières plutôt que de faire échouer l'opération
      }

      // Maintenant, insérer la ville marquée avec ses frontières
      const { data, error } = await supabase
        .from('marques_villes')
        .insert({
          auth_user_id: user.id, // Nouveau nom de colonne
          nom_ville: ville.nom,
          latitude: ville.lat,
          longitude: ville.lng,
          note: rating,
          frontieres: frontieres,
        })
        .select()

      if (error) {
        console.error('Erreur Supabase:', error)
        if (error.message && error.message.includes('duplicate')) {
          setError('Vous avez déjà marqué cette ville')
        } else {
          setError(`Erreur: ${error.message}`)
        }
        return
      }

      console.log('Ville sauvegardée avec succès:', data)
      onVilleMarquee()
      onClose()
      setRating(0)
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-3 sm:p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-6">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-fck-orange mr-2" />
            <h2 className="text-base sm:text-xl font-bold text-gray-900">Marquer cette ville</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-3 sm:mb-6">
          <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">{ville.nom}</h3>
          <p className="text-gray-600 text-xs sm:text-base">
            Donnez une note à votre expérience dans cette ville
          </p>
        </div>

        {/* Système de notation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110 p-2 sm:p-1"
              >
                <Star
                  className={`w-10 h-10 sm:w-8 sm:h-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-center mt-3 sm:mt-2">
            <span className="text-sm sm:text-base text-gray-600">
              {rating > 0 ? `${rating}/5 étoiles` : 'Sélectionnez une note'}
            </span>
          </div>
        </div>

        {/* Messages selon la note */}
        {rating > 0 && (
          <div className="mb-3 sm:mb-6 p-2 sm:p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-fck-orange mr-2" />
              <span className="text-xs sm:text-base text-gray-700">
                {rating === 1 && "Pas terrible..."}
                {rating === 2 && "Bof, pas mémorable"}
                {rating === 3 && "Correct, rien de spécial"}
                {rating === 4 && "Très bien, à refaire !"}
                {rating === 5 && "Exceptionnel, inoubliable !"}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleClose}
            className="w-full sm:flex-1 py-3 sm:py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-sm font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="w-full sm:flex-1 bg-fck-orange hover:bg-fck-orange-dark text-white font-semibold py-3 sm:py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Marquer cette ville'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 