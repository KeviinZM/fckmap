'use client'

import { useState, useEffect } from 'react'
import { Star, X, MapPin, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'
import { VilleMarquee } from '@/lib/supabase'

interface VilleEditModalProps {
  ville: VilleMarquee | null
  isOpen: boolean
  onClose: () => void
  onVilleUpdated: () => void
  onVilleDeleted: () => void
}

export default function VilleEditModal({ ville, isOpen, onClose, onVilleUpdated, onVilleDeleted }: VilleEditModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialiser la note quand le modal s'ouvre
  useEffect(() => {
    if (ville && isOpen) {
      setRating(ville.note)
      setError('')
    }
  }, [ville, isOpen])

  if (!isOpen || !ville) return null

  const handleUpdate = async () => {
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
      const { error } = await supabase
        .from('marques_villes')
        .update({ note: rating })
        .eq('id', ville.id)
        .eq('auth_user_id', user.id) // Sécurité

      if (error) {
        console.error('Erreur lors de la mise à jour:', error)
        setError(`Erreur: ${error.message}`)
        return
      }

      console.log('Ville mise à jour avec succès')
      onVilleUpdated()
      onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    // Confirmation avant suppression
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${ville.nom_ville}" ?`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('marques_villes')
        .delete()
        .eq('id', ville.id)
        .eq('auth_user_id', user.id) // Sécurité

      if (error) {
        console.error('Erreur lors de la suppression:', error)
        setError(`Erreur: ${error.message}`)
        return
      }

      console.log('Ville supprimée avec succès')
      onVilleDeleted()
      onClose()
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRating(ville?.note || 0)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-fck-orange mr-2" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Modifier la ville</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{ville.nom_ville}</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            Modifiez la note de votre expérience dans cette ville
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleClose}
            className="w-full sm:flex-1 py-4 sm:py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-base sm:text-sm font-medium"
          >
            Annuler
          </button>
          
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-full sm:w-auto py-4 sm:py-3 px-6 sm:px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm font-medium flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              <>
                <Trash2 className="w-5 h-5 mr-2 sm:mr-0" />
                <span className="sm:hidden">Supprimer</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleUpdate}
            disabled={rating === 0 || loading}
            className="w-full sm:flex-1 bg-fck-orange hover:bg-fck-orange-dark text-white font-semibold py-4 sm:py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              'Modifier la note'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}