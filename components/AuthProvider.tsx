'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, pseudo: string) => Promise<{ emailSent: boolean; user: User | null }>
  signOut: () => Promise<void>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Fonction pour générer un code ami unique
  const generateCodeAmiForOAuth = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Fonction pour s'assurer qu'un utilisateur OAuth a un code ami
  const ensureUserMetadata = async (user: User) => {
    if (!user.user_metadata?.code_ami) {
      console.log('Utilisateur OAuth sans code ami, génération...')
      const codeAmi = generateCodeAmiForOAuth()
      
      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          code_ami: codeAmi,
          pseudo: user.user_metadata?.pseudo || user.email?.split('@')[0] || 'Utilisateur'
        }
      })
      
      if (error) {
        console.error('Erreur mise à jour metadata:', error)
      } else {
        console.log('Code ami généré pour utilisateur OAuth:', codeAmi)
      }
    }
  }

  useEffect(() => {
    // Récupérer la session initiale
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await ensureUserMetadata(session.user)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await ensureUserMetadata(session.user)
        }
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

    const signUp = async (email: string, password: string, pseudo: string) => {
    try {
      console.log('Début de la création de compte pour:', email, 'avec pseudo:', pseudo)

      // Générer un code ami unique
      const generateCodeAmi = () => {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
      }

      const codeAmi = generateCodeAmi()
      console.log('Code ami généré:', codeAmi)

      // Créer l'utilisateur avec confirmation email
      console.log('Création compte avec validation email...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pseudo: pseudo,
            code_ami: codeAmi
          }
        }
      })
      
      console.log('Réponse Supabase auth.signUp:', { data, error })
      
      if (error) {
        console.error('Erreur auth.signUp:', error)
        // Gérer les erreurs d'unicité avec des messages plus spécifiques
        if (error.message.includes('already registered') || error.message.includes('already been registered')) {
          throw new Error('Un compte existe déjà avec cet email. Utilisez un autre email ou connectez-vous.')
        }
        if (error.message.includes('Invalid email')) {
          throw new Error('Format d\'email invalide')
        }
        if (error.message.includes('Password should be at least')) {
          throw new Error('Le mot de passe doit contenir au moins 6 caractères')
        }
        throw new Error(`Erreur d'authentification: ${error.message}`)
      }

      if (data.user) {
        console.log('Utilisateur créé avec succès ! ID:', data.user.id)
        console.log('Pseudo:', data.user.user_metadata?.pseudo)
        console.log('Code ami:', data.user.user_metadata?.code_ami)
      }
      
      // Retourner un indicateur que l'email de confirmation a été envoyé
      return { emailSent: true, user: data.user }
    } catch (err: any) {
      console.error('Erreur complète dans signUp:', err)
      throw err
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    try {
      console.log('Connexion avec Google...')
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        console.error('Erreur connexion Google:', error)
        throw error
      }

      console.log('Redirection Google initiée:', data)
    } catch (err: any) {
      console.error('Erreur complète Google:', err)
      throw err
    }
  }



  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 