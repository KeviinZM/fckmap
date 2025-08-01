# FCK - Interactive World Map

Une application web interactive permettant aux utilisateurs de marquer les villes où ils ont eu des expériences et de partager ces informations avec leurs amis.

## 🌍 Fonctionnalités

- **Carte interactive** avec marquage de villes
- **Système d'authentification** (Email + Google OAuth)
- **Recherche de villes** intelligente avec déduplication
- **Notes et statistiques** personnelles
- **Système d'amis** avec partage de localisations
- **Interface responsive** et moderne

## 🛠️ Technologies

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Carte**: Leaflet.js, React-Leaflet
- **Backend**: Supabase (PostgreSQL + Auth)
- **Déploiement**: Vercel
- **API**: Nominatim (OpenStreetMap)

## 🚀 Installation

1. Cloner le repository
```bash
git clone https://github.com/KeviinZM/fckmap.git
cd fckmap
```

2. Installer les dépendances
```bash
npm install
```

3. Configurer les variables d'environnement
```bash
cp .env.example .env.local
```

4. Lancer le serveur de développement
```bash
npm run dev
```

## 📱 Utilisation

1. **Créer un compte** ou se connecter
2. **Rechercher des villes** dans la barre de recherche
3. **Marquer des villes** et leur attribuer une note
4. **Ajouter des amis** via leur code unique
5. **Voir les villes marquées** par vos amis sur votre carte

## 🔧 Configuration

### Supabase
- Configurer les tables `marques_villes` et `amis`
- Activer l'authentification Google
- Configurer les politiques RLS

### Variables d'environnement
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

MIT License - voir le fichier LICENSE pour plus de détails.