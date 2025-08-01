// Constantes et utilitaires pour les couleurs d'amis

export interface FriendColor {
  name: string
  value: string
  lightValue: string // Version plus claire pour les backgrounds
}

export const FRIEND_COLORS: FriendColor[] = [
  { name: 'Bleu', value: '#3B82F6', lightValue: '#DBEAFE' },
  { name: 'Rouge', value: '#EF4444', lightValue: '#FEE2E2' },
  { name: 'Vert', value: '#10B981', lightValue: '#D1FAE5' },
  { name: 'Violet', value: '#8B5CF6', lightValue: '#EDE9FE' },
  { name: 'Rose', value: '#EC4899', lightValue: '#FCE7F3' },
  { name: 'Orange', value: '#F97316', lightValue: '#FED7AA' },
  { name: 'Jaune', value: '#EAB308', lightValue: '#FEF3C7' },
  { name: 'Cyan', value: '#06B6D4', lightValue: '#CFFAFE' },
  { name: 'Indigo', value: '#6366F1', lightValue: '#E0E7FF' },
  { name: 'Émeraude', value: '#059669', lightValue: '#D1FAE5' }
]

/**
 * Attribue automatiquement une couleur à un ami basée sur son ID
 * Assure une couleur consistante pour le même ami
 */
export function getColorForFriend(friendId: string): FriendColor {
  // Créer un hash simple à partir de l'ID
  let hash = 0
  for (let i = 0; i < friendId.length; i++) {
    const char = friendId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir en 32bit integer
  }
  
  // Utiliser le hash pour sélectionner une couleur
  const colorIndex = Math.abs(hash) % FRIEND_COLORS.length
  return FRIEND_COLORS[colorIndex]
}

/**
 * Récupère une couleur par son index (utile pour les tests)
 */
export function getColorByIndex(index: number): FriendColor {
  return FRIEND_COLORS[index % FRIEND_COLORS.length]
}

/**
 * Récupère toutes les couleurs disponibles
 */
export function getAllColors(): FriendColor[] {
  return FRIEND_COLORS
}