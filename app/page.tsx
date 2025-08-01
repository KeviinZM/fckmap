'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import LoginForm from '@/components/LoginForm'
// import Map from '@/components/Map'
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center"><p>Chargement de la carte...</p></div>
})
import SearchBar from '@/components/SearchBar'
import StatsPanel from '@/components/StatsPanel'
import VilleRatingModal from '@/components/VilleRatingModal'
import { supabase } from '@/lib/supabase'
import { VilleMarquee, VilleAmi } from '@/lib/supabase'
import { MapPin } from 'lucide-react'
import UserMenu from '@/components/UserMenu'
import FriendsSidebar from '@/components/FriendsSidebar'

export default function Home() {
  const { user, loading } = useAuth()
  const [villesMarquees, setVillesMarquees] = useState<VilleMarquee[]>([])
  const [villesAmis, setVillesAmis] = useState<VilleAmi[]>([])
  const [selectedVille, setSelectedVille] = useState<{ nom: string; lat: number; lng: number } | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [loadingVilles, setLoadingVilles] = useState(false)

  // Charger les villes marquées de l'utilisateur et de ses amis
  useEffect(() => {
    if (user) {
      fetchVillesMarquees()
      fetchVillesAmis()
    }
  }, [user])

  const fetchVillesMarquees = async () => {
    if (!user) return

    setLoadingVilles(true)
    try {
      const { data, error } = await supabase
        .from('marques_villes')
        .select('*')
        .eq('auth_user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur lors du chargement des villes marquées:', error)
        return
      }
      

      setVillesMarquees(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des villes marquées:', error)
    } finally {
      setLoadingVilles(false)
    }
  }

  const fetchVillesAmis = async () => {
    if (!user) return

    try {
      // 1. Récupérer toutes mes relations d'amitié
      const { data: friendships, error: friendError } = await supabase
        .from('amis')
        .select('auth_user_id_1, auth_user_id_2')
        .or(`auth_user_id_1.eq.${user.id},auth_user_id_2.eq.${user.id}`)

      if (friendError) {
        console.error('Erreur chargement amis:', friendError)
        setVillesAmis([])
        return
      }

      if (!friendships || friendships.length === 0) {
        setVillesAmis([])
        return
      }

      // 2. Pour chaque ami, récupérer ses informations ET ses villes
      const villesAmisFormatted: VilleAmi[] = []

      for (const friendship of friendships) {
        // Déterminer l'ID de l'ami (pas le mien)
        const friendId = friendship.auth_user_id_1 === user.id 
          ? friendship.auth_user_id_2 
          : friendship.auth_user_id_1

        // 3. Récupérer les infos de cet ami
        const { data: friendInfoArray } = await supabase
          .rpc('get_user_info_by_id', { user_id_search: friendId })

        const friendInfo = friendInfoArray && friendInfoArray.length > 0 ? friendInfoArray[0] : null

        if (!friendInfo) {
          continue
        }

        // 4. Récupérer les villes de cet ami
        const { data: friendCities, error: citiesError } = await supabase
          .from('marques_villes')
          .select('*')
          .eq('auth_user_id', friendId)

        if (citiesError) {
          console.error('Erreur chargement villes ami:', citiesError)
          continue
        }

        // 5. Ajouter chaque ville de cet ami à la liste
        if (friendCities && friendCities.length > 0) {
          for (const city of friendCities) {
            villesAmisFormatted.push({
              id: city.id,
              nom_ville: city.nom_ville,
              latitude: city.latitude,
              longitude: city.longitude,
              note: city.note,
              frontieres: city.frontieres,
              pseudo_ami: friendInfo.pseudo || friendInfo.email?.split('@')[0] || 'Ami',
              code_ami: friendInfo.code_ami || '',
              created_at: city.created_at
            })
          }
        }
      }


      setVillesAmis(villesAmisFormatted)
    } catch (error) {
      console.error('Erreur villes amis:', error)
      setVillesAmis([])
    }
  }



  const handleVilleSelect = (ville: { nom: string; lat: number; lng: number }) => {
    setSelectedVille(ville)
    setIsRatingModalOpen(true)
  }

  const handleVilleMarquee = () => {
    // Recharger les villes depuis Supabase
    fetchVillesMarquees()
    // Recharger aussi les villes d'amis au cas où ça aurait changé
    fetchVillesAmis()
  }

  const handleVilleDelete = async (villeId: string) => {
    if (!user) return

    // Confirmation avant suppression
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ville ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('marques_villes')
        .delete()
        .eq('id', villeId)
        .eq('auth_user_id', user.id) // Sécurité : s'assurer que c'est bien l'utilisateur propriétaire

      if (error) {
        console.error('Erreur lors de la suppression:', error)
        alert('Erreur lors de la suppression de la ville')
        return
      }

      console.log('Ville supprimée avec succès')
      // Recharger les villes
      fetchVillesMarquees()
    } catch (err) {
      console.error('Erreur:', err)
      alert('Erreur lors de la suppression de la ville')
    }
  }

  const handleLoginSuccess = () => {
    // Fermer le modal de connexion
    document.getElementById('login-modal')?.classList.add('hidden')
  }

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-fck-orange to-fck-orange-dark">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-fck-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ 
                textShadow: '2px 2px 0px #FF6B35, -2px -2px 0px #FF6B35, 2px -2px 0px #FF6B35, -2px 2px 0px #FF6B35, 0px 2px 0px #FF6B35, 2px 0px 0px #FF6B35, 0px -2px 0px #FF6B35, -2px 0px 0px #FF6B35' 
              }}>
                FCK
              </h1>
            </div>
            <div className="w-80">
              <SearchBar onVilleSelect={handleVilleSelect} />
            </div>
          </div>
          
          <div className="flex items-center">
            {user ? (
              <UserMenu />
            ) : (
              <button
                onClick={() => document.getElementById('login-modal')?.classList.remove('hidden')}
                className="bg-white text-gray-800 px-4 py-2 rounded-lg transition-colors border-2 border-white hover:bg-gray-100 font-semibold shadow-lg"
              >
                Connexion
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Panneau Mes Amis - positionné sous le menu utilisateur */}
      {user && (
        <div className="absolute top-20 right-4 z-30">
          <FriendsSidebar onFriendsChange={fetchVillesAmis} />
        </div>
      )}

      {/* Carte */}
      <div className="absolute inset-0 z-10">
        <Map 
          onVilleSelect={handleVilleSelect}
          villesMarquees={villesMarquees}
          villesAmis={villesAmis}
          onVilleDelete={handleVilleDelete}
        />
      </div>

      {/* Panneau de statistiques */}
      <div className="absolute bottom-4 left-4 z-30">
        <StatsPanel 
          villesMarquees={villesMarquees}
          onRefresh={fetchVillesMarquees}
        />
      </div>



      {/* Modal de notation */}
      <VilleRatingModal
        ville={selectedVille}
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setSelectedVille(null)
        }}
        onVilleMarquee={handleVilleMarquee}
      />

      {/* Modal de connexion */}
      <div id="login-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
            <button
              onClick={() => document.getElementById('login-modal')?.classList.add('hidden')}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>
    </div>
  )
} 