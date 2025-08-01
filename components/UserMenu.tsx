'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { ChevronDown, User, LogOut } from 'lucide-react'
import AccountPanel from './AccountPanel'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isAccountPanelOpen, setIsAccountPanelOpen] = useState(false)
  

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      console.log('🔄 UserMenu: Tentative de déconnexion...')
      await signOut()
      setIsOpen(false)
      console.log('✅ UserMenu: Déconnexion terminée')
    } catch (error: any) {
      console.error('❌ UserMenu: Erreur lors de la déconnexion:', error)
      alert(`Erreur de déconnexion: ${error.message || 'Erreur inconnue'}`)
    }
  }

  const pseudo = user?.user_metadata?.pseudo || user?.email?.split('@')[0] || 'Utilisateur'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors duration-200 shadow-lg"
      >
        <span className="font-medium text-gray-900">{pseudo}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">

            <button
              onClick={() => {
                setIsOpen(false)
                setIsAccountPanelOpen(true)
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <User className="w-4 h-4 mr-3" />
              Mon compte
            </button>
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      )}

      {/* Panneau de compte */}
      <AccountPanel 
        isOpen={isAccountPanelOpen}
        onClose={() => setIsAccountPanelOpen(false)}
      />
    </div>
  )
} 