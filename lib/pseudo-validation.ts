// Utilitaires de validation pour les pseudos utilisateur

export interface PseudoValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Valide un pseudo selon les règles définies
 */
export function validatePseudo(pseudo: string): PseudoValidationResult {
  // Nettoyer le pseudo (trim)
  const cleanPseudo = pseudo.trim()
  
  // Vérifier la longueur
  if (cleanPseudo.length < 3) {
    return {
      isValid: false,
      error: 'Le pseudo doit contenir au moins 3 caractères'
    }
  }
  
  if (cleanPseudo.length > 20) {
    return {
      isValid: false,
      error: 'Le pseudo ne peut pas dépasser 20 caractères'
    }
  }
  
  // Vérifier les caractères autorisés
  const pseudoRegex = /^[a-zA-Z0-9_-]+$/
  if (!pseudoRegex.test(cleanPseudo)) {
    return {
      isValid: false,
      error: 'Le pseudo ne peut contenir que des lettres, chiffres, tirets et underscores'
    }
  }
  
  // Vérifier que ce n'est pas que des caractères spéciaux
  const hasLetterOrNumber = /[a-zA-Z0-9]/.test(cleanPseudo)
  if (!hasLetterOrNumber) {
    return {
      isValid: false,
      error: 'Le pseudo doit contenir au moins une lettre ou un chiffre'
    }
  }
  
  // Pseudos interdits/réservés
  const forbiddenPseudos = [
    'admin', 'moderator', 'mod', 'support', 'root', 'system', 'null', 'undefined',
    'fck', 'fckmap', 'user', 'utilisateur', 'test', 'demo', 'example'
  ]
  
  if (forbiddenPseudos.includes(cleanPseudo.toLowerCase())) {
    return {
      isValid: false,
      error: 'Ce pseudo est réservé, veuillez en choisir un autre'
    }
  }
  
  return { isValid: true }
}

/**
 * Normalise un pseudo (trim + limite de longueur)
 */
export function normalizePseudo(pseudo: string): string {
  return pseudo.trim().substring(0, 20)
}

/**
 * Génère des suggestions de pseudo basées sur l'email
 */
export function generatePseudoSuggestions(email: string): string[] {
  const basePseudo = email.split('@')[0]
  const suggestions: string[] = []
  
  // Suggestion de base
  if (validatePseudo(basePseudo).isValid) {
    suggestions.push(basePseudo)
  }
  
  // Variations avec des nombres
  for (let i = 1; i <= 5; i++) {
    const suggestion = `${basePseudo}${i}`
    if (validatePseudo(suggestion).isValid) {
      suggestions.push(suggestion)
    }
  }
  
  // Variations avec année courante
  const currentYear = new Date().getFullYear().toString().slice(-2)
  const yearSuggestion = `${basePseudo}${currentYear}`
  if (validatePseudo(yearSuggestion).isValid) {
    suggestions.push(yearSuggestion)
  }
  
  return suggestions.slice(0, 3) // Limiter à 3 suggestions
}