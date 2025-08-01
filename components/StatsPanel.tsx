'use client'

import { useState } from 'react'
import { BarChart3, MapPin, Star, ChevronDown, ChevronUp, Edit3 } from 'lucide-react'
import { VilleMarquee } from '@/lib/supabase'
import VilleEditModal from './VilleEditModal'

interface StatsPanelProps {
  villesMarquees: VilleMarquee[]
  onRefresh: () => void
}

export default function StatsPanel({ villesMarquees, onRefresh }: StatsPanelProps) {
  const [showVillesList, setShowVillesList] = useState(false)
  const [selectedVille, setSelectedVille] = useState<VilleMarquee | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Calcul des statistiques
  const totalVilles = villesMarquees.length
  const noteMoyenneCalcul = totalVilles > 0 
    ? villesMarquees.reduce((sum, ville) => sum + ville.note, 0) / totalVilles
    : 0
  
  // Formatter la note moyenne (sans .0 si entier)
  const noteMoyenne = noteMoyenneCalcul % 1 === 0 
    ? noteMoyenneCalcul.toString() 
    : noteMoyenneCalcul.toFixed(1)

  // Répartition des notes par ordre décroissant (5, 4, 3, 2, 1)
  const repartitionNotes = [5, 4, 3, 2, 1].map(note => ({
    note,
    count: villesMarquees.filter(ville => ville.note === note).length
  }))

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm">
      <div className="flex items-center mb-6">
        <BarChart3 className="w-6 h-6 text-fck-orange mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Statistiques</h2>
      </div>

      {/* Statistiques principales */}
      <div className="space-y-4 mb-6">
        <button 
          onClick={() => setShowVillesList(!showVillesList)}
          className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-fck-orange mr-2" />
            <span className="text-gray-700">Villes marquées</span>
            {showVillesList ? (
              <ChevronUp className="w-4 h-4 text-gray-500 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
            )}
          </div>
          <span className="font-bold text-2xl text-fck-orange">{totalVilles}</span>
        </button>

        {/* Liste des villes (affichée si showVillesList = true) */}
        {showVillesList && totalVilles > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="space-y-2">
              {villesMarquees
                .sort((a, b) => b.note - a.note) // Trier par note décroissante
                .map((ville) => (
                  <button
                    key={ville.id}
                    onClick={() => {
                      setSelectedVille(ville)
                      setIsEditModalOpen(true)
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded hover:bg-white transition-colors group"
                  >
                    <span className="text-sm text-gray-700 truncate flex-1 text-left">{ville.nom_ville}</span>
                    <div className="flex items-center ml-2">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{ville.note}</span>
                      <Edit3 className="w-3 h-3 text-gray-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-gray-700">Note moyenne</span>
          </div>
          <span className="font-bold text-2xl text-yellow-500">{noteMoyenne}</span>
        </div>
      </div>

      {/* Répartition des notes */}
      {totalVilles > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Répartition des notes</h3>
          <div className="space-y-2">
            {repartitionNotes.map(({ note, count }) => (
              <div key={note} className="flex items-center">
                <div className="flex items-center w-8">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">{note}</span>
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-fck-orange h-2 rounded-full transition-all duration-300"
                      style={{ width: `${totalVilles > 0 ? (count / totalVilles) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de modification */}
      <VilleEditModal
        ville={selectedVille}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedVille(null)
        }}
        onVilleUpdated={() => {
          onRefresh()
          setIsEditModalOpen(false)
          setSelectedVille(null)
        }}
        onVilleDeleted={() => {
          onRefresh()
          setIsEditModalOpen(false)
          setSelectedVille(null)
        }}
      />
    </div>
  )
} 