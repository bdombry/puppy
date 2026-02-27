# 🐛 Superwall Crash Debug Guide

## Problèmes Identifiés & Fixes Appliquées

### 🔴 Problème 1: RevenueCat n'était pas attendu
**Avant:** `SuperwallPaywallScreen` appelait `Superwall.instance.present()` sans vérifier que RevenueCat était initialisé
**Après:** Ajout flag `revenueCatReady` qui empêche Superwall de s'afficher tant que RevenueCat n'est pas prêt

### 🔴 Problème 2: Pas d'initialisation explicite Superwall-RevenueCat
**Avant:** RevenueCat était initialisé mais pas "lié" à Superwall
**Après:** `revenueCatService.js` maintenant configure Superwall après RevenueCat

### 🔴 Problème 3: Logs insuffisants
**Avant:** Impossible de déboguer sans logs
**Après:** Logs détaillés à chaque étape + stack traces

---

## ✅ Changements Appliqués

### 1. **App.js**
- ✅ Ajout `revenueCatReady` boolean state
- ✅ Flag mis à `true` après `initializeRevenueCat()` (même en cas d'erreur)
- ✅ Passage du flag au `SuperwallPaywallScreen` via props

### 2. **SuperwallPaywallScreen.js**
- ✅ Accepte prop `revenueCatReady`
- ✅ Logs au mount montrent `revenueCatReady` status
- ✅ Attends `revenueCatReady === true` avant d'appeler `Superwall.instance.present()`
- ✅ Vérification que `Superwall.instance` n'est pas null
- ✅ Stack traces complètes des erreurs

### 3. **revenueCatService.js**
- ✅ Import de Superwall pour "lier" les deux SDKs
- ✅ Tentative de configuration après RevenueCat init
- ✅ Logs détaillés du processus d'initialisation

---

## 🔧 Comment Déboguer Le Crash

### Étape 1: Vérifier les Logs
```bash
# Lors du lancement, regarde ces messages:
💳 Initializing RevenueCat...
✅ RevenueCat configured
✅ Purchases synced
🔗 Linking Superwall to RevenueCat...
✅ Superwall linked to RevenueCat
✅ RevenueCat initialized successfully

# Supprimer le flag
⏳ Waiting for RevenueCat to be ready...

# Ensuite (après ~2 sec):
🔷 SuperwallPaywallScreen mounted
  user: user@email.com
  currentDog: Rex
  revenueCatReady: true

# Enfin:
🎯 Triggering Superwall with placement: campaign_trigger
📱 Calling Superwall.instance.present()...
```

### Étape 2: Chercher les Erreurs
Si tu vois ce message, LE PAYWALL N'EXISTE PAS:
```
❌ Failed to present paywall: [Error message about placement]
```

**Solution:** Va sur https://dashboard.superwall.com et crée un placement nommé `campaign_trigger`

### Étape 3: Chercher Superwall.instance undefined
```
❌ Superwall.instance is not initialized!
```

**Solution:** Vérifier que SuperwallProvider est bien présent dans App.js

### Étape 4: Erreur lors de présentation
```
❌ Error triggering Superwall: [Error]
  Stack: [Full stack trace]
```

**Solution:** Partage le stack trace complet - cela indiquera le vrai problème

---

## 📋 Checklist Superwall Dashboard

Pour que Superwall fonctionne, ces éléments doivent être configurés:

- [ ] **API Keys dans App.js**
  - [ ] iOS: `pk_16005ee4001...` (trouve-le dans Superwall Dashboard)
  - [ ] Android: Même clé

- [ ] **Placement "campaign_trigger"**
  - [ ] Va sur Superwall Dashboard → Paywalls
  - [ ] Crée/Vérifie un placement nommé `campaign_trigger`
  - [ ] Assure-toi qu'il a des produits assignés

- [ ] **RevenueCat Lié**
  - [ ] Va sur Superwall Dashboard → Integrations → RevenueCat
  - [ ] Clé publique RevenueCat: `pk_GPmdJMpBiCMlsPRxKIJiRGtoWAJpH` (trouvée dans config/env.js)
  - [ ] Test la connexion

- [ ] **Offerings Configurés**
  - [ ] Va sur Superwall → Offerings
  - [ ] Assure-toi que tes produits RevenueCat apparaissent

---

## 🧪 Test Rapide

Pour tester que Superwall marche:

```javascript
// Dans n'importe quel screen:
import { Superwall } from 'expo-superwall';

const testSuperwall = async () => {
  try {
    console.log('Testing Superwall...');
    console.log('Instance:', Superwall.instance);
    
    // Test 1: L'instance existe?
    if (!Superwall.instance) {
      console.error('❌ Superwall.instance is null!');
      return;
    }
    
    // Test 2: Essayer de présenter
    await Superwall.instance.present('campaign_trigger');
    console.log('✅ Superwall presented successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Appelle testSuperwall() depuis un bouton de test
```

---

## 💡 Si Ça Marche Toujours Pas

### Option 1: Vérifier que le placement existe
Va sur https://dashboard.superwall.com → Paywalls
Cherche un placement nommé `campaign_trigger` - si ça n'existe pas, crée-le

### Option 2: Vérifier les clés API
Assure-toi que les clés dans App.js correspondent à ton compte Superwall:
```javascript
<SuperwallProvider apiKeys={{ 
  ios: 'pk_16005ee4001c7c7e7e13d7e722a0d10e01645f91a143affc', 
  android: 'pk_16005ee4001c7c7e7e13d7e722a0d10e01645f91a143affc' 
}}>
```

### Option 3: Réinitialiser l'app
```bash
npm start -- --clear
# Ou
expo start --clear
```

### Option 4: Vérifier les dépendances
```bash
npm list expo-superwall react-native-purchases
# Doit afficher:
# expo-superwall@1.0.2
# react-native-purchases@9.10.1
```

---

## 📊 Architecture de la Fix

```mermaid
App.js Initialisation
    ↓
RevenueCat init (async)
    ↓
Set revenueCatReady = true
    ↓
SuperwallPaywall mounted
    ↓
Check revenueCatReady?
    ↓ (false)
Wait...
    ↓ (true)
Superwall.instance.present()
    ↓
✅ Paywall affichée
```

---

## 🚀 Prochaines Étapes

1. **Teste maintenant** - accède au paywall et envoie les logs si ça crash
2. **Vérifie le dashboard** - assure-toi que `campaign_trigger` existe
3. **Partage les logs** - si ça crash, envoie les messages console avec 🔴❌ symbols

