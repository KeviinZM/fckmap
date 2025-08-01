import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour la base de données
export interface User {
  id: string
  email: string
  code_ami: string
  created_at: string
}

export interface VilleMarquee {
  id: string
  auth_user_id: string // Utilise directement l'ID de Supabase Auth
  nom_ville: string
  latitude: number
  longitude: number
  note: number
  frontieres?: number[][] // Coordonnées des frontières
  created_at: string
  updated_at: string
}

export interface Ami {
  id: string
  auth_user_id_1: string // Utilise directement l'ID de Supabase Auth
  auth_user_id_2: string // Utilise directement l'ID de Supabase Auth
  partage_actif: boolean
  created_at: string
}

export interface VilleAmi {
  id: string
  nom_ville: string
  latitude: number
  longitude: number
  note: number
  frontieres?: number[][]
  pseudo_ami: string
  code_ami: string
  created_at: string
}

// Helper pour accéder aux metadata utilisateur
export interface UserMetadata {
  pseudo: string
  code_ami: string
}

export const getUserMetadata = (user: any): UserMetadata | null => {
  if (!user?.user_metadata) return null
  return {
    pseudo: user.user_metadata.pseudo || '',
    code_ami: user.user_metadata.code_ami || ''
  }
} 