export default function PolitiqueConfidentialite() {
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
              <a href="/conditions-utilisation" className="text-gray-600 hover:text-orange-500">Conditions d'utilisation</a>
              {' | '}
              <a href="/contact" className="text-gray-600 hover:text-orange-500">Contact</a>
            </nav>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Politique de Confidentialité</h1>
          <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Informations collectées</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Données de compte</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Adresse email (pour l'authentification)</li>
                <li>Pseudo choisi (affiché publiquement)</li>
                <li>Date de création du compte</li>
              </ul>
              
              <h3 className="text-lg font-medium">Données d'utilisation</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Villes marquées et évaluées par l'utilisateur</li>
                <li>Notes attribuées aux villes (1-5 étoiles)</li>
                <li>Relations d'amitié avec d'autres utilisateurs</li>
                <li>Historique de navigation sur le site</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Utilisation des données</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous utilisons vos données pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Fournir et améliorer nos services de cartographie sociale</li>
                <li>Personnaliser votre expérience utilisateur</li>
                <li>Faciliter la connexion avec vos amis</li>
                <li>Afficher des publicités pertinentes via Google AdSense</li>
                <li>Analyser l'utilisation du site pour son amélioration</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Publicités (Google AdSense)</h2>
            <div className="space-y-4 text-gray-700">
              <p>Notre site utilise Google AdSense pour afficher des publicités. Google peut :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Utiliser des cookies pour personnaliser les annonces</li>
                <li>Collecter des informations sur vos centres d'intérêt</li>
                <li>Afficher des publicités basées sur vos visites précédentes</li>
              </ul>
              <p>Vous pouvez gérer vos préférences publicitaires sur <a href="https://adssettings.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">adssettings.google.com</a></p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Stockage et sécurité</h2>
            <div className="space-y-4 text-gray-700">
              <p>Vos données sont stockées de manière sécurisée :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Base de données : Supabase (conforme RGPD)</li>
                <li>Hébergement : Vercel (serveurs sécurisés)</li>
                <li>Chiffrement des données en transit et au repos</li>
                <li>Accès restreint aux données personnelles</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Vos droits (RGPD)</h2>
            <div className="space-y-4 text-gray-700">
              <p>Conformément au RGPD, vous disposez des droits suivants :</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Droit d'accès</strong> : Connaître les données que nous détenons sur vous</li>
                <li><strong>Droit de rectification</strong> : Corriger vos données personnelles</li>
                <li><strong>Droit à l'effacement</strong> : Supprimer votre compte et vos données</li>
                <li><strong>Droit à la portabilité</strong> : Récupérer vos données dans un format lisible</li>
                <li><strong>Droit d'opposition</strong> : Vous opposer au traitement de vos données</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Cookies</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous utilisons des cookies pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Maintenir votre session de connexion</li>
                <li>Mémoriser vos préférences</li>
                <li>Analyser le trafic du site (Google Analytics)</li>
                <li>Afficher des publicités personnalisées (Google AdSense)</li>
              </ul>
              <p>Vous pouvez désactiver les cookies dans les paramètres de votre navigateur.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Partage des données</h2>
            <div className="space-y-4 text-gray-700">
              <p>Nous ne vendons jamais vos données personnelles. Elles peuvent être partagées uniquement :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Avec vos amis (villes marquées et notes, selon vos paramètres)</li>
                <li>Avec nos partenaires techniques (Supabase, Vercel) dans le cadre du service</li>
                <li>Avec Google AdSense pour la personnalisation des publicités</li>
                <li>Si requis par la loi ou une autorité judiciaire</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Contact</h2>
            <div className="space-y-4 text-gray-700">
              <p>Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Email : contact@fckmap.fr</li>
                <li>Via le formulaire de contact du site</li>
              </ul>
              <p>Nous nous engageons à répondre dans les 30 jours.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Modifications</h2>
            <div className="space-y-4 text-gray-700">
              <p>Cette politique peut être mise à jour occasionnellement. Les modifications importantes seront notifiées par email ou via le site.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}