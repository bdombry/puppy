# Contexte de Développement - PupyTracker

## Description de l'Application
PupyTracker est une application mobile React Native développée avec Expo pour aider les propriétaires de chiens à suivre et gérer les activités quotidiennes de leur animal de compagnie. L'app permet de tracker les promenades, les repas, les besoins (pipi/caca), les incidents, et fournit des analyses statistiques.

## Technologies Utilisées
- **Framework**: React Native avec Expo (~54.0.26)
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **Backend**: Supabase (authentification, base de données)
- **Stockage**: AsyncStorage pour le cache local
- **UI**: React Native Paper (composants Material Design)
- **Animations**: React Native Reanimated
- **Graphiques**: Victory Native + React Native SVG
- **Notifications**: Expo Notifications
- **Images**: Expo Image Picker
- **Localisation**: Expo Location
- **Icônes**: @expo/vector-icons

## Structure du Projet
```
puppy/
├── components/           # Composants réutilisables
│   ├── buttons/         # Boutons personnalisés
│   ├── charts/          # Graphiques et visualisations
│   ├── forms/           # Composants de formulaires
│   ├── screens/         # Écrans principaux
│   └── ...
├── hooks/               # Hooks personnalisés (useWalkHistory, useTimer, etc.)
├── context/             # Context React (AuthContext)
├── constants/           # Constantes (thèmes, messages, config)
├── styles/              # Styles communs et spécifiques
├── config/              # Configuration (Supabase)
├── assets/              # Images et illustrations
├── supabase_functions/  # Fonctions SQL pour Supabase
└── __tests__/           # Tests unitaires
```

## Fonctionnalités Principales
1. **Authentification**: Connexion via email/mot de passe ou OAuth (Google/Apple)
2. **Configuration Chien**: Ajout et gestion des profils de chiens
3. **Tracking Quotidien**:
   - Promenades avec GPS et photos
   - Repas et rations
   - Besoins (pipi/caca) avec timers
   - Activités diverses
4. **Notifications**: Rappels personnalisés pour les besoins du chien
5. **Analyses**: Statistiques sur les promenades, incidents, etc.
6. **Carte**: Visualisation des promenades sur carte

## Écrans et Navigation
- **Authentification**: Écran de login/signup
- **Setup**: Configuration initiale du chien
- **Tabs Principaux**:
  - Profil Chien
  - Carte des promenades
  - Accueil (dashboard)
  - Historique des activités
  - Statistiques
- **Écrans Modaux/Secondaires**:
  - WalkScreen (enregistrement promenade)
  - FeedingScreen (repas)
  - ActivityScreen (activités)
  - EditIncidentScreen (modification incidents)
  - NotificationSettingsScreen (paramètres notifications)

## Hooks Personnalisés
- `useWalkHistory`: Gestion de l'historique des promenades
- `useTimer`: Timers pour les besoins (last pee/poop/walk)
- `useHomeData`: Données du dashboard principal
- `useAnalytics`: Calculs statistiques
- `useImageUpload`: Upload d'images vers Supabase
- `useLastNeed`: Gestion des derniers besoins

## Base de Données (Supabase)
Tables principales :
- `dogs`: Profils des chiens
- `walks`: Promenades enregistrées
- `activities`: Activités diverses (repas, jeux, etc.)
- `incidents`: Incidents (besoins, accidents)
- `notifications`: Paramètres de notifications

## Thèmes et Styles
- Thème Material Design via React Native Paper
- Styles modulaires dans `/styles/`
- Palette de couleurs personnalisée
- Support du mode sombre (potentiellement)

## Instructions de Développement
1. **Installation**: `npm install` ou `yarn install`
2. **Démarrage**: `npm start` (Expo CLI)
3. **Build**: `expo build:android` ou `expo build:ios`
4. **Tests**: `npm test` (Jest configuré)
5. **Linting**: ESLint configuré pour React Native

## Points d'Attention
- Utiliser les hooks personnalisés pour la logique métier
- Respecter la structure des composants (screens/ pour les écrans, components/ pour les réutilisables)
- Gérer les erreurs et les états de chargement
- Optimiser les performances (memo, useCallback)
- Tester sur device réel pour les fonctionnalités GPS/notifications

### 🔄 Onboarding et AsyncStorage
**Important pour le développement:**
- L'onboarding est stocké dans AsyncStorage avec la clé `onboardingCompleted`
- En développement, il est actuellement **auto-reset** à chaque launch (voir App.js ligne ~116)
- Cette ligne doit être **commentée avant la production** sinon les users seront bloqués dans la boucle onboarding
- Pour controler manuellement: décommenter/commenter `await AsyncStorage.removeItem('onboardingCompleted');` dans App.js

### 🧅 Flux Onboarding (15 écrans)
1. **Écran 1** (1/15): Intro avec features
2. **Écran 2Auth** (2/15): Auth (Apple/Google/Email) → Crée le compte utilisateur
3. **Écran 2** (3/15): Collecte prénom
4. **Écran 3** (4/15): Collecte age range
5. **Écran 4** (5/15): Collecte gender
6. **Écran 5** (6/15): Collecte breeding situation
7. **Écran 6** (7/15): Choix chien (enregistrer nouveau vs code accès)
8. **Écran 7** (8/15): Photo chien (optional)
9. **Écran 8** (9/15): Nom chien
10. **Écran 9** (10/15): Race + Sex
11. **Écran 10** (11/15): Birth date
12. **Écran 11** (12/15): Notification time range
13. **Écran 12** (13/15): Loading screen (auto-advance)
14. **Écran 13** (14/15): Social proof avec testimonials
15. **Écran 14** (15/15): Paywall avec free trial 3j (mandatory)

**Données accumulées via route.params.userProfile** et sauvegardées à l'écran 14 dans Supabase.

## Dépendances Clés
- Supabase pour backend as a service
- Expo pour le développement cross-platform
- React Navigation pour la navigation fluide
- Victory pour les graphiques
- AsyncStorage pour le cache offline

Ce fichier sert de guide rapide pour comprendre l'architecture et reprendre le développement efficacement.