# 🚨 Faiblesses du Projet PupyTracker - Analyse Critique

## 1. GESTION DES ERREURS - 🔴 CRITIQUE

### Problème 1.1: Erreurs Supabase non validées
**Localisation:** `FeedingScreen.js:60`, `ActivityScreen.js:95`

```js
// ❌ MAUVAIS - Code fragile
const { error } = await supabase.from('outings').insert([walkData]);
if (error) throw error; // Lance, mais pas de contexte utilisateur

// ❌ MAUVAIS - Pas d'erreur spécifique
Alert.alert('❌ Erreur', err.message); // Message technique au lieu de message métier
```

**Impact:** Utilisateurs voient des messages techniques ("invalid request body") au lieu d'explications claires.

**Solution:**
```js
// ✅ BON - Gestion contextuelle
try {
  const { error } = await supabase.from('outings').insert([walkData]);
  if (error) {
    if (error.code === '42601') {
      throw new Error('Impossible de sauvegarder la sortie. Vérifiez votre connexion.');
    }
    throw error;
  }
} catch(err) {
  const userMessage = getErrorMessage(err);
  Alert.alert('❌ Erreur', userMessage);
}
```

### Problème 1.2: Pas de gestion d'erreur dans les hooks
**Localisation:** `useHomeData.js:42`, `streakService.js` (multiple)

```js
// ❌ MAUVAIS - L'erreur est loggée mais pas utilisée
catch (err) {
  console.error('❌ Erreur chargement données HomeScreen:', err);
  setError(err.message); // Défini mais jamais affichée à l'utilisateur!
}
```

**Impact:** Les screens ne savent pas qu'il y a eu une erreur. L'état `error` dans le hook est défini mais inutilisé.

---

## 2. VALIDATION DES DONNÉES - 🔴 CRITIQUE

### Problème 2.1: Pas de validation d'entrée utilisateur
**Localisation:** `ActivityScreen.js:1-100`

```js
// ❌ MAUVAIS - Aucune validation avant envoi
const activityData = {
  title: title.trim() || null, // Peut être vide
  duration_minutes: duration ? parseInt(duration) : null, // parseInt() sans vérification
  datetime: datetimeISO, // Pas de vérification format ISO
};
```

**Impact:** 
- `parseInt('abc')` retourne `NaN` → Supabase refuse
- Chaînes vides envoyées → données pollluées
- Dates futures/passées non validées

**Solution:**
```js
const validateActivityData = (data) => {
  if (data.duration_minutes && (isNaN(data.duration_minutes) || data.duration_minutes < 0)) {
    throw new Error('Durée invalide');
  }
  if (data.title && data.title.length > 255) {
    throw new Error('Titre trop long');
  }
  return true;
};
```

### Problème 2.2: Format de date incohérent
**Localisation:** `WalkScreen.js:70`, `ActivityScreen.js:85`

```js
// ❌ MAUVAIS - Deux formats différents
const datetimeISO = getNowLocal(); // Format 1
const outingTime = new Date(datetimeISO); // Format 2

// Impact: datetimeISO !== outingTime.toISOString()
```

**Impact:** Les timestamps ne correspondent pas entre données enregistrées et notifications programmées.

---

## 3. LOGIQUE MÉTIER INCOHÉRENTE - 🔴 CRITIQUE

### Problème 3.1: Delai "magique" de 2 secondes
**Localisation:** `WalkScreen.js:100`, `ActivityScreen.js:115`

```js
// ❌ MAUVAIS - Délai arbitraire non justifié
setTimeout(() => {
  navigation.navigate('MainTabs', { screen: 'Home' });
}, 2000); // Pourquoi 2s? Que se passe-t-il après?
```

**Problèmes:**
- Si Supabase est lent → écran blanc 2s
- Si réseau est off → navigation inutile
- Pas d'attente du refresh des données

**Solution:** Attendre que les données soient rechargées:
```js
await refreshData(); // Attendre HomeScreen de charger les nouvelles données
navigation.navigate('MainTabs', { screen: 'Home' });
```

### Problème 3.2: Notification pas programmée si échec Supabase
**Localisation:** `WalkScreen.js:75-82`

```js
// ❌ MAUVAIS - L'ordre est dangereux
const { error } = await supabase.from('outings').insert([walkData]); // Échoue?
if (error) throw error; // Lance AVANT d'avoir programmé la notif

// Les 2 lignes suivantes ne s'exécutent jamais si l'insert échoue
const outingTime = new Date(datetimeISO);
await scheduleNotificationFromOuting(outingTime, currentDog.name);
```

**Impact:** Si Supabase est down une fois, aucune notification ne sera jamais programmée pour cet outing.

