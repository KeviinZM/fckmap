'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Copy, Check, UserMinus, ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'

interface Friend {
  id: string
  pseudo: string
  code_ami: string
  friend_id: string // ID de la relation d'amitié
  nb_villes: number
  note_moyenne: number
}

interface FriendsSidebarProps {
  onFriendsChange?: () => void
}

export default function FriendsSidebar({ onFriendsChange }: FriendsSidebarProps) {
  const { user } = useAuth()
  const [friendCode, setFriendCode] = useState('')
  const [myCode, setMyCode] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Charger le code ami de l'utilisateur et ses amis
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Récupérer le code ami depuis les metadata utilisateur
      const codeAmi = user.user_metadata?.code_ami || ''
      

      
      setMyCode(codeAmi)

      // Charger les amis
      await loadFriends()
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err)
    }
  }

  const loadFriends = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Récupérer les relations d'amitié
      const { data: friendships, error: friendError } = await supabase
        .from('amis')
        .select(`
          id,
          auth_user_id_1,
          auth_user_id_2
        `)
        .or(`auth_user_id_1.eq.${user.id},auth_user_id_2.eq.${user.id}`)

      if (friendError) {
        console.error('Erreur chargement amis:', friendError)
        return
      }

      // Pour chaque relation d'amitié, récupérer les infos de l'ami
      const friendsData: Friend[] = []
      
      for (const friendship of friendships || []) {
        const friendId = friendship.auth_user_id_1 === user.id 
          ? friendship.auth_user_id_2 
          : friendship.auth_user_id_1

        // Utiliser la fonction RPC pour récupérer les infos de l'ami
        const { data: friendInfoArray, error: friendError } = await supabase
          .rpc('get_user_info_by_id', { user_id_search: friendId })

        // La fonction RPC retourne un tableau, donc on prend le premier élément
        const friendInfo = friendInfoArray && friendInfoArray.length > 0 ? friendInfoArray[0] : null

        if (!friendError && friendInfo) {
          // Récupérer les statistiques des villes de cet ami
          const { data: friendCities } = await supabase
            .from('marques_villes')
            .select('note')
            .eq('auth_user_id', friendId)

          const nbVilles = friendCities?.length || 0
          const noteMoyenne = nbVilles > 0 
            ? friendCities.reduce((sum, city) => sum + city.note, 0) / nbVilles 
            : 0

          friendsData.push({
            id: friendInfo.id,
            pseudo: friendInfo.pseudo || 'Utilisateur',
            code_ami: friendInfo.code_ami || '',
            friend_id: friendship.id,
            nb_villes: nbVilles,
            note_moyenne: noteMoyenne
          })
        }
      }

      setFriends(friendsData)
    } catch (err) {
      console.error('Erreur lors du chargement des amis:', err)
    } finally {
      setLoading(false)
    }
  }

  const addFriend = async () => {
    if (!user || !friendCode.trim()) {
      setError('Veuillez entrer un code ami')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      console.log('🔍 Recherche du code ami:', friendCode.trim().toUpperCase())
      
      // Solution alternative : créer une fonction RPC dans Supabase
      // Pour l'instant, utilisons une approche simple avec une fonction côté serveur
      const { data: friendUserArray, error: searchError } = await supabase
        .rpc('find_user_by_code_ami', { 
          code_ami_search: friendCode.trim().toUpperCase() 
        })

      if (searchError) {
        console.error('Erreur recherche utilisateur:', searchError)
        setError('Code ami non trouvé')
        return
      }

      // La fonction RPC retourne un tableau, donc on prend le premier élément
      const friendUser = friendUserArray && friendUserArray.length > 0 ? friendUserArray[0] : null

      if (!friendUser) {
        console.log('Code ami non trouvé')
        setError('Code ami non trouvé')
        return
      }

      console.log('✅ Utilisateur trouvé:', friendUser.email, 'Code:', friendUser.code_ami)

      if (friendUser.id === user.id) {
        setError('Vous ne pouvez pas vous ajouter vous-même')
        return
      }

      // Vérifier que cette amitié n'existe pas déjà
      const { data: existingFriendship, error: checkError } = await supabase
        .from('amis')
        .select('id')
        .or(`and(auth_user_id_1.eq.${user.id},auth_user_id_2.eq.${friendUser.id}),and(auth_user_id_1.eq.${friendUser.id},auth_user_id_2.eq.${user.id})`)
        .single()

      if (existingFriendship) {
        setError('Cette personne est déjà votre ami(e)')
        return
      }

      // Créer la relation d'amitié
      const { error: insertError } = await supabase
        .from('amis')
        .insert({
                  auth_user_id_1: user.id,
        auth_user_id_2: friendUser.id
        })

      if (insertError) {
        console.error('Erreur ajout ami:', insertError)
        setError('Erreur lors de l\'ajout de l\'ami')
        return
      }

      setSuccess('Ami ajouté avec succès !')
      setFriendCode('')
      setShowAddForm(false)
      await loadFriends()
      onFriendsChange?.() // Recharger les villes d'amis
    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet ami ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('amis')
        .delete()
        .eq('id', friendshipId)

      if (error) {
        console.error('Erreur suppression ami:', error)
        setError('Erreur lors de la suppression')
        return
      }

      setSuccess('Ami supprimé')
      await loadFriends()
      onFriendsChange?.() // Recharger les villes d'amis
    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue')
    }
  }



  const copyMyCode = async () => {
    try {
      await navigator.clipboard.writeText(myCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Erreur copie:', err)
    }
  }

  if (!user) return null

  return (
    <div className="w-48">
      {/* En-tête cliquable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between bg-white border border-gray-300 px-4 py-2 hover:bg-gray-50 transition-colors duration-200 shadow-lg ${
          isExpanded ? 'rounded-t-lg' : 'rounded-lg'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-fck-orange" />
          <span className="font-medium text-gray-900">Mes Amis ({friends.length})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="bg-white rounded-b-lg shadow-lg border border-t-0 border-gray-200 p-3">
          {/* Mon code ami (compact) */}
          <div className="mb-2 p-2 bg-fck-orange-light rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-xs font-medium text-gray-700 mb-1">Mon code</div>
                <code className="text-sm font-mono">{myCode}</code>
              </div>
              <button
                onClick={copyMyCode}
                className="p-2 bg-fck-orange text-white rounded hover:bg-fck-orange-dark transition-colors"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Bouton Ajouter un ami */}
          <div className="mb-2">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full py-2 px-3 bg-fck-orange text-white rounded-lg hover:bg-fck-orange-dark transition-colors flex items-center justify-center text-sm"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter un ami
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="Code ami"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange"
                  maxLength={6}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={addFriend}
                    disabled={loading || !friendCode.trim()}
                    className="flex-1 py-2 bg-fck-orange text-white rounded-lg hover:bg-fck-orange-dark transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? '...' : 'Ajouter'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false)
                      setFriendCode('')
                      setError('')
                    }}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-1 p-1 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-1 p-1 bg-green-50 border border-green-200 text-green-700 rounded text-xs">
              {success}
            </div>
          )}

          {/* Liste des amis */}
          <div className="max-h-24 overflow-y-auto">
            {loading ? (
              <div className="text-center py-2">
                <div className="w-4 h-4 border-2 border-fck-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-1 text-gray-500">
                <Users className="w-4 h-4 mx-auto mb-1 text-gray-300" />
                <p className="text-xs">Aucun ami</p>
              </div>
            ) : (
              <div className="space-y-1">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-1 bg-gray-50 rounded text-xs">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-xs text-gray-900 truncate">{friend.pseudo}</div>
                        <div className="text-xs text-gray-400 ml-2 flex-shrink-0 flex items-center space-x-1">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 text-fck-orange mr-1" />
                            <span>{friend.nb_villes}</span>
                          </div>
                          <span>•</span>
                          <div className="flex items-center">
                            <span>⭐ {friend.note_moyenne > 0 ? (friend.note_moyenne % 1 === 0 ? friend.note_moyenne.toString() : friend.note_moyenne.toFixed(1)) : '-'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{friend.code_ami}</div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">

                      <button
                        onClick={() => removeFriend(friend.friend_id)}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        title="Supprimer ami"
                      >
                        <UserMinus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}