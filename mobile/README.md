# POKETRAKO Mobile

Application mobile React Native (Expo) pour la gestion de finances personnelles. Consomme l'API REST du backend POKETRAKO (Express + Prisma + PostgreSQL/Neon).

## Architecture

```
mobile/
├── app/                    # Routes Expo Router
│   ├── _layout.tsx         # Root layout avec AuthProvider
│   ├── (auth)/             # Routes non authentifiées
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/             # Routes authentifiées (bottom tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Dashboard
│   │   ├── expenses.tsx
│   │   ├── incomes.tsx
│   │   ├── categories.tsx
│   │   └── profile.tsx
│   ├── expense/
│   │   ├── create.tsx
│   │   └── [id].tsx
│   └── income/
│       ├── create.tsx
│       └── [id].tsx
├── components/
│   └── ui/                 # Design system (Button, Input, Card, etc.)
├── services/
│   ├── api.ts              # Client API centralisé
│   ├── auth.service.ts
│   ├── expense.service.ts
│   ├── income.service.ts
│   ├── category.service.ts
│   └── summary.service.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useExpenses.ts
│   ├── useIncomes.ts
│   ├── useCategories.ts
│   └── useSummary.ts
├── context/
│   └── AuthContext.tsx     # État d'authentification global
├── types/
│   └── api.ts              # Types TypeScript correspondant au backend
├── utils/
│   ├── currency.ts         # Formatage devise (MGA, EUR, USD, GBP)
│   ├── dates.ts            # Formatage dates
│   └── validation.ts       # Validation formulaires
├── .env.example
├── package.json
├── tsconfig.json
└── app.json
```

## Prérequis

- Node.js ≥ 18
- npm ≥ 9
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`) pour les builds
- Compte Expo (gratuit) pour `expo start` et EAS Build

## Installation

```bash
cd mobile
npm install
```

## Variables d'environnement

Copiez `.env.example` vers `.env` et configurez :

```env
EXPO_PUBLIC_API_URL=https://votre-backend.onrender.com
```

> **Note** : Le préfixe `/api` est ajouté automatiquement par le client API.

### URLs de développement

| Plateforme | URL backend local |
|------------|-------------------|
| Android Emulator | `http://10.0.2.2:5000` |
| iOS Simulator | `http://localhost:5000` |
| Téléphone physique | `http://192.168.x.x:5000` (votre IP locale) |

## Développement

```bash
# Démarrer le serveur de développement
npm start

# Ou directement sur une plateforme
npm run android
npm run ios
npm run web
```

Scannez le QR code avec **Expo Go** (Android/iOS) pour tester sur téléphone physique.

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Démarre Expo (mode développement) |
| `npm run android` | Ouvre sur émulateur/appareil Android |
| `npm run ios` | Ouvre sur simulateur iOS (macOS uniquement) |
| `npm run web` | Ouvre dans le navigateur |
| `npm run lint` | Vérifie le code (ESLint) |
| `npm run typecheck` | Vérification TypeScript |
| `npm test` | Lance les tests Jest |

## Build de production (Android)

### Via EAS Build (recommandé, gratuit)

```bash
# Configuration initiale (une seule fois)
eas login
eas build:configure

# Build APK (preview)
eas build -p android --profile preview

# Build AAB (pour Play Store)
eas build -p android --profile production
```

L'APK sera téléchargeable depuis le lien fourni par EAS.

### Build local (nécessite Android SDK)

```bash
eas build -p android --profile preview --local
```

## Structure de l'API consommée

### Authentification
- `POST /api/auth/signup` — Inscription
- `POST /api/auth/login` — Connexion (retourne JWT)
- `GET /api/auth/me` — Profil utilisateur
- `PUT /api/auth/budget` — Modifier budget
- `PUT /api/auth/currency` — Modifier devise

### Dépenses
- `GET /api/expenses` — Liste (filtres: start, end, categoryId, type, _sort, _limit)
- `GET /api/expenses/:id` — Détail
- `POST /api/expenses` — Créer
- `PUT /api/expenses/:id` — Modifier
- `DELETE /api/expenses/:id` — Supprimer
- `POST /api/expenses/:id/receipt` — Upload justificatif
- `DELETE /api/expenses/:id/receipt` — Supprimer justificatif

### Revenus
- `GET /api/incomes` — Liste
- `GET /api/incomes/:id` — Détail
- `POST /api/incomes` — Créer
- `PUT /api/incomes/:id` — Modifier
- `DELETE /api/incomes/:id` — Supprimer

### Catégories
- `GET /api/categories` — Liste
- `POST /api/categories` — Créer
- `PUT /api/categories/:id` — Modifier
- `DELETE /api/categories/:id` — Supprimer

### Résumé
- `GET /api/summary/monthly` — Résumé mensuel
- `GET /api/summary` — Résumé sur période (start, end)
- `GET /api/summary/alerts` — Alertes budget

## Sécurité

- **JWT stocké dans `expo-secure-store`** (pas AsyncStorage)
- **Pas de secrets** dans le code (seule `EXPO_PUBLIC_API_URL` est publique)
- **Connexion HTTPS uniquement** en production
- **Validation côté client** + validation côté serveur
- **Gestion d'erreurs** sans exposition de stack traces

## Design System

Le dossier `components/ui/` contient :
- `Button` — Variants: primary, secondary, danger, ghost
- `Input` — Avec label, error, helperText, icônes
- `Card` — Conteneur avec elevation configurable
- `Screen` — Wrapper avec SafeAreaView
- `Text` — Typographie centralisée (h1-h4, body, caption)
- `IconButton` — Boutons circulaires pour actions
- `EmptyState`, `LoadingState`, `ErrorState` — États UI standardisés
- `RefreshableList` — ScrollView avec pull-to-refresh

Couleurs, espacements, rayons, typographie centralisés dans `components/ui/design.ts`.

## Tests

```bash
npm test
```

Couvre : client API, authentification, services, formatage devise/dates, validation.

## Dépannage

### Erreur "Network request failed"
- Vérifiez `EXPO_PUBLIC_API_URL` dans `.env`
- Sur téléphone physique : utilisez votre IP locale, pas `localhost`
- Vérifiez que le backend est accessible (Render peut mettre en veille le plan gratuit)

### Erreur CORS
Le backend doit avoir `FRONTEND_URL` configuré. Pour l'app mobile, l'origine n'est pas un navigateur — assurez-vous que le backend accepte les requêtes sans origin ou configurez une variable `MOBILE_APP=true`.

### Build EAS échoue
- Vérifiez `app.json` (bundleIdentifier/package)
- `eas build:configure` pour régénérer la config
- Logs complets : `eas build --logs`

## Licence

Projet privé — POKETRAKO