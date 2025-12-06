# Migration: Ajouter le champ "Le chien a demandé" aux besoins et balades

## Description
Ajoute un champ `dog_asked_for_walk` (booléen) aux tables `activities` et `outings` pour tracker si le chien a demandé/initié la balade ou le besoin.

## Instructions pour appliquer la migration

### Via Supabase Dashboard:
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet PupyTracker
3. Allez dans l'onglet **SQL Editor**
4. Créez une nouvelle query
5. Copiez/collez le contenu du fichier `add_dog_asked_for_walk.sql`
6. Cliquez sur **Run** (Ctrl+Enter)

### Via Supabase CLI:
```bash
supabase migration new add_dog_asked_for_walk
# Copiez le contenu du fichier SQL dans la migration créée
supabase db push
```

## Changements dans l'app

### ActivityScreen.js
- Nouveau champ UI: "🐕 Le chien a demandé" avec checkbox
- Nouveau state: `dogAskedForWalk`
- Le champ est enregistré dans la base de données (`activities` table)

### WalkScreen.js
- Nouveau champ UI: "🐕 Le chien a demandé" avec checkbox (visible uniquement pour les besoins, pas pour les accidents)
- Nouveau state: `dogAskedForWalk`
- Le champ est enregistré dans la base de données (`outings` table)

### Base de données
- Nouvelle colonne: `activities.dog_asked_for_walk` (BOOLEAN, DEFAULT false)
- Nouvelle colonne: `outings.dog_asked_for_walk` (BOOLEAN, DEFAULT false)
- Nouveaux index: `idx_activities_dog_asked_for_walk` et `idx_outings_dog_asked_for_walk` pour optimiser les requêtes

## Rollback (si nécessaire)
```sql
DROP INDEX IF EXISTS idx_activities_dog_asked_for_walk;
DROP INDEX IF EXISTS idx_outings_dog_asked_for_walk;
ALTER TABLE activities DROP COLUMN dog_asked_for_walk;
ALTER TABLE outings DROP COLUMN dog_asked_for_walk;
```

## Notes
- Le champ est optionnel (par défaut à false)
- Permet d'analyser l'autonomie du chien pour demander ses besoins/balades
- Utile pour les insights futurs dans l'écran Analytics
- Le champ est visible dans WalkScreen uniquement pour les besoins (pas pour les accidents)
