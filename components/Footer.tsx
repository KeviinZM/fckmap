import Link from 'next/link'
import { Mail, MapPin, Users } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <MapPin className="w-6 h-6 text-orange-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-900">FCK</h3>
            </div>
            <p className="text-gray-600 mb-4">
              La carte interactive pour marquer et partager vos expériences de voyage avec vos amis.
            </p>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-2" />
              <span>Plateforme sociale de cartographie</span>
            </div>
          </div>

          {/* Pages légales */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Informations légales
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/mentions-legales" 
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link 
                  href="/politique-confidentialite" 
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link 
                  href="/conditions-utilisation" 
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Conditions d'utilisation
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-600 hover:text-orange-500 transition-colors"
                >
                  Nous contacter
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:contact@fckmap.fr" 
                  className="text-gray-600 hover:text-fck-orange transition-colors flex items-center"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  contact@fckmap.fr
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Ligne de séparation et copyright */}
        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} FCK. Tous droits réservés.
            </p>
            <div className="mt-4 sm:mt-0">
              <p className="text-gray-500 text-xs">
                Fait avec ❤️ pour la communauté des voyageurs
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}