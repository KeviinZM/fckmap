// Test de connexion Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Test de connexion Supabase')
console.log('URL:', supabaseUrl)
console.log('Key (premiers caractères):', supabaseAnonKey?.substring(0, 10) + '...')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes !')
  console.log('Créez un fichier .env.local avec :')
  console.log('NEXT_PUBLIC_SUPABASE_URL=votre_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle')
} else {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Test simple
  supabase.from('marques_villes').select('count').limit(1)
    .then(result => {
      console.log('✅ Connexion Supabase OK:', result)
    })
    .catch(error => {
      console.error('❌ Erreur connexion:', error)
    })
}