-- ========================================
-- FONCTIONS RPC POUR LE SYSTÈME D'AMIS (VERSION CORRIGÉE)
-- ========================================

-- Supprimer les anciennes fonctions si elles existent
DROP FUNCTION IF EXISTS find_user_by_code_ami(TEXT);
DROP FUNCTION IF EXISTS get_user_info_by_id(UUID);

-- Fonction pour chercher un utilisateur par son code ami
CREATE OR REPLACE FUNCTION find_user_by_code_ami(code_ami_search TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  code_ami TEXT,
  pseudo TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    (au.raw_user_meta_data->>'code_ami')::TEXT as code_ami,
    (au.raw_user_meta_data->>'pseudo')::TEXT as pseudo
  FROM auth.users au
  WHERE (au.raw_user_meta_data->>'code_ami') = code_ami_search
    AND au.deleted_at IS NULL
  LIMIT 1;
END;
$$;

-- Fonction pour récupérer les infos d'un utilisateur par son ID
CREATE OR REPLACE FUNCTION get_user_info_by_id(user_id_search UUID)
RETURNS TABLE(
  id UUID,
  email TEXT,
  code_ami TEXT,
  pseudo TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id,
    au.email::TEXT,
    (au.raw_user_meta_data->>'code_ami')::TEXT as code_ami,
    (au.raw_user_meta_data->>'pseudo')::TEXT as pseudo
  FROM auth.users au
  WHERE au.id = user_id_search
    AND au.deleted_at IS NULL
  LIMIT 1;
END;
$$;

-- Accordez les permissions d'exécution à authenticated users
GRANT EXECUTE ON FUNCTION find_user_by_code_ami(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_info_by_id(UUID) TO authenticated;

-- Test immédiat
SELECT 'Test fonction find_user_by_code_ami:' as test_name;
SELECT * FROM find_user_by_code_ami('7UAD1I');

SELECT 'Test fonction get_user_info_by_id:' as test_name;
SELECT * FROM get_user_info_by_id('0ff28927-b43a-4d45-bb6e-b13b4802b494');