'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X } from 'lucide-react'

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

interface SearchBarProps {
  onVilleSelect: (ville: { nom: string; lat: number; lng: number }) => void
}

export default function SearchBar({ onVilleSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const searchVilles = useCallback(async (searchQuery: string) => {
    console.log('Recherche pour:', searchQuery)
    if (searchQuery.length < 3) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=15&addressdetails=1&accept-language=fr&dedupe=0`
      console.log('URL API:', url)
      const response = await fetch(url)
      const data = await response.json()
      console.log('Réponse API:', data)
      console.log('Nombre de résultats avant déduplication:', data.length)
      
      // Supprimer les doublons basés sur le nom de la ville, le département ET le pays
      const uniqueResults = data.filter((item: SearchResult, index: number, self: SearchResult[]) => {
        const parts = item.display_name.split(', ')
        const cityName = parts[0].toLowerCase()
        
        // Extraire le département et le pays (même logique que formatLocation)
        let department = ''
        let country = ''
        
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i].trim()
          
          // Si c'est un pays
          if (part === 'France' || part === 'France métropolitaine') {
            country = 'france'
          } else if (part === 'Belgique' || part === 'Belgium') {
            country = 'belgique'
          } else if (part === 'Suisse' || part === 'Switzerland') {
            country = 'suisse'
          } else if (part === 'Luxembourg') {
            country = 'luxembourg'
          } else if (part === 'Monaco') {
            country = 'monaco'
          } else if (part === 'United States' || part === 'États-Unis' || part === 'USA') {
            country = 'usa'
          } else if (part === 'Canada') {
            country = 'canada'
          } else if (part === 'Espagne' || part === 'Spain') {
            country = 'espagne'
          } else if (part === 'Italie' || part === 'Italy') {
            country = 'italie'
          } else if (part === 'Allemagne' || part === 'Germany') {
            country = 'allemagne'
          } else if (part === 'Royaume-Uni' || part === 'United Kingdom') {
            country = 'uk'
          }
          // Si c'est un numéro de département (ex: "75", "92")
          else if (part.match(/^\d{2,3}$/)) {
            department = part.toLowerCase()
          }
          // Si c'est un nom de département ou région
          else if (part.includes('-de-') || part.includes('de ') || 
              part.includes('-et-') || part.includes('-sur-') || part.includes('-les-') ||
              part.includes('Haute') || part.includes('Bas') || part.includes('Nord') || 
              part.includes('Sud') || part.includes('Est') || part.includes('Ouest') ||
              part.includes('Loire') || part.includes('Rhin') || part.includes('Savoie') ||
              part.includes('Pyrénées') || part.includes('Alpes') || part.includes('Corse') ||
              part.includes('Île-de-France') || part.includes('Provence') || part.includes('Rhône') ||
              part.includes('Aquitaine') || part.includes('Bretagne') || part.includes('Normandie')) {
            if (!department) department = part.toLowerCase()
          }
        }
        
        // Si on n'a pas trouvé de pays explicitement, le dernier élément pourrait être le pays
        if (!country && parts.length > 1) {
          const lastPart = parts[parts.length - 1].trim().toLowerCase()
          if (lastPart && lastPart !== cityName) {
            country = lastPart
          }
        }
        
        // Créer une clé unique combinant ville + département + pays
        const uniqueKey = `${cityName}|${department}|${country}`
        console.log(`Clé unique pour "${parts[0]}": ${uniqueKey}`)
        
        return self.findIndex((result: SearchResult) => {
          const resultParts = result.display_name.split(', ')
          const resultCityName = resultParts[0].toLowerCase()
          
          let resultDepartment = ''
          let resultCountry = ''
          
          for (let i = 1; i < resultParts.length; i++) {
            const part = resultParts[i].trim()
            
            // Si c'est un pays
            if (part === 'France' || part === 'France métropolitaine') {
              resultCountry = 'france'
            } else if (part === 'Belgique' || part === 'Belgium') {
              resultCountry = 'belgique'
            } else if (part === 'Suisse' || part === 'Switzerland') {
              resultCountry = 'suisse'
            } else if (part === 'Luxembourg') {
              resultCountry = 'luxembourg'
            } else if (part === 'Monaco') {
              resultCountry = 'monaco'
            } else if (part === 'United States' || part === 'États-Unis' || part === 'USA') {
              resultCountry = 'usa'
            } else if (part === 'Canada') {
              resultCountry = 'canada'
            } else if (part === 'Espagne' || part === 'Spain') {
              resultCountry = 'espagne'
            } else if (part === 'Italie' || part === 'Italy') {
              resultCountry = 'italie'
            } else if (part === 'Allemagne' || part === 'Germany') {
              resultCountry = 'allemagne'
            } else if (part === 'Royaume-Uni' || part === 'United Kingdom') {
              resultCountry = 'uk'
            }
            // Si c'est un numéro de département (ex: "75", "92")
            else if (part.match(/^\d{2,3}$/)) {
              resultDepartment = part.toLowerCase()
            }
            // Si c'est un nom de département ou région
            else if (part.includes('-de-') || part.includes('de ') || 
                part.includes('-et-') || part.includes('-sur-') || part.includes('-les-') ||
                part.includes('Haute') || part.includes('Bas') || part.includes('Nord') || 
                part.includes('Sud') || part.includes('Est') || part.includes('Ouest') ||
                part.includes('Loire') || part.includes('Rhin') || part.includes('Savoie') ||
                part.includes('Pyrénées') || part.includes('Alpes') || part.includes('Corse') ||
                part.includes('Île-de-France') || part.includes('Provence') || part.includes('Rhône') ||
                part.includes('Aquitaine') || part.includes('Bretagne') || part.includes('Normandie')) {
              if (!resultDepartment) resultDepartment = part.toLowerCase()
            }
          }
          
          // Si on n'a pas trouvé de pays explicitement, le dernier élément pourrait être le pays
          if (!resultCountry && resultParts.length > 1) {
            const lastPart = resultParts[resultParts.length - 1].trim().toLowerCase()
            if (lastPart && lastPart !== resultCityName) {
              resultCountry = lastPart
            }
          }
          
          const resultUniqueKey = `${resultCityName}|${resultDepartment}|${resultCountry}`
          return resultUniqueKey === uniqueKey
        }) === index
      })
      
      console.log('Nombre de résultats après déduplication:', uniqueResults.length)
      uniqueResults.forEach((result, index) => {
        console.log(`Résultat ${index + 1}:`, result.display_name)
      })
      
      setResults(uniqueResults)
    } catch (error) {
      console.error('Erreur lors de la recherche:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setIsOpen(true)
    
    // Annuler la recherche précédente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (value.length >= 3) {
      // Attendre 500ms avant de lancer la recherche
      timeoutRef.current = setTimeout(() => {
        searchVilles(value)
      }, 500)
    } else {
      setResults([])
    }
  }

  const handleVilleSelect = (result: SearchResult) => {
    const ville = {
      nom: result.display_name.split(',')[0], // Prendre juste le nom de la ville
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
    
    onVilleSelect(ville)
    setQuery('')
    setIsOpen(false)
  }

  const formatLocation = (displayName: string) => {
    const parts = displayName.split(', ')
    console.log('Formatage de:', displayName, 'Parties:', parts)
    
    // Chercher le département, le pays et autres infos
    let departmentNumber = ''
    let departmentName = ''
    let country = ''
    let region = ''
    let state = ''
    
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim()
      console.log(`Analyse partie ${i}: "${part}"`)
      
      // Si c'est un pays (priorité à l'identification des pays)
      if (part === 'France' || part === 'France métropolitaine') {
        country = 'France'
        console.log('Pays trouvé:', country)
      } else if (part === 'Belgique' || part === 'Belgium') {
        country = 'Belgique'
      } else if (part === 'Suisse' || part === 'Switzerland') {
        country = 'Suisse'
      } else if (part === 'Luxembourg') {
        country = 'Luxembourg'
      } else if (part === 'Monaco') {
        country = 'Monaco'
      } else if (part === 'United States' || part === 'États-Unis' || part === 'USA') {
        country = 'États-Unis'
      } else if (part === 'Canada') {
        country = 'Canada'
      } else if (part === 'Espagne' || part === 'Spain') {
        country = 'Espagne'
      } else if (part === 'Italie' || part === 'Italy') {
        country = 'Italie'
      } else if (part === 'Allemagne' || part === 'Germany') {
        country = 'Allemagne'
      } else if (part === 'Royaume-Uni' || part === 'United Kingdom') {
        country = 'Royaume-Uni'
      }
      // Si c'est un numéro de département français (ex: "75", "92")
      else if (part.match(/^\d{2,3}$/)) {
        departmentNumber = part
        console.log('Département numérique trouvé:', departmentNumber)
      }
      // Si c'est un nom de département ou région française
      else if (part.includes('-de-') || part.includes('de ') || 
               part.includes('-et-') || part.includes('-sur-') || part.includes('-les-') ||
               part.includes('Haute') || part.includes('Bas') || part.includes('Nord') || 
               part.includes('Sud') || part.includes('Est') || part.includes('Ouest') ||
               part.includes('Loire') || part.includes('Rhin') || part.includes('Savoie') ||
               part.includes('Pyrénées') || part.includes('Alpes') || part.includes('Corse') ||
               part.includes('Île-de-France') || part.includes('Provence') || part.includes('Rhône') ||
               part.includes('Aquitaine') || part.includes('Bretagne') || part.includes('Normandie')) {
        if (!departmentName) departmentName = part
        console.log('Département/région trouvé:', part)
      }
      // Si c'est un état (pour les pays comme USA, Canada)
      else if (!country && (part.includes('Texas') || part.includes('California') || part.includes('New York') || 
               part.includes('Ontario') || part.includes('Quebec') || part.length <= 3)) {
        state = part
        console.log('État trouvé:', state)
      }
      // Sinon, c'est peut-être une région
      else if (!departmentName && !state && i < parts.length - 1) {
        region = part
        console.log('Région trouvée:', region)
      }
    }
    
    // Si on n'a pas trouvé de pays explicitement, le dernier élément pourrait être le pays
    if (!country && parts.length > 1) {
      const lastPart = parts[parts.length - 1].trim()
      if (lastPart && lastPart !== parts[0]) {
        country = lastPart
        console.log('Pays déduit du dernier élément:', country)
      }
    }
    
    // Construire l'affichage selon le pays
    const locationParts = []
    
    if (country === 'France') {
      // Pour la France : afficher numéro de département + nom (si disponible) + pays
      if (departmentNumber && departmentName) {
        locationParts.push(`${departmentName} (${departmentNumber})`)
      } else if (departmentNumber) {
        locationParts.push(`Département ${departmentNumber}`)
      } else if (departmentName) {
        locationParts.push(departmentName)
      } else if (region) {
        locationParts.push(region)
      }
      locationParts.push('France')
    } else {
      // Pour les autres pays : région/état + pays
      if (state) {
        locationParts.push(state)
      } else if (region) {
        locationParts.push(region)
      } else if (departmentName) {
        locationParts.push(departmentName)
      }
      if (country) {
        locationParts.push(country)
      }
    }
    
    console.log('Résultat formatage:', locationParts.join(', '))
    return locationParts.length > 0 ? locationParts.join(', ') : parts.slice(1).join(', ')
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setIsOpen(false)
  }

  return (
    <div className="relative z-50" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Rechercher une ville..."
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent bg-white shadow-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="w-5 h-5 border-2 border-fck-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2">Recherche en cours...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>Aucun résultat trouvé</p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleVilleSelect(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center"
                >
                    <MapPin className="w-4 h-4 text-fck-orange mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        <span className="font-medium text-fck-orange">
                          {formatLocation(result.display_name)}
                        </span>
                      </div>
                    </div>
                  </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 