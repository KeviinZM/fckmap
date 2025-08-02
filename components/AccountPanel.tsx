'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { supabase } from '@/lib/supabase'
import { User, Lock, Mail, UserPlus, X, Check, AlertCircle, Edit3 } from 'lucide-react'
import { validatePseudo, generatePseudoSuggestions } from '@/lib/pseudo-validation'

interface AccountPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountPanel({ isOpen, onClose }: AccountPanelProps) {
  const { user, updatePseudo } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  
  // États pour le changement de pseudo
  const [newPseudo, setNewPseudo] = useState('')
  const [isEditingPseudo, setIsEditingPseudo] = useState(false)
  const [pseudoLoading, setPseudoLoading] = useState(false)
  const [pseudoMessage, setPseudoMessage] = useState('')
  const [pseudoMessageType, setPseudoMessageType] = useState<'success' | 'error'>('success')
  const [pseudoSuggestions, setPseudoSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const pseudo = user?.user_metadata?.pseudo || user?.email?.split('@')[0] || 'Utilisateur'

  // Fonctions pour le changement de pseudo
  const handleStartEditPseudo = () => {
    setNewPseudo(pseudo)
    setIsEditingPseudo(true)
    setPseudoMessage('')
    
    // Générer des suggestions si nécessaire
    if (user?.email) {
      const suggestions = generatePseudoSuggestions(user.email)
      setPseudoSuggestions(suggestions)
    }
  }

  const handleCancelEditPseudo = () => {
    setIsEditingPseudo(false)
    setNewPseudo('')
    setPseudoMessage('')
    setShowSuggestions(false)
  }

  const handlePseudoChange = (value: string) => {
    setNewPseudo(value)
    setPseudoMessage('')
    
    // Validation en temps réel
    if (value.trim() && value.trim() !== pseudo) {
      const validation = validatePseudo(value)
      if (!validation.isValid) {
        setPseudoMessage(validation.error || 'Pseudo invalide')
        setPseudoMessageType('error')
      }
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setNewPseudo(suggestion)
    setShowSuggestions(false)
    setPseudoMessage('')
  }

  const handlePseudoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPseudo.trim()) return
    
    // Vérifier si le pseudo a changé
    if (newPseudo.trim() === pseudo) {
      setPseudoMessage('Vous devez choisir un pseudo différent')
      setPseudoMessageType('error')
      return
    }

    setPseudoLoading(true)
    setPseudoMessage('')

    try {
      await updatePseudo(newPseudo)
      
      setPseudoMessage('Pseudo modifié avec succès !')
      setPseudoMessageType('success')
      
      // Attendre un peu puis fermer le mode édition
      setTimeout(() => {
        setIsEditingPseudo(false)
        setPseudoMessage('')
      }, 2000)
      
    } catch (error: any) {
      setPseudoMessage(error.message || 'Erreur lors de la modification du pseudo')
      setPseudoMessageType('error')
    } finally {
      setPseudoLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!currentPassword.trim()) {
      setMessage('Veuillez saisir votre mot de passe actuel')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
      setMessageType('error')
      setLoading(false)
      return
    }

    if (currentPassword === newPassword) {
      setMessage('Le nouveau mot de passe doit être différent de l\'ancien')
      setMessageType('error')
      setLoading(false)
      return
    }

    try {
      // Vérifier d'abord l'ancien mot de passe en tentant une connexion
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        })

        if (signInError) {
          setMessage('Mot de passe actuel incorrect')
          setMessageType('error')
          setLoading(false)
          return
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage('Mot de passe modifié avec succès !')
      setMessageType('success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setMessage(err.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Mon compte</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 sm:p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Informations du compte */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Informations</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Pseudo</p>
                  {!isEditingPseudo ? (
                    <p className="font-medium text-gray-900">{pseudo}</p>
                  ) : (
                    <form onSubmit={handlePseudoSubmit} className="mt-1">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newPseudo}
                          onChange={(e) => handlePseudoChange(e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                          placeholder="Nouveau pseudo"
                          maxLength={20}
                          disabled={pseudoLoading}
                          autoFocus
                        />
                        <button
                          type="submit"
                          disabled={pseudoLoading || !newPseudo.trim() || newPseudo.trim() === pseudo}
                          className="text-xs bg-fck-orange text-white px-2 py-1 rounded hover:bg-fck-orange-dark transition-colors disabled:opacity-50"
                        >
                          {pseudoLoading ? '...' : '✓'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEditPseudo}
                          disabled={pseudoLoading}
                          className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Suggestions de pseudo */}
                      {pseudoSuggestions.length > 0 && (
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => setShowSuggestions(!showSuggestions)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            {showSuggestions ? 'Masquer' : 'Voir'} les suggestions
                          </button>
                          {showSuggestions && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {pseudoSuggestions.map((suggestion, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => handleSuggestionClick(suggestion)}
                                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Message de validation */}
                      {pseudoMessage && (
                        <div className={`mt-2 text-xs ${
                          pseudoMessageType === 'success' 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {pseudoMessage}
                        </div>
                      )}
                    </form>
                  )}
                </div>
              </div>
              
              {!isEditingPseudo && (
                <button
                  onClick={handleStartEditPseudo}
                  className="text-gray-400 hover:text-fck-orange transition-colors"
                  title="Modifier le pseudo"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Compte créé le</p>
                <p className="font-medium text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modification du mot de passe */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Modifier le mot de passe</h3>
          <form onSubmit={handlePasswordChange} className="space-y-3 sm:space-y-4">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mot de passe actuel"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent text-base sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmer le nouveau mot de passe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`px-4 py-3 rounded-lg border flex items-center space-x-2 ${
                messageType === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                {messageType === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-fck-orange hover:bg-fck-orange-dark text-white font-semibold py-4 sm:py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-base sm:text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Modifier le mot de passe
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
} 