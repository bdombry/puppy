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

## Dépendances Clés
- Supabase pour backend as a service
- Expo pour le développement cross-platform
- React Navigation pour la navigation fluide
- Victory pour les graphiques
- AsyncStorage pour le cache offline

Ce fichier sert de guide rapide pour comprendre l'architecture et reprendre le développement efficacement.