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

/**
 * Attribue une couleur unique à un ami en évitant les doublons
 * @param friendId ID de l'ami
 * @param usedColors Couleurs déjà utilisées par d'autres amis
 * @returns Une couleur unique pour cet ami
 */
export function getUniqueColorForFriend(friendId: string, usedColors: string[] = []): FriendColor {
  // D'abord, essayer d'utiliser la couleur basée sur le hash (pour la cohérence)
  const preferredColor = getColorForFriend(friendId)
  
  // Si la couleur préférée n'est pas utilisée, la retourner
  if (!usedColors.includes(preferredColor.value)) {
    return preferredColor
  }
  
  // Sinon, chercher la première couleur disponible
  for (const color of FRIEND_COLORS) {
    if (!usedColors.includes(color.value)) {
      return color
    }
  }
  
  // Si toutes les couleurs sont utilisées (plus de 10 amis), 
  // revenir à la couleur basée sur le hash (il faudra des doublons)
  return preferredColor
}