**Solution:** Programmer la notification d'abord (côté client):
```js
// 1. Programmer la notification LOCALEMENT (garanti)
await scheduleNotificationFromOuting(outingTime, currentDog.name);

// 2. PUIS synchroniser avec Supabase (peut échouer, on s'en fout)
const { error } = await supabase.from('outings').insert([walkData]);
// Si erreur: on essaie une sync ultérieure, mais la notif est programmée
```

---

## 4. ARCHITECTURE DE L'AUTH - 🟡 SÉRIEUX

### Problème 4.1: AuthContext lance des exceptions non catchées
**Localisation:** `AuthContext.js:80-100`

```js
// ❌ MAUVAIS - Pas de try/catch
const signUpWithEmail = async (email, password) => {
  setLoading(true);
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error; // Lance
    // ... mais le screen qui appelle ça n'a pas de try/catch!
  } finally {
    setLoading(false);
  }
};
```

**Localisation du appelant:** `AuthScreen.js:50`
```js
// ❌ MAUVAIS - Pas de try/catch autour de signUpWithEmail()
const response = await signUpWithEmail(email, password);
```

**Impact:** Une erreur dans `signUpWithEmail()` peut crash l'app.

---

## 5. ÉTAT GLOBAL INCOHÉRENT - 🟡 SÉRIEUX

### Problème 5.1: `currentDog` peut être `null` ou `undefined`
**Localisation:** `App.js:70`, `HomeScreen.js:30`

```js
// ❌ MAUVAIS - Incohérence
const [currentDog, setCurrentDog] = useState(undefined); // undefined par défaut
// ...
if (session?.user) {
  await loadUserDog(session.user.id); // Peut setter à null OU undefined
}

// Dans les screens:
{currentDog && <Component />} // Fonctionne
{currentDog?.name} // Fonctionne
```

**Mais ensuite:**
```js
// App.js:70
const hasCurrentDog = currentDog && currentDog.id; // Peut être false alors que currentDog !== undefined
```

**Impact:** Affichage inconsistent de l'interface selon que `currentDog` est `null`, `undefined`, ou `{id: null}`.

### Problème 5.2: Race condition sur l'auth
**Localisation:** `AuthContext.js:13-30`

```js
// ❌ MAUVAIS - Race condition possible
useEffect(() => {
  checkUser(); // Async, peut prendre du temps
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange(...);
  // Si onAuthStateChange se déclenche pendant checkUser(), on a 2 appels simultanés!
}, []);
```

**Impact:** Si l'utilisateur change rapidement de compte, `currentDog` peut être incorrect.

---

## 6. TESTS MANQUANTS - 🟡 SÉRIEUX

### Problème 6.1: Seul le service de notification a des tests
**Localisation:** `components/services/__tests__/notificationService.test.js`

**Absence de tests pour:**
- ❌ Validation des données (ActivityScreen, FeedingScreen)
- ❌ Logique métier (streakService, analyticsService)
- ❌ Integration tests auth → dog setup → home
- ❌ Cas d'erreur Supabase

**Impact:** Les bugs passent en production sans être détectés.

---

## 7. PERFORMANCE - 🟡 SÉRIEUX

### Problème 7.1: `useHomeData` refait les requêtes inutilement
**Localisation:** `hooks/useHomeData.js:30-50`

```js
// ❌ MAUVAIS - Re-render à chaque changement de selectedPeriod
const loadData = useCallback(async () => {
  // Promise.all() lance 6 requêtes Supabase À CHAQUE FOIS
  const [peeStats, total, activityStreak, cleanStreak, lastOut, lastN] = await Promise.all([...]);
}, [dogId, selectedPeriod]); // selectedPeriod change = tout rechargé!

useEffect(() => {
  loadData();
}, [loadData]); // Dépendance sur loadData elle-même!
```

**Impact:** 
- Changement de période (1w → 1m) = 6 nouvelles requêtes
- Si period change plusieurs fois rapidement = débordement Supabase

**Solution:** Cacher localement les stats par période:
```js
const [statsCache, setStatsCache] = useState({});

if (statsCache[selectedPeriod]) {
  setStats(statsCache[selectedPeriod]);
  return; // Pas besoin de recharger
}
```

### Problème 7.2: Pas de pagination sur WalkHistoryScreen
**Localisation:** `WalkHistoryScreen.js:50-100`

```js
// ❌ MAUVAIS - Charge TOUS les walks d'une fois
const { data: allWalks } = await supabase
  .from('outings')
  .select('*') // PAS DE LIMIT!
  .eq('dog_id', currentDog?.id);
```

**Impact:** 
- 1000 sorties = 1000 lignes chargées à la fois
- Ralentit l'app, consomme mémoire

---

## 8. GESTION DE LA CONNECTIVITÉ - 🟠 MOYEN

### Problème 8.1: Pas de retry automatique
**Localisation:** Partout

```js
// ❌ MAUVAIS - Pas de retry
const { error } = await supabase.from('outings').insert([walkData]);
if (error) throw error; // Échoue une fois = échoue toujours
```

