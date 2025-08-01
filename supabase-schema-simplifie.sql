-- 🚀 SCHÉMA SUPABASE SIMPLIFIÉ pour FCK
-- Utilise uniquement Supabase Auth pour les utilisateurs
-- Tables DB uniquement pour les données métier

-- ========================================
-- 1. NETTOYAGE (optionnel - si vous voulez repartir de zéro)
-- ========================================

-- Supprimer les anciennes tables si elles existent
DROP TABLE IF EXISTS amis CASCADE;
DROP TABLE IF EXISTS marques_villes CASCADE;
DROP TABLE IF EXISTS utilisateurs CASCADE;

-- Supprimer les anciennes fonctions et triggers
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS generate_code_ami() CASCADE;
DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT) CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ========================================
-- 2. FONCTIONS UTILITAIRES
-- ========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 3. TABLES SIMPLIFIÉES
-- ========================================

-- Table des villes marquées (référence directe à auth.users)
CREATE TABLE marques_villes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nom_ville TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  frontieres JSONB, -- Coordonnées des frontières
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte d'unicité : un utilisateur ne peut marquer la même ville qu'une fois
  UNIQUE(auth_user_id, nom_ville)
);

-- Table des relations d'amis (référence directe à auth.users)
CREATE TABLE amis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id_1 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auth_user_id_2 UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partage_actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  UNIQUE(auth_user_id_1, auth_user_id_2),
  CHECK(auth_user_id_1 != auth_user_id_2)
);

-- ========================================
-- 4. TRIGGERS
-- ========================================

CREATE TRIGGER update_marques_villes_updated_at 
  BEFORE UPDATE ON marques_villes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_amis_updated_at 
  BEFORE UPDATE ON amis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. POLITIQUES RLS (Row Level Security)
-- ========================================

-- Activer RLS sur les tables
ALTER TABLE marques_villes ENABLE ROW LEVEL SECURITY;
ALTER TABLE amis ENABLE ROW LEVEL SECURITY;

-- Politiques pour marques_villes
CREATE POLICY "Users can view own marked cities" ON marques_villes
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert own marked cities" ON marques_villes
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own marked cities" ON marques_villes
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own marked cities" ON marques_villes
  FOR DELETE USING (auth.uid() = auth_user_id);

-- Politiques pour amis
CREATE POLICY "Users can view own friend relationships" ON amis
  FOR SELECT USING (auth.uid() = auth_user_id_1 OR auth.uid() = auth_user_id_2);

CREATE POLICY "Users can insert own friend relationships" ON amis
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id_1);

CREATE POLICY "Users can update own friend relationships" ON amis
  FOR UPDATE USING (auth.uid() = auth_user_id_1 OR auth.uid() = auth_user_id_2);

CREATE POLICY "Users can delete own friend relationships" ON amis
  FOR DELETE USING (auth.uid() = auth_user_id_1 OR auth.uid() = auth_user_id_2);

-- ========================================
-- 6. INDEX POUR LES PERFORMANCES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_marques_villes_auth_user ON marques_villes(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_marques_villes_created_at ON marques_villes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_amis_auth_user_1 ON amis(auth_user_id_1);
CREATE INDEX IF NOT EXISTS idx_amis_auth_user_2 ON amis(auth_user_id_2);

-- ========================================
-- 7. FONCTIONS MÉTIER (optionnelles)
-- ========================================

-- Fonction pour obtenir les villes d'amis avec partage activé
CREATE OR REPLACE FUNCTION get_friend_cities_by_code(friend_code TEXT)
RETURNS TABLE (
  nom_ville TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  note INTEGER,
  frontieres JSONB,
  pseudo_ami TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.nom_ville,
    mv.latitude,
    mv.longitude,
    mv.note,
    mv.frontieres,
    COALESCE((au.raw_user_meta_data->>'pseudo')::TEXT, au.email) as pseudo_ami,
    mv.created_at
  FROM marques_villes mv
  JOIN auth.users au ON mv.auth_user_id = au.id
  JOIN amis a ON (
    (a.auth_user_id_1 = auth.uid() AND a.auth_user_id_2 = au.id) OR
    (a.auth_user_id_2 = auth.uid() AND a.auth_user_id_1 = au.id)
  )
  WHERE (au.raw_user_meta_data->>'code_ami')::TEXT = friend_code 
    AND a.partage_actif = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ✅ SCHEMA SIMPLIFIÉ PRÊT !
-- ========================================

-- Les utilisateurs sont maintenant stockés uniquement dans auth.users
-- avec pseudo et code_ami dans raw_user_meta_data
-- Plus de table utilisateurs séparée !