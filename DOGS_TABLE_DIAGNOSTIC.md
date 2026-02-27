# 🔍 Diagnostic: Pourquoi Dogs ne se remplit pas

## 1️⃣ Vérifier la structure réelle de la table Dogs

Va dans Supabase:
1. **SQL Editor** → New Query
2. Exécute cette requête:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dogs' OR table_name = 'Dogs'
ORDER BY ordinal_position;
```

**Copie-colle le résultat ici pour que je voie la structure exacte.**

---

## 2️⃣ Vérifier les RLS Policies

Va dans **Schema Editor** (Supabase) et clique sur la table **Dogs**:
- Onglet **Policies**
- Qu'est-ce que tu vois exactement?

Ou exécute cette query SQL:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'dogs' OR tablename = 'Dogs'
ORDER BY policyname;
```

---

## 3️⃣ Vérifier les vraies erreurs d'insert

Après avoir amélioré les logs, refais:
1. **Crée un nouveau compte**
2. **Complète l'onboarding**
3. Ouvre la **console Expo** (dans le terminal où tu runs `npm start`)
4. Cherche les logs:
   - "❌ Could not save dog info"
   - Copie le **full error object** complet

**Type d'erreurs possibles:**

### ❌ RLS Policy Error
```
"new row violates row-level security policy"
```
**Cause:** La policy RLS n'autorise pas l'insert
**Solution:** Vérifier les policies

### ❌ Column Not Found
```
"column 'birthdate' does not exist"
```
**Cause:** Le nom de colonne est différent (ex: `birth_date` vs `birthdate`)
**Solution:** Adapter les noms dans CreateAccountScreen

### ❌ Type Mismatch
```
"value too long for type character varying"
```
**Cause:** Une valeur est trop longue pour la colonne
**Solution:** Limiter la longueur des strings

### ❌ FK Constraint
```
"insert or update on table 'dogs' violates foreign key constraint"
```
**Cause:** L'`user_id` n'existe pas dans `auth.users`
**Solution:** S'assurer que l'auth.users est créé AVANT l'insert Dogs

### ❌ ID Format
```
"invalid input syntax for type uuid"
```
**Cause:** L'`id` doit être UUID, pas string
**Solution:** Utiliser `gen_random_uuid()` au lieu de `${userId}-${Date.now()}`

---

## 4️⃣ Tests rapides dans Supabase SQL

Teste directement l'insert dans Supabase:

```sql
-- D'abord, find un user_id valide
SELECT id FROM auth.users LIMIT 1;

-- Copie ce user_id et remplace YOUR_USER_ID ci-dessous:
INSERT INTO Dogs (user_id, name, breed, sex)
VALUES (
  'YOUR_USER_ID_HERE',
  'Test Dog',
  'Golden Retriever',
  'male'
)
RETURNING *;
```

Qu'est-ce que tu vois?
- ✅ Insert réussi? → Le problème vient de l'app
- ❌ Erreur RLS / FK / Schema? → Corrige la table ou les policies

---

## 5️⃣ Problèmes Courants

| Erreur | Cause | Fix |
|--------|-------|-----|
| "new row violates row-level security policy" | RLS trop restrictive | Vérifier la policy FOR INSERT |
| "column 'X' does not exist" | Nom de colonne incorrect | Adapter les noms dans CreateAccountScreen |
| "violates foreign key constraint" | user_id n'existe pas | S'assurer que le user est créé dans auth.users |
| "invalid input syntax for type uuid" | id n'est pas UUID | Générer un vrai UUID |
| "NOT NULL constraint" | Une colonne obligatoire est null | Fournir une valeur par défaut |

---

## 📋 Checklist de Diagnostic

- [ ] J'ai vérifiné la structure de Dogs (colonnes, types, défauts)
- [ ] J'ai vérifiié les RLS Policies sur Dogs
- [ ] J'ai testé l'insert directement dans Supabase SQL
- [ ] J'ai vu le **full error object** dans la console Expo
- [ ] Je peux copier-coller l'erreur exacte pour debug

**Une fois que tu as ces infos, on peut fixer le vrai problème!**

