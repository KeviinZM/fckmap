'use client'

import Link from 'next/link'
import { FileText, Shield, Gavel, Mail } from 'lucide-react'

export default function LegalBar() {
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-white bg-opacity-95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
      <div className="px-4 py-2">
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs whitespace-nowrap">
          <Link 
            href="/mentions-legales"
            className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors py-1 sm:py-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="w-3 h-3" />
            <span>Mentions légales</span>
          </Link>

          <span className="text-gray-300">•</span>

          <Link 
            href="/politique-confidentialite"
            className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors py-1 sm:py-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Shield className="w-3 h-3" />
            <span>Confidentialité</span>
          </Link>

          <span className="text-gray-300">•</span>

          <Link 
            href="/conditions-utilisation"
            className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors py-1 sm:py-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Gavel className="w-3 h-3" />
            <span>Conditions d'utilisation</span>
          </Link>

          <span className="text-gray-300">•</span>

          <Link 
            href="/contact"
            className="flex items-center space-x-1 text-gray-600 hover:text-orange-500 transition-colors py-1 sm:py-0"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Mail className="w-3 h-3" />
            <span>Contact</span>
          </Link>

          <span className="text-gray-300 hidden sm:block">•</span>

          <div className="hidden sm:flex items-center text-gray-500 text-xs">
            <span>© {new Date().getFullYear()} FCK</span>
          </div>
        </div>
      </div>
    </div>
  )
}