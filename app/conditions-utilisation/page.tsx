export default function ConditionsUtilisation() {
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
              <a href="/contact" className="text-gray-600 hover:text-orange-500">Contact</a>
            </nav>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Conditions d'Utilisation</h1>
          <p className="text-sm text-gray-600 mb-8">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">1. Acceptation des conditions</h2>
            <div className="space-y-4 text-gray-700">
              <p>En accédant et en utilisant FCK (fckmap.fr), vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">2. Description du service</h2>
            <div className="space-y-4 text-gray-700">
              <p>FCK est une plateforme de cartographie sociale qui permet aux utilisateurs de :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Marquer et évaluer des villes sur une carte interactive</li>
                <li>Attribuer des notes de 1 à 5 étoiles aux villes visitées</li>
                <li>Se connecter avec des amis pour partager leurs expériences</li>
                <li>Découvrir les évaluations et recommandations de leur réseau</li>
                <li>Visualiser les données géographiques de manière collaborative</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">3. Création de compte</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Conditions d'inscription</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Vous devez être âgé d'au moins 13 ans</li>
                <li>Fournir une adresse email valide</li>
                <li>Choisir un pseudo respectueux (3-20 caractères)</li>
                <li>Créer un mot de passe sécurisé (minimum 6 caractères)</li>
              </ul>
              
              <h3 className="text-lg font-medium">Responsabilités</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                <li>Vous devez notifier immédiatement tout usage non autorisé</li>
                <li>Un seul compte par personne est autorisé</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">4. Utilisation acceptable</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Usages autorisés</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Marquer des villes que vous avez réellement visitées</li>
                <li>Donner des évaluations honnêtes et constructives</li>
                <li>Partager vos expériences de voyage authentiques</li>
                <li>Interagir respectueusement avec les autres utilisateurs</li>
              </ul>
              
              <h3 className="text-lg font-medium">Comportements interdits</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Créer de faux comptes ou usurper l'identité d'autrui</li>
                <li>Publier du contenu offensant, discriminatoire ou inapproprié</li>
                <li>Marquer des villes de manière frauduleuse ou automatisée</li>
                <li>Harceler, menacer ou intimider d'autres utilisateurs</li>
                <li>Utiliser le service à des fins commerciales non autorisées</li>
                <li>Tenter de contourner les mesures de sécurité</li>
                <li>Envoyer des spams ou du contenu non sollicité</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">5. Contenu utilisateur</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Vos droits</h3>
              <p>Vous conservez tous les droits sur le contenu que vous créez (villes marquées, notes, commentaires).</p>
              
              <h3 className="text-lg font-medium">Licence accordée</h3>
              <p>En utilisant FCK, vous accordez une licence non exclusive pour :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Afficher votre contenu aux autres utilisateurs selon vos paramètres</li>
                <li>Traiter et analyser les données pour améliorer le service</li>
                <li>Créer des statistiques agrégées et anonymisées</li>
              </ul>
              
              <h3 className="text-lg font-medium">Modération</h3>
              <p>FCK se réserve le droit de modérer, éditer ou supprimer tout contenu qui viole ces conditions.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">6. Confidentialité et partage</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Visibilité des données</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Vos villes marquées sont visibles par vos amis</li>
                <li>Votre pseudo est public</li>
                <li>Vos notes et évaluations sont partagées avec votre réseau</li>
                <li>Votre email reste privé</li>
              </ul>
              
              <h3 className="text-lg font-medium">Gestion des amis</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Vous contrôlez qui peut vous ajouter comme ami</li>
                <li>Vous pouvez supprimer des amis à tout moment</li>
                <li>Les connexions d'amitié sont mutuelles</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">7. Sanctions</h2>
            <div className="space-y-4 text-gray-700">
              <p>En cas de violation de ces conditions, FCK peut :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Émettre un avertissement</li>
                <li>Supprimer du contenu inapproprié</li>
                <li>Suspendre temporairement votre compte</li>
                <li>Bannir définitivement votre compte</li>
                <li>Signaler aux autorités compétentes si nécessaire</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">8. Limitation de responsabilité</h2>
            <div className="space-y-4 text-gray-700">
              <h3 className="text-lg font-medium">Service fourni "en l'état"</h3>
              <p>FCK est fourni sans garantie. Nous nous efforçons de maintenir un service de qualité mais ne garantissons pas :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Une disponibilité continue du service</li>
                <li>L'exactitude des données géographiques</li>
                <li>L'absence d'erreurs ou de bugs</li>
              </ul>
              
              <h3 className="text-lg font-medium">Données tierces</h3>
              <p>Les cartes et données géographiques proviennent d'OpenStreetMap. FCK n'est pas responsable des inexactitudes de ces données.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">9. Suppression de compte</h2>
            <div className="space-y-4 text-gray-700">
              <p>Vous pouvez supprimer votre compte à tout moment depuis les paramètres. Cette action :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Supprime définitivement toutes vos données</li>
                <li>Retire vos villes des cartes de vos amis</li>
                <li>Ne peut pas être annulée</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">10. Modifications des conditions</h2>
            <div className="space-y-4 text-gray-700">
              <p>FCK peut modifier ces conditions à tout moment. Les modifications importantes seront notifiées :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Par email aux utilisateurs enregistrés</li>
                <li>Via une notification sur le site</li>
                <li>Au moins 30 jours avant l'entrée en vigueur</li>
              </ul>
              <p>L'utilisation continue du service après modification constitue une acceptation des nouvelles conditions.</p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">11. Contact et réclamations</h2>
            <div className="space-y-4 text-gray-700">
              <p>Pour toute question ou réclamation concernant ces conditions :</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Email : contact@fckmap.fr</li>
                <li>Via le formulaire de <a href="/contact" className="text-blue-600 hover:underline">contact</a></li>
              </ul>
              <p>Nous nous engageons à traiter vos demandes dans les meilleurs délais.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}