'use client'

import { useState } from 'react'
import { Mail, MessageSquare, User, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulation d'envoi (à remplacer par votre API)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 1000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Message envoyé !</h1>
            <p className="text-gray-600 mb-6">
              Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="bg-fck-orange text-white px-6 py-2 rounded-lg hover:bg-fck-orange-dark transition-colors"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <nav className="text-sm text-gray-600 mb-4">
              <a href="/" className="text-orange-500 hover:underline">← Retour à FCK</a>
              {' | '}
              <a href="/mentions-legales" className="text-gray-600 hover:text-orange-500">Mentions légales</a>
              {' | '}
              <a href="/politique-confidentialite" className="text-gray-600 hover:text-orange-500">Politique de confidentialité</a>
              {' | '}
              <a href="/conditions-utilisation" className="text-gray-600 hover:text-orange-500">Conditions d'utilisation</a>
            </nav>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Contactez-nous</h1>
          <p className="text-gray-600 mb-8">
            Une question, une suggestion ou un problème ? N'hésitez pas à nous contacter !
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Envoyer un message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="question-generale">Question générale</option>
                    <option value="probleme-technique">Problème technique</option>
                    <option value="suggestion">Suggestion d'amélioration</option>
                    <option value="signalement">Signalement de contenu</option>
                    <option value="compte">Problème de compte</option>
                    <option value="partenariat">Partenariat</option>
                    <option value="presse">Demande presse</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fck-orange focus:border-transparent resize-none"
                      placeholder="Décrivez votre demande en détail..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-fck-orange text-white py-2 px-4 rounded-lg hover:bg-fck-orange-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Informations de contact */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Autres moyens de contact</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-fck-orange mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Email direct</h3>
                    <p className="text-gray-600">contact@fckmap.fr</p>
                    <p className="text-sm text-gray-500">Réponse sous 24-48h</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Questions fréquentes</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Comment ajouter un ami ?</h4>
                      <p className="text-sm text-gray-600">Utilisez le code ami unique de votre ami dans la section "Mes Amis".</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Comment modifier mon pseudo ?</h4>
                      <p className="text-sm text-gray-600">Cliquez sur l'icône d'édition dans "Mon compte" pour changer votre pseudo.</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Mes données sont-elles sécurisées ?</h4>
                      <p className="text-sm text-gray-600">Oui, nous respectons le RGPD et chiffrons toutes les données. Consultez notre <a href="/politique-confidentialite" className="text-blue-600 hover:underline">politique de confidentialité</a>.</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-medium text-gray-800 mb-3">Signaler un problème</h3>
                  <p className="text-sm text-gray-600">
                    Si vous rencontrez un bug ou un comportement inapproprié, 
                    utilisez le formulaire ci-contre en sélectionnant le sujet approprié.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}