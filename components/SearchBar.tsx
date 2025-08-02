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

interface LocationInfo {
  department: string
  country: string
}

// Fonction utilitaire pour analyser les informations géographiques
const parseLocationInfo = (parts: string[]): LocationInfo => {
  let department = ''
  let country = ''
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim()
    
    // Détection des pays
    const countryMap: Record<string, string> = {
      'France': 'france',
      'France métropolitaine': 'france',
      'Belgique': 'belgique',
      'Belgium': 'belgique',
      'Suisse': 'suisse',
      'Switzerland': 'suisse',
      'Luxembourg': 'luxembourg',
      'Monaco': 'monaco',
      'United States': 'usa',
      'États-Unis': 'usa',
      'USA': 'usa',
      'Canada': 'canada',
      'Espagne': 'espagne',
      'Spain': 'espagne',
      'Italie': 'italie',
      'Italy': 'italie',
      'Allemagne': 'allemagne',
      'Germany': 'allemagne',
      'Royaume-Uni': 'uk',
      'United Kingdom': 'uk'
    }
    
    if (countryMap[part]) {
      country = countryMap[part]
    }
    // Numéro de département français
    else if (part.match(/^\d{2,3}$/)) {
      department = part.toLowerCase()
    }
    // Noms de département ou région française
    else if (
      part.includes('-de-') || part.includes('de ') || 
      part.includes('-et-') || part.includes('-sur-') || part.includes('-les-') ||
      part.includes('Haute') || part.includes('Bas') || part.includes('Nord') || 
      part.includes('Sud') || part.includes('Est') || part.includes('Ouest') ||
      part.includes('Loire') || part.includes('Rhin') || part.includes('Savoie') ||
      part.includes('Pyrénées') || part.includes('Alpes') || part.includes('Corse') ||
      part.includes('Île-de-France') || part.includes('Provence') || part.includes('Rhône') ||
      part.includes('Aquitaine') || part.includes('Bretagne') || part.includes('Normandie')
    ) {
      if (!department) department = part.toLowerCase()
    }
  }
  
  // Si on n'a pas trouvé de pays explicitement, le dernier élément pourrait être le pays
  if (!country && parts.length > 1) {
    const lastPart = parts[parts.length - 1].trim().toLowerCase()
    const cityName = parts[0].toLowerCase()
    if (lastPart && lastPart !== cityName) {
      country = lastPart
    }
  }
  
  return { department, country }
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
        const { department, country } = parseLocationInfo(parts)
        
        // Créer une clé unique combinant ville + département + pays
        const uniqueKey = `${cityName}|${department}|${country}`
        console.log(`Clé unique pour "${parts[0]}": ${uniqueKey}`)
        
        return self.findIndex((result: SearchResult) => {
          const resultParts = result.display_name.split(', ')
          const resultCityName = resultParts[0].toLowerCase()
          const resultLocationInfo = parseLocationInfo(resultParts)
          
          const resultUniqueKey = `${resultCityName}|${resultLocationInfo.department}|${resultLocationInfo.country}`
          return resultUniqueKey === uniqueKey
        }) === index
      })
      
      console.log('Nombre de résultats après déduplication:', uniqueResults.length)
      
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
    
    // Fermer le clavier virtuel sur mobile
    if (document.activeElement instanceof HTMLInputElement) {
      document.activeElement.blur()
    }
  }

  const formatLocation = (displayName: string) => {
    const parts = displayName.split(', ')
    console.log('Formatage de:', displayName, 'Parties:', parts)
    
    const { department, country } = parseLocationInfo(parts)
    
    // Mapping des codes pays vers noms lisibles
    const countryDisplayNames: Record<string, string> = {
      'france': 'France',
      'belgique': 'Belgique',
      'suisse': 'Suisse',
      'luxembourg': 'Luxembourg',
      'monaco': 'Monaco',
      'usa': 'États-Unis',
      'canada': 'Canada',
      'espagne': 'Espagne',
      'italie': 'Italie',
      'allemagne': 'Allemagne',
      'uk': 'Royaume-Uni'
    }
    
    const locationParts = []
    
    // Analyser les départements et régions pour la France
    if (country === 'france') {
      let departmentNumber = ''
      let departmentName = ''
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim()
        if (part.match(/^\d{2,3}$/)) {
          departmentNumber = part
        } else if (
          part.includes('-de-') || part.includes('de ') || 
          part.includes('-et-') || part.includes('-sur-') || part.includes('-les-') ||
          part.includes('Haute') || part.includes('Bas') || part.includes('Nord') || 
          part.includes('Sud') || part.includes('Est') || part.includes('Ouest') ||
          part.includes('Loire') || part.includes('Rhin') || part.includes('Savoie') ||
          part.includes('Pyrénées') || part.includes('Alpes') || part.includes('Corse') ||
          part.includes('Île-de-France') || part.includes('Provence') || part.includes('Rhône') ||
          part.includes('Aquitaine') || part.includes('Bretagne') || part.includes('Normandie')
        ) {
          if (!departmentName) departmentName = part
        }
      }
      
      if (departmentNumber && departmentName) {
        locationParts.push(`${departmentName} (${departmentNumber})`)
      } else if (departmentNumber) {
        locationParts.push(`Département ${departmentNumber}`)
      } else if (departmentName) {
        locationParts.push(departmentName)
      } else if (department) {
        locationParts.push(department)
      }
      
      locationParts.push('France')
    } else {
      // Pour les autres pays
      if (department) {
        locationParts.push(department)
      }
      
      const displayCountry = countryDisplayNames[country] || country || parts[parts.length - 1]
      if (displayCountry) {
        locationParts.push(displayCountry)
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
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Rechercher..."
          className="w-full pl-8 sm:pl-10 pr-10 sm:pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent bg-white shadow-lg text-sm sm:text-sm"
          autoComplete="off"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck="false"
          inputMode="search"
          enterKeyHint="search"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-1 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 sm:p-1"
            aria-label="Effacer la recherche"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}
      </div>

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-64 sm:max-h-60 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 sm:p-4 text-center text-gray-500">
              <div className="w-5 h-5 border-2 border-fck-orange border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-2 text-sm sm:text-base">Recherche en cours...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 sm:p-4 text-center text-gray-500">
              <p className="text-sm sm:text-base">Aucun résultat trouvé</p>
            </div>
          ) : (
            <div>
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleVilleSelect(result)}
                  className="w-full px-4 py-4 sm:py-3 text-left hover:bg-gray-50 active:bg-gray-100 border-b border-gray-100 last:border-b-0 flex items-center transition-colors duration-150"
                >
                    <MapPin className="w-5 h-5 sm:w-4 sm:h-4 text-fck-orange mr-3 sm:mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate text-base sm:text-sm">
                        {result.display_name.split(',')[0]}
                      </div>
                      <div className="text-sm sm:text-xs text-gray-500 truncate mt-0.5 sm:mt-0">
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