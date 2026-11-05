# ⚡ Pokédex — Application Web Moderne (2026)

Une application Pokédex moderne, fluide et performante développée avec **React 18**, **Vite**, **Material UI**, **Framer Motion** et **Recharts**.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-6.5-007FFF?logo=mui&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer&logoColor=white)

---

## ✨ Fonctionnalités Clés

- 🎨 **Design Glassmorphism Dark Theme** : Interface sombre moderne avec effets de flou d'arrière-plan, bordures subtiles et accents colorés dynamiques selon les types élémentaires.
- 🔍 **Recherche & Filtrage Avancés** :
  - Recherche instantanée par nom (multilingue) ou par numéro Pokédex (`#25`, `Pikachu`).
  - Filtrage multi-types combinable (ET logique) avec puces aux couleurs officielles des types.
  - Sélecteur de générations.
  - Multiples options de tri : numéro croissant/décroissant, nom A-Z/Z-A, favoris en tête ⭐, poids et taille.
- 📊 **Comparateur & Graphique Radar Interactif** :
  - Dock escamotable permettant de sélectionner et comparer 2 Pokémon côte-à-côte.
  - Graphique Radar interactif (PV, Attaque, Défense, Attaque Spé, Défense Spé, Vitesse) intégrant les statistiques de l'API PokeAPI avec fallback local.
- ⭐ **Gestion des Favoris & Notes** :
  - Ajout/retrait en favoris synchronisé automatiquement dans `localStorage`.
  - Système de notation par étoiles par Pokémon.
- 🌐 **Internationalisation Complète (FR / EN)** :
  - Bascule instantanée entre Français 🇫🇷 et Anglais 🇬🇧.
  - Traduction de l'intégralité des libellés de l'interface, des types et des noms des Pokémon.
- ⚡ **Architecture Optimisée & Zéro Redondance Réseau** :
  - `PokemonContext` centralisé avec mise en cache mémoire : chargement unique de la base de données.
  - Affichage instantané (0 ms de latence) lors de la navigation vers les détails ou les Pokémon similaires.
  - Code-splitting dynamique (`manualChunks`) via Vite (bundle principal réduit à < 30 kB).
  - Écrans de chargement animés avec **Skeletons MUI** et gestion complète des erreurs réseau / page 404.
- 🧪 **Suite de Tests Vitest** :
  - Tests unitaires et d'intégration validant le rendu, le filtrage, la gestion des favoris et la logique de comparaison.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) `>= 22.0.0`
- [npm](https://www.npmjs.com/)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/Nadjide/pokedex.git
cd pokedex

# Installer les dépendances
npm install
```

### Scripts Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Lance le serveur de développement local Vite avec Hot Reload (`http://localhost:5173`). |
| `npm run build` | Compile et optimise l'application pour la production dans le dossier `dist/`. |
| `npm run preview` | Prévisualise en local le build de production généré. |
| `npm test` | Exécute la suite de tests unitaires via Vitest. |

---

## 📁 Architecture du Projet

```text
pokedex/
├── public/                     # Assets statiques, manifest PWA, favicon
├── src/
│   ├── AnimatedRoutes.jsx      # Routage avec transitions Framer Motion & Code Splitting
│   ├── App.jsx                 # Point d'entrée avec composition des Providers
│   ├── FavoritesContext.jsx    # Gestionnaire centralisé des favoris et localStorage
│   ├── context/
│   │   └── PokemonContext.jsx  # Cache central des données Pokémon & types
│   ├── i18n/
│   │   └── translations.js     # Dictionnaire de traduction bilingue (FR/EN)
│   ├── Theme/
│   │   └── typeColors.js       # Palette des couleurs élémentaires Pokémon
│   ├── components/
│   │   ├── AdvancedSearch/     # Barre de recherche & filtres multi-critères
│   │   ├── ComparisonDock/     # Tiroir escamotable de comparaison
│   │   ├── PokemonRadarChart/  # Visualisation graphique des stats avec Recharts
│   │   └── FilterShield/       # Contexte de filtrage et tri
│   ├── Page_1/
│   │   ├── header/             # Barre de navigation et sélecteur de langue
│   │   ├── PokemonCard/        # Carte Pokémon & Skeletons de chargement
│   │   └── PokemonList/        # Grille principale avec tri réactif
│   └── Page_2/
│       ├── PokemonDetails/     # Page de détails avec statistiques & modale des capacités
│       └── SimilarPokemon/     # Suggestions instantanées par affinité de type
├── vite.config.js              # Configuration Vite avec optimisation des chunks vendor
└── package.json
```

---

## 🛠️ Déploiement

Le projet est configuré pour un déploiement continu sur **Vercel** (`vercel.json`) avec redirection SPA automatique vers `index.html`.
