'use client'

import { useState } from 'react'
import { useAuth } from './AuthProvider'
import { MapPin, Mail, Lock, UserPlus } from 'lucide-react'

interface LoginFormProps {
  onSuccess?: () => void
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        // Validation côté client
        if (pseudo.length < 3) {
          setError('Le pseudo doit contenir au moins 3 caractères')
          setLoading(false)
          return
        }

        if (pseudo.length > 20) {
          setError('Le pseudo ne peut pas dépasser 20 caractères')
          setLoading(false)
          return
        }

        // Vérifier que le pseudo ne contient que des caractères autorisés
        const pseudoRegex = /^[a-zA-Z0-9_-]+$/
        if (!pseudoRegex.test(pseudo)) {
          setError('Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores')
          setLoading(false)
          return
        }

        // Validation de l'email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          setError('Format d\'email invalide')
          setLoading(false)
          return
        }

        // Validation du mot de passe
        if (password.length < 6) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
          setLoading(false)
          return
        }

        const result = await signUp(email, password, pseudo)
        if (result.emailSent) {
          setError('Email de confirmation envoyé ! Vérifiez votre boîte mail.')
          setLoading(false)
          return
        }
      } else {
        await signIn(email, password)
      }
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      console.log('Erreur capturée:', err.message) // Debug
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <MapPin className="w-8 h-8 text-fck-orange" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">FCK</h2>
        <p className="text-gray-600 text-sm">
          {isSignUp ? 'Créer un compte' : 'Se connecter'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isSignUp && (
          <div>
            <div className="relative">
              <UserPlus className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                placeholder="Pseudo"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                required={isSignUp}
              />
            </div>
          </div>
        )}

        <div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
              required
            />
          </div>
        </div>

        {error && (
          <div className={`px-4 py-3 rounded-lg border ${
            error.includes('Email de confirmation envoyé') 
              ? 'bg-green-50 border-green-200 text-green-700' 
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-fck-orange hover:bg-fck-orange-dark text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
              {isSignUp ? 'Créer un compte' : 'Se connecter'}
            </>
          )}
        </button>
      </form>

      {/* Séparateur */}
      <div className="mt-6 mb-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500 text-sm">ou</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Boutons OAuth */}
      <div className="space-y-3">
        {/* Google */}
        <button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuer avec Google
        </button>


      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-fck-orange hover:text-fck-orange-dark font-medium"
        >
          {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
        </button>
      </div>
    </div>
  )
} 