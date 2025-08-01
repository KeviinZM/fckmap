-- Schéma de base de données pour FCK
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des utilisateurs (extension de auth.users)
CREATE TABLE IF NOT EXISTS utilisateurs (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE, -- Contrainte d'unicité explicite
  code_ami TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour updated_at
CREATE TRIGGER update_utilisateurs_updated_at 
  BEFORE UPDATE ON utilisateurs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des villes marquées
CREATE TABLE IF NOT EXISTS marques_villes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  nom_ville TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  note INTEGER NOT NULL CHECK (note >= 1 AND note <= 5),
  frontieres JSONB, -- Stockage des coordonnées des frontières
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte pour éviter les doublons de ville par utilisateur
  UNIQUE(id_utilisateur, nom_ville)
);

-- Trigger pour updated_at sur marques_villes
CREATE TRIGGER update_marques_villes_updated_at 
  BEFORE UPDATE ON marques_villes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table des relations d'amis
CREATE TABLE IF NOT EXISTS amis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_utilisateur1 UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  id_utilisateur2 UUID NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
  partage_actif BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte pour éviter les doublons et les auto-relations
  UNIQUE(id_utilisateur1, id_utilisateur2),
  CHECK(id_utilisateur1 != id_utilisateur2)
);

-- Trigger pour updated_at sur amis
CREATE TRIGGER update_amis_updated_at 
  BEFORE UPDATE ON amis 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer automatiquement un code ami
CREATE OR REPLACE FUNCTION generate_code_ami()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_code BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 6 caractères
    code := upper(substring(md5(random()::text) from 1 for 6));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM utilisateurs WHERE code_ami = code) INTO exists_code;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT exists_code THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Politiques de sécurité RLS (Row Level Security)

-- Activer RLS sur toutes les tables
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE marques_villes ENABLE ROW LEVEL SECURITY;
ALTER TABLE amis ENABLE ROW LEVEL SECURITY;

-- Politiques pour utilisateurs
CREATE POLICY "Users can view own profile" ON utilisateurs
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON utilisateurs
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON utilisateurs
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour marques_villes
CREATE POLICY "Users can view own marked cities" ON marques_villes
  FOR SELECT USING (auth.uid() = id_utilisateur);

CREATE POLICY "Users can insert own marked cities" ON marques_villes
  FOR INSERT WITH CHECK (auth.uid() = id_utilisateur);

CREATE POLICY "Users can update own marked cities" ON marques_villes
  FOR UPDATE USING (auth.uid() = id_utilisateur);

CREATE POLICY "Users can delete own marked cities" ON marques_villes
  FOR DELETE USING (auth.uid() = id_utilisateur);

-- Politiques pour amis
CREATE POLICY "Users can view own friend relationships" ON amis
  FOR SELECT USING (auth.uid() = id_utilisateur1 OR auth.uid() = id_utilisateur2);

CREATE POLICY "Users can insert own friend relationships" ON amis
  FOR INSERT WITH CHECK (auth.uid() = id_utilisateur1);

CREATE POLICY "Users can update own friend relationships" ON amis
  FOR UPDATE USING (auth.uid() = id_utilisateur1 OR auth.uid() = id_utilisateur2);

CREATE POLICY "Users can delete own friend relationships" ON amis
  FOR DELETE USING (auth.uid() = id_utilisateur1 OR auth.uid() = id_utilisateur2);

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO utilisateurs (id, email, code_ami)
  VALUES (NEW.id, NEW.email, generate_code_ami());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil utilisateur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_marques_villes_utilisateur ON marques_villes(id_utilisateur);
CREATE INDEX IF NOT EXISTS idx_marques_villes_created_at ON marques_villes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_amis_utilisateur1 ON amis(id_utilisateur1);
CREATE INDEX IF NOT EXISTS idx_amis_utilisateur2 ON amis(id_utilisateur2);
CREATE INDEX IF NOT EXISTS idx_utilisateurs_code_ami ON utilisateurs(code_ami);

-- Vues utiles pour les requêtes complexes

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW stats_utilisateur AS
SELECT 
  u.id,
  u.email,
  COUNT(mv.id) as total_villes,
  COALESCE(AVG(mv.note), 0) as note_moyenne,
  COUNT(CASE WHEN mv.note = 5 THEN 1 END) as notes_5,
  COUNT(CASE WHEN mv.note = 4 THEN 1 END) as notes_4,
  COUNT(CASE WHEN mv.note = 3 THEN 1 END) as notes_3,
  COUNT(CASE WHEN mv.note = 2 THEN 1 END) as notes_2,
  COUNT(CASE WHEN mv.note = 1 THEN 1 END) as notes_1
FROM utilisateurs u
LEFT JOIN marques_villes mv ON u.id = mv.id_utilisateur
GROUP BY u.id, u.email;

-- Fonction pour obtenir les villes d'un ami (si partage activé)
CREATE OR REPLACE FUNCTION get_friend_cities(friend_code TEXT)
RETURNS TABLE (
  nom_ville TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  note INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mv.nom_ville,
    mv.latitude,
    mv.longitude,
    mv.note,
    mv.created_at
  FROM marques_villes mv
  JOIN utilisateurs u ON mv.id_utilisateur = u.id
  JOIN amis a ON (a.id_utilisateur1 = auth.uid() AND a.id_utilisateur2 = u.id)
     OR (a.id_utilisateur2 = auth.uid() AND a.id_utilisateur1 = u.id)
  WHERE u.code_ami = friend_code 
    AND a.partage_actif = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 