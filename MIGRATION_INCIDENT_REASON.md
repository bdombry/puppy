# Migration: Ajouter le champ "Raison de l'incident"

## Description
Ajoute un champ `incident_reason` à la table `outings` pour tracker la raison d'un accident.

## Options disponibles
- `pas_le_temps` - Pas le temps
- `trop_tard` - Trop tard - il était trop tard pour le sortir
- `flemme` - Flemme
- `oublie` - Oublié
- `autre` - Autre

## Instructions pour appliquer la migration

### Via Supabase Dashboard:
1. Allez sur https://app.supabase.com
2. Sélectionnez votre projet PupyTracker
3. Allez dans l'onglet **SQL Editor**
4. Créez une nouvelle query
5. Copiez/collez le contenu du fichier `add_incident_reason.sql`
6. Cliquez sur **Run** (Ctrl+Enter)

### Via Supabase CLI:
```bash
supabase migration new add_incident_reason
# Copiez le contenu du fichier SQL dans la migration créée
supabase db push
```

## Changements dans l'app

### WalkScreen.js
- Nouveau champ UI: Menu déroulant avec les raisons prédéfinies pour les incidents
- Visible uniquement quand `isIncident = true` (pour les accidents)
- Nouveau state: `incidentReason`
- Le champ est enregistré dans la base de données (`outings.incident_reason`)

### Base de données
- Nouvelle colonne: `outings.incident_reason` (VARCHAR(50), DEFAULT NULL)
- Nouvel index: `idx_outings_incident_reason` pour optimiser les requêtes

## Rollback (si nécessaire)
```sql
DROP INDEX IF EXISTS idx_outings_incident_reason;
ALTER TABLE outings DROP COLUMN incident_reason;
```

## Notes
- Le champ est optionnel (par défaut à NULL)
- Permet d'analyser les causes des accidents
- Utile pour les insights futurs dans l'écran Analytics
- Le menu déroulant s'affiche en modal depuis le bas de l'écran
