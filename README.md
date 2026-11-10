# ⚡ Pokédex — Application Web Moderne (2026)

Une application Pokédex moderne, fluide et performante développée avec **React 18**, **Vite**, **Material UI**, **Framer Motion** et **Recharts**.

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-6.5-007FFF?logo=mui&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3.2-6E9F18?logo=vitest&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-FF0055?logo=framer&logoColor=white)

---

## ✨ Fonctionnalités Clés

- 🎨 **Design system & thèmes clair / sombre** :
  - Tokens CSS centralisés (`src/index.css`) : couleurs, rayons, ombres, typographies (Outfit + Inter).
  - Bascule clair / sombre mémorisée, sans flash au chargement.
  - Illustrations officielles haute définition, cartes teintées par le type principal de chaque Pokémon.
- 🏠 **Accueil** :
  - Hero avec « Pokémon du jour » (change chaque jour) et bouton « Pokémon au hasard ».
  - Grille responsive (2 colonnes sur mobile), squelettes de chargement, états vides et d'erreur soignés.
- 🔍 **Recherche & filtres** :
  - Barre de recherche flottante, toujours accessible ; raccourci clavier `/`, `Échap` pour effacer.
  - Recherche par nom (insensible aux accents et à la casse, dans toutes les langues) ou par numéro (`25`, `#25`).
  - Filtres par type cumulables (2 maximum), vue « Favoris uniquement ».
  - Tris : numéro, nom, favoris en tête, poids, taille.
- 📖 **Fiche Pokémon complète** :
  - Description du Pokédex, catégorie, talents (avec talent caché), taille, poids.
  - Statistiques de base en barres, **faiblesses / résistances / immunités** calculées depuis la table des types.
  - **Chaîne d'évolution** avec conditions (niveau, pierre, échange) et branches (Évoli).
  - Version chromatique, cri du Pokémon, capacités filtrables, Pokémon similaires.
  - Navigation précédent / suivant (boutons ou flèches `←` `→`).
- 📊 **Comparateur** :
  - Dock flottant pour sélectionner 2 Pokémon, duel stat par stat et graphique radar.
- ⭐ **Favoris & notes** : synchronisés dans `localStorage`, note personnelle sur chaque fiche.
- 🌐 **Internationalisation (FR / EN)** : interface, types et noms des Pokémon ; langue mémorisée.
- ♿ **Accessibilité** : navigation clavier, lien d'évitement, contrastes vérifiés sur les badges de type, respect de `prefers-reduced-motion`.
- ⚡ **Performance** :
  - `PokemonContext` centralisé : la base n'est chargée qu'une fois.
  - Données détaillées (PokéAPI) chargées à la demande et mises en cache pour la session.
  - Code-splitting (`manualChunks`) : fiche détail et graphiques hors du bundle initial.
- 🧪 **Suite de Tests Vitest** : rendu, recherche, favoris, langue, table des types, filtrage, tri et chaînes d'évolution.

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

## 🔌 Sources de données

| Source | Contenu |
| :--- | :--- |
| `pokedex-jgabriele.vercel.app` | Liste des 151 Pokémon de Kanto (noms multilingues, types, taille, poids, capacités) et traductions des types. |
| [PokéAPI](https://pokeapi.co/) | Statistiques de base, talents, descriptions, chaînes d'évolution, cris. |
| Sprites PokéAPI (GitHub) | Illustrations officielles (normales et chromatiques). |

Si PokéAPI est injoignable, la fiche reste consultable : les blocs concernés affichent « indisponible » avec un bouton pour réessayer.

---

## 📁 Architecture du Projet

```text
pokedex/
├── public/                     # Assets statiques, manifest PWA, favicon
├── src/
│   ├── AnimatedRoutes.jsx      # Routage avec transitions Framer Motion & Code Splitting
│   ├── App.jsx                 # Composition des Providers et structure de page
│   ├── index.css               # Tokens du design system (thèmes clair / sombre), animations
│   ├── FavoritesContext.jsx    # Favoris et localStorage
│   ├── api/
│   │   └── pokeapi.js          # Accès PokéAPI avec cache (stats, espèce, évolutions, talents)
│   ├── context/
│   │   └── PokemonContext.jsx  # Cache central des données Pokémon & types
│   ├── data/
│   │   └── typeChart.js        # Table des types et calcul des faiblesses / résistances
│   ├── hooks/                  # usePokemonDetails, usePokemonStats, useRating
│   ├── i18n/
│   │   └── translations.js     # Dictionnaire bilingue (FR/EN) et hook useTranslation
│   ├── Theme/                  # Thème MUI, bascule clair / sombre, couleurs des types
│   ├── utils/                  # Formatage, recherche et tri (fonctions pures testées)
│   ├── components/
│   │   ├── AdvancedSearch/     # Barre de recherche flottante & filtres par type
│   │   ├── ComparisonDock/     # Dock flottant et panneau de comparaison
│   │   ├── PokemonRadarChart/  # Graphique radar (Recharts)
│   │   ├── FilterShield/       # Contexte de filtrage et tri
│   │   └── …                   # TypeBadge, PokemonArtwork, FavoriteButton, CompareButton…
│   ├── Page_1/
│   │   ├── header/             # En-tête : favoris, langue, thème
│   │   ├── PokemonCard/        # Carte Pokémon & squelette de chargement
│   │   └── PokemonList/        # Accueil : hero, recherche, grille
│   └── Page_2/
│       ├── PokemonDetails/     # Fiche : hero, stats, défenses, évolutions, capacités
│       └── SimilarPokemon/     # Suggestions par affinité de type
├── vite.config.js              # Configuration Vite avec optimisation des chunks vendor
└── package.json
```

---

## 🛠️ Déploiement

Le projet est configuré pour un déploiement continu sur **Vercel** (`vercel.json`) avec redirection SPA automatique vers `index.html`.

---

*Projet de fan non officiel. Pokémon et les noms des personnages sont des marques de Nintendo, Game Freak et Creatures.*
