export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-6">
            <nav className="text-sm text-gray-600 mb-4">
              <a href="/" className="text-orange-500 hover:underline">← Retour à FCK</a>
              {' | '}
              <a href="/politique-confidentialite" className="text-gray-600 hover:text-orange-500">Politique de confidentialité</a>
              {' | '}
              <a href="/conditions-utilisation" className="text-gray-600 hover:text-orange-500">Conditions d'utilisation</a>
              {' | '}
              <a href="/contact" className="text-gray-600 hover:text-orange-500">Contact</a>
            </nav>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentions Légales</h1>
          <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Éditeur du site</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Nom du site :</strong> FCK (fckmap.fr)</p>
              <p><strong>Description :</strong> Plateforme de cartographie sociale interactive permettant aux utilisateurs de marquer et évaluer des villes, et de partager leurs expériences avec leurs amis.</p>
              <p><strong>Statut :</strong> Site web personnel</p>
              <p><strong>Email de contact :</strong> contact@fckmap.fr</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Hébergement</h2>
            <div className="space-y-4 text-gray-700">
              <p><strong>Hébergeur :</strong> Vercel Inc.</p>
              <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis</p>
              <p><strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Services techniques</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Base de données</h3>
              <p><strong>Fournisseur :</strong> Supabase Inc.</p>
              <p><strong>Site web :</strong> <a href="https://supabase.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">supabase.com</a></p>
              
              <h3 className="text-lg font-medium">Cartes et géolocalisation</h3>
              <p><strong>Fournisseur :</strong> OpenStreetMap & Leaflet</p>
              <p><strong>API Geocoding :</strong> Nominatim (OpenStreetMap)</p>
              
              <h3 className="text-lg font-medium">Publicités</h3>
              <p><strong>Régie publicitaire :</strong> Google AdSense</p>
              <p><strong>Fournisseur :</strong> Google LLC</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Propriété intellectuelle</h2>
            <div className="space-y-4 text-gray-700">
              <p>Le site FCK, son design, sa structure et ses fonctionnalités sont protégés par le droit d'auteur.</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Le code source est propriétaire</li>
                <li>Les cartes proviennent d'OpenStreetMap (licence ODbL)</li>
                <li>Les données utilisateur appartiennent aux utilisateurs</li>
                <li>Le concept et l'implémentation sont originaux</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Responsabilité</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Contenu utilisateur</h3>
              <p>Les utilisateurs sont responsables du contenu qu'ils publient (villes marquées, notes, commentaires). FCK se réserve le droit de modérer et supprimer tout contenu inapproprié.</p>
              
              <h3 className="text-lg font-medium">Disponibilité du service</h3>
              <p>Nous nous efforçons de maintenir le service disponible 24h/24, mais ne garantissons pas une disponibilité absolue. Des interruptions peuvent survenir pour maintenance ou raisons techniques.</p>
              
              <h3 className="text-lg font-medium">Données cartographiques</h3>
              <p>Les informations géographiques proviennent d'OpenStreetMap et peuvent comporter des inexactitudes. FCK n'est pas responsable des erreurs de géolocalisation.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Cookies et traceurs</h2>
            <div className="space-y-4 text-gray-700">
              <p>Le site utilise des cookies pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>L'authentification et la gestion des sessions</li>
                <li>Les préférences utilisateur</li>
                <li>L'analyse de trafic (Google Analytics)</li>
                <li>La personnalisation des publicités (Google AdSense)</li>
              </ul>
              <p>Conformément à la réglementation, vous pouvez configurer votre navigateur pour refuser les cookies.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Données personnelles</h2>
            <div className="space-y-4 text-gray-700">
              <p>Le traitement des données personnelles est détaillé dans notre <a href="/politique-confidentialite" className="text-blue-600 hover:underline">Politique de Confidentialité</a>.</p>
              <p>FCK est conforme au Règlement Général sur la Protection des Données (RGPD).</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Droit applicable</h2>
            <div className="space-y-4 text-gray-700">
              <p>Les présentes mentions légales sont soumises au droit français.</p>
              <p>En cas de litige, les tribunaux français seront seuls compétents.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Contact</h2>
            <div className="space-y-4 text-gray-700">
              <p>Pour toute question relative à ces mentions légales :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Email : contact@fckmap.fr</li>
                <li>Via le formulaire de <a href="/contact" className="text-blue-600 hover:underline">contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}