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
import { MapPin, Menu, X, BarChart3, Users } from 'lucide-react'
import { getColorForFriend } from '@/lib/friend-colors'
import UserMenu from '@/components/UserMenu'
import FriendsSidebar from '@/components/FriendsSidebar'
import LegalBar from '@/components/LegalBar'

export default function Home() {
  const { user, loading } = useAuth()
  const [villesMarquees, setVillesMarquees] = useState<VilleMarquee[]>([])
  const [villesAmis, setVillesAmis] = useState<VilleAmi[]>([])
  const [selectedVille, setSelectedVille] = useState<{ nom: string; lat: number; lng: number } | null>(null)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [loadingVilles, setLoadingVilles] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isFriendsMenuOpen, setIsFriendsMenuOpen] = useState(false)

  // Charger les villes marquées de l'utilisateur et de ses amis
  useEffect(() => {
    if (user) {
      fetchVillesMarquees()
      fetchVillesAmis()
      // Lancer le diagnostic pour identifier les problèmes
      diagnosticVillesAmis()
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

        // 5. Ajouter chaque ville de cet ami à la liste (avec validations strictes)
        if (friendCities && friendCities.length > 0) {
          for (const city of friendCities) {
            // Validation stricte des données requises
            if (
              !city.id || 
              !city.nom_ville || 
              !city.latitude || 
              !city.longitude || 
              isNaN(city.latitude) || 
              isNaN(city.longitude) ||
              !city.note ||
              (!friendInfo.pseudo && !friendInfo.email)
            ) {
              console.warn('Ville d\'ami invalide ignorée:', {
                cityId: city.id,
                cityName: city.nom_ville,
                friendPseudo: friendInfo.pseudo,
                coords: [city.latitude, city.longitude]
              })
              continue // Ignorer cette ville si les données sont incomplètes
            }

            // Attribution automatique de couleur basée sur l'ID de l'ami
            const friendColor = getColorForFriend(friendId)

            villesAmisFormatted.push({
              id: city.id,
              nom_ville: city.nom_ville,
              latitude: city.latitude,
              longitude: city.longitude,
              note: city.note,
              frontieres: city.frontieres,
              pseudo_ami: friendInfo.pseudo || friendInfo.email?.split('@')[0] || 'Ami',
              code_ami: friendInfo.code_ami || '',
              friend_id: friendId,
              color: friendColor.value,
              color_name: friendColor.name,
              created_at: city.created_at
            })
          }
        }
      }


      console.log(`✅ ${villesAmisFormatted.length} villes d'amis valides chargées`)
      setVillesAmis(villesAmisFormatted)
    } catch (error) {
      console.error('Erreur villes amis:', error)
      setVillesAmis([])
    }
  }

  // Fonction de diagnostic pour nettoyer les données d'amis corrompues
  const diagnosticVillesAmis = async () => {
    if (!user) return

    try {
      console.log('🔍 Diagnostic des villes d\'amis...')
      
      // Récupérer toutes les villes d'amis directement
      const { data: allFriendCities, error } = await supabase
        .from('marques_villes')
        .select('*')
        .neq('auth_user_id', user.id) // Toutes les villes qui ne sont pas à moi

      if (error) {
        console.error('Erreur diagnostic:', error)
        return
      }

      const problemCities = allFriendCities?.filter(city => 
        !city.nom_ville || 
        !city.latitude || 
        !city.longitude || 
        isNaN(city.latitude) || 
        isNaN(city.longitude) ||
        !city.note
      ) || []

      if (problemCities.length > 0) {
        console.warn('⚠️ Villes problématiques détectées:', problemCities)
        console.log('Ces villes ne s\'afficheront plus sur la carte grâce aux nouvelles validations.')
      } else {
        console.log('✅ Aucune ville problématique détectée')
      }

    } catch (error) {
      console.error('Erreur diagnostic:', error)
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
      <div className="absolute top-0 left-0 right-0 z-40 pt-6 pb-3 px-3 sm:p-4" style={{ paddingTop: 'max(24px, env(safe-area-inset-top))' }}>
        {/* Mobile Header */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between space-x-2">
            <h1 className="text-lg font-bold text-white drop-shadow-lg flex-shrink-0" style={{ 
              textShadow: '2px 2px 0px #FF6B35, -2px -2px 0px #FF6B35, 2px -2px 0px #FF6B35, -2px 2px 0px #FF6B35, 0px 2px 0px #FF6B35, 2px 0px 0px #FF6B35, 0px -2px 0px #FF6B35, -2px 0px 0px #FF6B35' 
            }}>
              FCK
            </h1>
            
            <div className="flex-1 px-2 max-w-xs">
              <SearchBar onVilleSelect={handleVilleSelect} />
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              {user && (
                <button
                  onClick={diagnosticVillesAmis}
                  className="bg-blue-500 text-white p-2 rounded-lg text-xs hover:bg-blue-600 transition-colors shadow-lg"
                  title="Debug"
                >
                  🔍
                </button>
              )}
              {user ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => document.getElementById('login-modal')?.classList.remove('hidden')}
                  className="bg-white text-gray-800 px-2 py-2 rounded-lg text-xs transition-colors border-2 border-white hover:bg-gray-100 font-semibold shadow-lg"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
          
          {/* Bouton "Mes amis" mobile - affiché uniquement si connecté */}
          {user && (
            <div className="flex justify-center mt-2">
              <button
                onClick={() => setIsFriendsMenuOpen(!isFriendsMenuOpen)}
                className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-lg text-xs font-semibold shadow-lg border border-gray-200 hover:bg-opacity-100 transition-all duration-200 flex items-center space-x-1"
              >
                <Users className="w-3 h-3" />
                <span>Mes amis</span>
              </button>
            </div>
          )}
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ 
                textShadow: '2px 2px 0px #FF6B35, -2px -2px 0px #FF6B35, 2px -2px 0px #FF6B35, -2px 2px 0px #FF6B35, 0px 2px 0px #FF6B35, 2px 0px 0px #FF6B35, 0px -2px 0px #FF6B35, -2px 0px 0px #FF6B35' 
              }}>
                FCK
              </h1>
            </div>
            <div className="w-80 lg:w-96">
              <SearchBar onVilleSelect={handleVilleSelect} />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {user && (
              <button
                onClick={diagnosticVillesAmis}
                className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors shadow-lg"
                title="Diagnostiquer les villes d'amis (debug)"
              >
                🔍 Debug
              </button>
            )}
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

      {/* Menu Mobile - Bouton bas gauche */}
      <div className="sm:hidden absolute bottom-4 left-4 z-30">
        {/* Menu déployé */}
        {isMobileMenuOpen && (
          <div className="absolute bottom-16 left-0 bg-white rounded-lg shadow-xl border border-gray-200 w-72 max-h-48 landscape:max-h-36 landscape:w-64 overflow-y-auto">
            <div className="p-4 landscape:p-3">
              <div className="flex items-center justify-between mb-4 landscape:mb-2">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 text-fck-orange mr-2" />
                  Statistiques
                </h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Statistiques principales */}
              <div className="space-y-4 landscape:space-y-2">
                <div className="grid grid-cols-2 gap-4 landscape:gap-2">
                  <div className="text-center p-3 landscape:p-2 bg-gray-50 rounded-lg">
                    <div className="text-2xl landscape:text-xl font-bold text-fck-orange">{villesMarquees.length}</div>
                    <div className="text-xs text-gray-600">Villes marquées</div>
                  </div>
                  <div className="text-center p-3 landscape:p-2 bg-gray-50 rounded-lg">
                    <div className="text-2xl landscape:text-xl font-bold text-yellow-500">
                      {villesMarquees.length > 0 
                        ? (villesMarquees.reduce((sum, ville) => sum + ville.note, 0) / villesMarquees.length).toFixed(1)
                        : '0'
                      }
                    </div>
                    <div className="text-xs text-gray-600">Note moyenne</div>
                  </div>
                </div>
                
                {/* Répartition des notes */}
                {villesMarquees.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Répartition des notes</h3>
                    <div className="space-y-1">
                      {[5, 4, 3, 2, 1].map(note => {
                        const count = villesMarquees.filter(ville => ville.note === note).length;
                        return (
                          <div key={note} className="flex items-center text-sm">
                            <span className="w-8 text-gray-600">⭐ {note}</span>
                            <div className="flex-1 mx-2">
                              <div className="bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-fck-orange h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${villesMarquees.length > 0 ? (count / villesMarquees.length) * 100 : 0}%` }}
                                />
                              </div>
                            </div>
                            <span className="w-8 text-right text-gray-600">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Bouton flottant */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white rounded-lg shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-all duration-200"
        >
          <BarChart3 className="w-6 h-6 text-fck-orange" />
        </button>
      </div>

      {/* Panneau Mes Amis - Desktop seulement */}
      {user && (
        <div className="hidden sm:block absolute top-24 right-4 z-30">
          <FriendsSidebar onFriendsChange={fetchVillesAmis} />
        </div>
      )}

      {/* Carte */}
      <div 
        className="absolute inset-0 z-10"
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Map 
          onVilleSelect={handleVilleSelect}
          villesMarquees={villesMarquees}
          villesAmis={villesAmis}
          onVilleDelete={handleVilleDelete}
        />
      </div>

      {/* Panneau de statistiques - Desktop seulement */}
      <div className="hidden sm:block absolute bottom-4 left-4 z-30">
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
      <div id="login-modal" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Connexion</h2>
            <button
              onClick={() => document.getElementById('login-modal')?.classList.add('hidden')}
              className="text-gray-400 hover:text-gray-600 p-2 sm:p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>

      {/* Barre légale en bas */}
      <LegalBar />
    </div>
  )
} 