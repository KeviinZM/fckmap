# Maquettes et Interface Utilisateur - FCK

## 🎨 Design System

### Couleurs
- **Orange Principal** : `#FF6B35`
- **Orange Clair** : `#FF8A65` 
- **Orange Foncé** : `#E55A2B`
- **Blanc** : `#FFFFFF`
- **Gris Clair** : `#F5F5F5`
- **Gris Moyen** : `#9CA3AF`
- **Gris Foncé** : `#374151`

### Typographie
- **Police principale** : Inter (Google Fonts)
- **Titres** : Font-weight 700 (Bold)
- **Texte normal** : Font-weight 400 (Regular)
- **Boutons** : Font-weight 600 (Semi-bold)

## 📱 Maquettes des Écrans

### 1. Page de Connexion
```
┌─────────────────────────────────────┐
│                                     │
│    🧭 FCK                          │
│                                     │
│  ┌─────────────────────────────┐    │
│  │        📧 Email             │    │
│  │        🔒 Mot de passe      │    │
│  │                             │    │
│  │    [Se connecter]           │    │
│  │                             │    │
│  │  Pas de compte ? S'inscrire │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 2. Interface Principale
```
┌─────────────────────────────────────┐
│ 🧭 FCK    🔍 [Recherche...]    👤 │
├─────────────────────────────────────┤
│                                     │
│           🌍 CARTE                 │
│         (plein écran)              │
│                                     │
│  📊 Stats    [Marquer cette ville] │
└─────────────────────────────────────┘
```

### 3. Panneau de Statistiques
```
┌─────────────────┐
│ 📊 Statistiques │
├─────────────────┤
│ 🏙️  Villes: 12  │
│ ⭐  Moyenne: 4.2 │
│                 │
│ Répartition:    │
│ ⭐⭐⭐⭐⭐ 5 (40%)  │
│ ⭐⭐⭐⭐   4 (30%)  │
│ ⭐⭐⭐     3 (20%)  │
│ ⭐⭐       2 (10%)  │
│ ⭐         1 (0%)  │
│                 │
│ 👥 Code ami:    │
│ [ABC123] [Copier]│
└─────────────────┘
```

### 4. Modal de Notation
```
┌─────────────────────────────┐
│ 🏙️ Marquer cette ville  ❌ │
├─────────────────────────────┤
│                             │
│        Paris, France        │
│                             │
│    ⭐ ⭐ ⭐ ⭐ ⭐            │
│                             │
│    "Exceptionnel !"         │
│                             │
│  [Annuler]  [Marquer]      │
└─────────────────────────────┘
```

## 🎯 Composants UI

### Boutons
- **Primaire** : `bg-fck-orange hover:bg-fck-orange-dark`
- **Secondaire** : `border border-gray-300 hover:bg-gray-50`
- **Danger** : `bg-red-500 hover:bg-red-600`

### Cartes
- **Fond** : `bg-white rounded-lg shadow-lg`
- **Bordure** : `border border-gray-200`

### Inputs
- **Normal** : `border border-gray-300 focus:ring-2 focus:ring-fck-orange`
- **Erreur** : `border-red-300 focus:ring-red-500`

### Modals
- **Overlay** : `bg-black bg-opacity-50`
- **Contenu** : `bg-white rounded-2xl shadow-2xl`

## 📱 Responsive Design

### Desktop (≥1024px)
- Carte en plein écran
- Panneau stats à gauche
- Barre de recherche en haut

### Tablet (768px-1023px)
- Carte réduite
- Panneau stats en overlay
- Barre de recherche adaptée

### Mobile (<768px)
- Carte en plein écran
- Panneau stats en modal
- Barre de recherche compacte
- Boutons plus grands pour le touch

## 🎨 Animations

### Transitions
- **Boutons** : `transition-colors duration-200`
- **Modals** : `transition-all duration-300`
- **Hover** : `hover:scale-105`

### Loading States
- **Spinner** : `animate-spin`
- **Skeleton** : `animate-pulse`

## 🔧 États de l'Interface

### États de Chargement
1. **Initial** : Spinner avec logo FCK
2. **Carte** : Skeleton de la carte
3. **Recherche** : Spinner dans la barre de recherche

### États d'Erreur
1. **Connexion** : Message d'erreur rouge
2. **Carte** : Message d'erreur overlay
3. **API** : Toast notification

### États de Succès
1. **Ville marquée** : Animation de confirmation
2. **Code copié** : Toast de confirmation
3. **Connexion** : Redirection automatique

## 🎯 Micro-interactions

### Carte
- **Zoom** : Animation fluide
- **Marqueurs** : Apparition avec bounce
- **Clic** : Ripple effect

### Notation
- **Étoiles** : Hover avec scale
- **Sélection** : Animation de remplissage

### Recherche
- **Suggestion** : Apparition avec fade
- **Sélection** : Highlight de l'élément

## 📊 Accessibilité

### Contraste
- **Texte** : Ratio 4.5:1 minimum
- **Boutons** : Ratio 3:1 minimum

### Navigation
- **Clavier** : Tab order logique
- **Screen readers** : Labels appropriés
- **Focus** : Indicateurs visuels

### Couleurs
- **Daltonisme** : Pas de distinction par couleur seule
- **Contraste** : Testé avec outils automatiques 