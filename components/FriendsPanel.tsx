'use client'

import { useState, useEffect } from 'react'
import { X, Users, UserPlus, Copy, Check, UserMinus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'

interface Friend {
  id: string
  pseudo: string
  code_ami: string
  partage_actif: boolean
  friend_id: string // ID de la relation d'amitié
}

interface FriendsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function FriendsPanel({ isOpen, onClose }: FriendsPanelProps) {
  const { user } = useAuth()
  const [friendCode, setFriendCode] = useState('')
  const [myCode, setMyCode] = useState('')
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  // Charger le code ami de l'utilisateur et ses amis
  useEffect(() => {
    if (isOpen && user) {
      loadUserData()
    }
  }, [isOpen, user])

  const loadUserData = async () => {
    if (!user) return

    try {
      // Charger le code ami de l'utilisateur
      const { data: userData, error: userError } = await supabase
        .from('utilisateurs')
        .select('code_ami')
        .eq('id', user.id)
        .single()

      if (userError) {
        console.error('Erreur chargement code ami:', userError)
        return
      }

      setMyCode(userData?.code_ami || '')

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
          partage_actif,
          id_utilisateur1,
          id_utilisateur2
        `)
        .or(`id_utilisateur1.eq.${user.id},id_utilisateur2.eq.${user.id}`)

      if (friendError) {
        console.error('Erreur chargement amis:', friendError)
        return
      }

      // Pour chaque relation d'amitié, récupérer les infos de l'ami
      const friendsData: Friend[] = []
      
      for (const friendship of friendships || []) {
        const friendId = friendship.id_utilisateur1 === user.id 
          ? friendship.id_utilisateur2 
          : friendship.id_utilisateur1

        const { data: friendData, error: friendDetailError } = await supabase
          .from('utilisateurs')
          .select('id, email, code_ami')
          .eq('id', friendId)
          .single()

        if (!friendDetailError && friendData) {
          // Extraire le pseudo depuis l'email ou utiliser l'email
          const pseudo = friendData.email.split('@')[0]
          
          friendsData.push({
            id: friendData.id,
            pseudo,
            code_ami: friendData.code_ami,
            partage_actif: friendship.partage_actif,
            friend_id: friendship.id
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
      // Vérifier que le code ami existe et n'est pas le sien
      const { data: friendData, error: searchError } = await supabase
        .from('utilisateurs')
        .select('id, email, code_ami')
        .eq('code_ami', friendCode.trim().toUpperCase())
        .single()

      if (searchError || !friendData) {
        setError('Code ami non trouvé')
        return
      }

      if (friendData.id === user.id) {
        setError('Vous ne pouvez pas vous ajouter vous-même')
        return
      }

      // Vérifier que cette amitié n'existe pas déjà
      const { data: existingFriendship, error: checkError } = await supabase
        .from('amis')
        .select('id')
        .or(`and(id_utilisateur1.eq.${user.id},id_utilisateur2.eq.${friendData.id}),and(id_utilisateur1.eq.${friendData.id},id_utilisateur2.eq.${user.id})`)
        .single()

      if (existingFriendship) {
        setError('Cette personne est déjà votre ami(e)')
        return
      }

      // Créer la relation d'amitié
      const { error: insertError } = await supabase
        .from('amis')
        .insert({
          id_utilisateur1: user.id,
          id_utilisateur2: friendData.id,
          partage_actif: true // Activer le partage par défaut
        })

      if (insertError) {
        console.error('Erreur ajout ami:', insertError)
        setError('Erreur lors de l\'ajout de l\'ami')
        return
      }

      setSuccess('Ami ajouté avec succès !')
      setFriendCode('')
      await loadFriends()
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
    } catch (err) {
      console.error('Erreur:', err)
      setError('Une erreur est survenue')
    }
  }

  const toggleSharing = async (friendshipId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('amis')
        .update({ partage_actif: !currentState })
        .eq('id', friendshipId)

      if (error) {
        console.error('Erreur toggle partage:', error)
        setError('Erreur lors de la modification du partage')
        return
      }

      await loadFriends()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-fck-orange mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Mes Amis</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Mon code ami */}
        <div className="mb-6 p-4 bg-fck-orange-light rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Mon code ami</h3>
          <div className="flex items-center space-x-2">
            <code className="flex-1 bg-white px-3 py-2 rounded border text-lg font-mono text-center">
              {myCode}
            </code>
            <button
              onClick={copyMyCode}
              className="p-2 bg-fck-orange text-white rounded hover:bg-fck-orange-dark transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Partagez ce code avec vos amis pour qu'ils puissent vous ajouter
          </p>
        </div>

        {/* Ajouter un ami */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ajouter un ami</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={friendCode}
              onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
              placeholder="Code ami (ex: ABC123)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange"
              maxLength={6}
            />
            <button
              onClick={addFriend}
              disabled={loading || !friendCode.trim()}
              className="px-4 py-2 bg-fck-orange text-white rounded-lg hover:bg-fck-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Liste des amis */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Mes amis ({friends.length})
          </h3>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-fck-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun ami pour le moment</p>
              <p className="text-xs text-gray-400 mt-1">
                Ajoutez des amis avec leur code pour voir leurs villes !
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend) => (
                <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{friend.pseudo}</div>
                    <div className="text-xs text-gray-500">Code: {friend.code_ami}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleSharing(friend.friend_id, friend.partage_actif)}
                      className={`p-2 rounded transition-colors ${
                        friend.partage_actif 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={friend.partage_actif ? 'Partage activé' : 'Partage désactivé'}
                    >
                      {friend.partage_actif ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => removeFriend(friend.friend_id)}
                      className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Supprimer ami"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}