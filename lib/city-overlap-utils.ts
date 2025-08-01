// Utilitaires pour gérer les superpositions de villes entre utilisateur et amis

import { VilleMarquee, VilleAmi } from './supabase'

export interface CityOverlap {
  cityName: string
  latitude: number
  longitude: number
  userCity: VilleMarquee | null // Ville de l'utilisateur si il l'a marquée
  friendCities: VilleAmi[] // Villes des amis qui ont marqué la même ville
  averageRating: number
  totalMarkings: number
}

/**
 * Détermine si deux villes sont considérées comme identiques
 * Basé sur le nom ET la proximité géographique
 */
export function areSameCities(
  city1: { nom_ville: string; latitude: number; longitude: number },
  city2: { nom_ville: string; latitude: number; longitude: number }
): boolean {
  // 1. Comparaison des noms (normalisés)
  const name1 = normalizeCityName(city1.nom_ville)
  const name2 = normalizeCityName(city2.nom_ville)
  
  if (name1 !== name2) {
    return false
  }
  
  // 2. Comparaison géographique (distance < 5km pour considérer comme même ville)
  const distance = calculateDistance(
    city1.latitude, city1.longitude,
    city2.latitude, city2.longitude
  )
  
  return distance < 5 // 5km de tolérance
}

/**
 * Normalise le nom d'une ville pour la comparaison
 */
function normalizeCityName(cityName: string): string {
  return cityName
    .toLowerCase()
    .trim()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[-\s]/g, '') // Enlever espaces et tirets
}

/**
 * Calcule la distance entre deux points en kilomètres (formule de Haversine)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Rayon de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Analyse les superpositions entre villes utilisateur et villes d'amis
 */
export function analyzeCityOverlaps(
  userCities: VilleMarquee[],
  friendCities: VilleAmi[]
): CityOverlap[] {
  const overlaps: CityOverlap[] = []
  
  // 1. Pour chaque ville de l'utilisateur, chercher les amis qui ont marqué la même
  for (const userCity of userCities) {
    const matchingFriendCities = friendCities.filter(friendCity => 
      areSameCities(userCity, friendCity)
    )
    
    if (matchingFriendCities.length > 0) {
      // Il y a superposition !
      const allRatings = [userCity.note, ...matchingFriendCities.map(fc => fc.note)]
      const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      
      overlaps.push({
        cityName: userCity.nom_ville,
        latitude: userCity.latitude,
        longitude: userCity.longitude,
        userCity: userCity,
        friendCities: matchingFriendCities,
        averageRating: Math.round(averageRating * 10) / 10, // Arrondi à 1 décimale
        totalMarkings: 1 + matchingFriendCities.length
      })
    }
  }
  
  // 2. Pour les villes d'amis sans l'utilisateur (pas de superposition mais potentiellement entre amis)
  const processedFriendCities = new Set<string>()
  
  for (const friendCity of friendCities) {
    const cityKey = `${normalizeCityName(friendCity.nom_ville)}_${Math.round(friendCity.latitude * 1000)}_${Math.round(friendCity.longitude * 1000)}`
    
    if (processedFriendCities.has(cityKey)) {
      continue // Déjà traité
    }
    
    // Vérifier si l'utilisateur a déjà marqué cette ville
    const userHasThisCity = userCities.some(userCity => areSameCities(userCity, friendCity))
    if (userHasThisCity) {
      continue // Déjà traité dans la première boucle
    }
    
    // Chercher d'autres amis qui ont marqué la même ville
    const matchingFriendCities = friendCities.filter(fc => 
      fc.id !== friendCity.id && areSameCities(friendCity, fc)
    )
    
    if (matchingFriendCities.length > 0) {
      // Superposition entre amis seulement
      const allFriendCities = [friendCity, ...matchingFriendCities]
      const allRatings = allFriendCities.map(fc => fc.note)
      const averageRating = allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      
      overlaps.push({
        cityName: friendCity.nom_ville,
        latitude: friendCity.latitude,
        longitude: friendCity.longitude,
        userCity: null,
        friendCities: allFriendCities,
        averageRating: Math.round(averageRating * 10) / 10,
        totalMarkings: allFriendCities.length
      })
      
      // Marquer toutes ces villes comme traitées
      allFriendCities.forEach(fc => {
        const key = `${normalizeCityName(fc.nom_ville)}_${Math.round(fc.latitude * 1000)}_${Math.round(fc.longitude * 1000)}`
        processedFriendCities.add(key)
      })
    }
    
    processedFriendCities.add(cityKey)
  }
  
  return overlaps
}

/**
 * Filtre les villes qui ne sont PAS en superposition
 */
export function filterNonOverlappingCities<T extends { id: string; nom_ville: string; latitude: number; longitude: number }>(
  cities: T[],
  overlaps: CityOverlap[]
): T[] {
  return cities.filter(city => {
    return !overlaps.some(overlap => {
      if (overlap.userCity && overlap.userCity.id === city.id) {
        return true // Cette ville est en superposition
      }
      if (overlap.friendCities.some(fc => fc.id === city.id)) {
        return true // Cette ville est en superposition
      }
      return false
    })
  })
}