**Solution:** Implémenter un retry avec exponential backoff:
```js
async function insertWithRetry(table, data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const { error } = await supabase.from(table).insert([data]);
    if (!error) return { error: null };
    if (i < maxRetries - 1) {
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
  return { error };
}
```

---

## 9. SÉCURITÉ - 🟠 MOYEN

### Problème 9.1: Clés Supabase visible en code
**Localisation:** `config/supabase.js:3-5`

```js
// ⚠️ DANGER - Ces clés sont visibles dans le code source
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**Impact:** N'importe qui qui clone le repo a accès à ta base Supabase.

**Solution:** Utiliser des variables d'env (même en React Native):
```js
import { SUPABASE_URL, SUPABASE_KEY } from '@env';
// Créer un .env et gérer via app.json
```

### Problème 9.2: Pas de vérification de propriété du dog
**Localisation:** `WalkScreen.js:25`, `ActivityScreen.js:25`

```js
// ❌ MAUVAIS - On suppose que currentDog appartient à l'user
const walkData = {
  dog_id: currentDog.id, // Quid si quelqu'un modifie l'app pour utiliser dog_id = 999?
  user_id: user?.id, // user?.id peut être undefined!
};
```

**Solution:** Laisser Supabase vérifier via RLS (Row-Level Security):
```sql
-- Dans Supabase, RLS sur la table outings:
CREATE POLICY "Users can only insert their own dog's data"
ON outings
FOR INSERT
WITH CHECK (dog_id IN (SELECT id FROM dogs WHERE user_id = auth.uid()));
```

---

## 10. DOCUMENTATION - 🟠 MOYEN

### Problème 10.1: Code mal documenté
- Pas de JSDoc sur les fonctions publiques
- Services sans explications
- Pas de README pour la contribution

**Exemple:**
```js
// ❌ MAUVAIS - Pas de doc
export const scheduleNotificationFromOuting = async (outingTime, dogName) => {
  // Qu'est-ce que cette fonction fait exactement?
  // Quels sont les edge cases?
}
```

**Solution:**
```js
/**
 * Programme une notification de rappel basée sur l'heure de la dernière sortie
 * @param {Date} outingTime - Datetime de la sortie
 * @param {string} dogName - Nom du chien (pour le message)
 * @returns {Promise<boolean>} true si succès, false sinon
 * @throws {Error} Si les permissions de notification sont refusées
 * @example
 * await scheduleNotificationFromOuting(new Date('2025-01-01T10:00'), 'Max');
 */
```

---

## 11. CONFIGURATION MISSING - 🟠 MOYEN

### Problème 11.1: Pas d'environnements séparés
- Même Supabase URL pour dev, test, prod
- Pas de mode "demo" pour tester sans vraies données

### Problème 11.2: Migration non gérée
**Localisation:** `MIGRATION_DOG_ASKED_FOR_WALK.md`, `MIGRATION_INCIDENT_REASON.md`

Migrations SQL existent mais:
- Pas de script de déploiement
- Pas de version control des schémas

---

## 📊 RÉSUMÉ PAR SÉVÉRITÉ

| Sévérité | Compte | Exemples |
|----------|--------|----------|
| 🔴 CRITIQUE | 3 | Erreurs non validées, données non validées, logique métier brisée |
| 🟡 SÉRIEUX | 4 | Auth fragile, état incohérent, tests manquants, performance |
| 🟠 MOYEN | 4 | Connectivité, sécurité, documentation, configuration |

---

## 🎯 PRIORITÉ DE FIX

### Phase 1 (Urgent - Une semaine)
1. ✅ Validation des données (ActivityScreen, FeedingScreen)
2. ✅ Gestion d'erreur contextuelle (pas de messages techniques)
3. ✅ Fixer la logique des notifications (programmer d'abord)

### Phase 2 (Important - Deux semaines)
4. ✅ Tests unitaires sur services critiques
5. ✅ Caching des stats (performance)
6. ✅ Retry automatique sur erreurs réseau

### Phase 3 (Souhaitable - Un mois)
7. ✅ Sécurité (variables d'env, RLS)
8. ✅ Pagination sur historique
9. ✅ Documentation JSDoc complète

---

## 💡 PATTERNS À IMPLÉMENTER

```js
// 1. ERROR HANDLER CENTRALISÉ
const getErrorMessage = (error) => {
  if (error.code === 'PGRST116') return 'Ressource non trouvée';
  if (error.code === 'PGRST204') return 'Aucune donnée';
  return error.message || 'Erreur inconnue';
};

// 2. VALIDATION SCHEMA
const activitySchema = {
  duration_minutes: (val) => !val || (val > 0 && val < 480),
  title: (val) => !val || val.length <= 255,
};

// 3. ASYNC RETRY
const withRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === retries - 1) throw err;
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
    }
  }
};
```
