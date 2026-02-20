# 💳 RevenueCat Integration - Configuration Guide

## ✅ Setup Checklist

- [x] SDK installé (`react-native-purchases`)
- [x] Service créé (`revenueCatService.js`)
- [x] Hook créé (`useRevenueCat.js`)
- [x] Initialisation dans App.js
- [ ] Produits configurés dans RevenueCat
- [ ] Entitlements configurés dans RevenueCat
- [ ] Offerings configurés dans RevenueCat
- [ ] Superwall lié à RevenueCat
- [ ] Webhooks App Store Connect configurés

---

## 📋 Step-by-Step Configuration

### **1. Créer les Produits dans RevenueCat**

**URL:** https://dashboard.revenuecat.com → Products

**Tes produits (doivent matcher Apple Connect):**

| ID | Type | Durée |
|-----|------|-------|
| `com.bendombry.pupytracker.premium.monthly` | Subscription | Monthly |
| `com.bendombry.pupytracker.premium.yearly` | Subscription | Yearly |

**À faire dans RevenueCat:**
1. Clique **"Add Product"**
2. Rentre l'ID exact du produit
3. Sélectionne le type: **Subscription**
4. Rentre la durée: **Monthly** ou **Yearly**
5. **Save**

---

### **2. Créer l'Entitlement "PupyTracker Pro"**

**URL:** https://dashboard.revenuecat.com → Entitlements

**À faire:**
1. Clique **"Add Entitlement"**
2. Nom: `PupyTracker Pro`
3. Save

---

### **3. Créer l'Offering (Bundle de produits)**

**URL:** https://dashboard.revenuecat.com → Offerings

**À faire:**
1. Clique **"Create Offering"**
2. Identifier: `default` (c'est l'offering par défaut)
3. Dans **Packages**, ajoute tes 2 produits:
   - `monthly` → `com.bendombry.pupytracker.premium.monthly`
   - `yearly` → `com.bendombry.pupytracker.premium.yearly`
4. Assigne l'entitlement: **PupyTracker Pro**
5. **Save**

---

### **4. Lier Superwall à RevenueCat**

**URL:** https://dashboard.superwall.com → Integrations

**À faire:**
1. Clique **"RevenueCat"**
2. Rentre ta **Public API Key** RevenueCat (commence par `pk_`)
3. Teste la connexion
4. **Save**

---

### **5. Configurer les Webhooks App Store Connect**

**URL:** https://appstoreconnect.apple.com → App Information → Server Notifications

**À faire:**
1. Ajoute l'URL Superwall webhook:
   ```
   https://superwall.com/api/integrations/app-store-connect/webhook?pk=pk_16005ee4001c7c7e7e13d7e722a0d10e01645f91a143affc
   ```
2. Sélectionne les événements:
   - ✅ Subscription events
   - ✅ Test notifications

---

## 🧪 Test dans ton app

### Test 1: Vérifier que l'SDK charge

```javascript
import { useRevenueCat } from './hooks/useRevenueCat';

export const TestScreen = () => {
  const { isPro, loading, offerings, error } = useRevenueCat();

  return (
    <View>
      <Text>Loading: {loading ? 'true' : 'false'}</Text>
      <Text>Is Pro: {isPro ? 'true' : 'false'}</Text>
      <Text>Offerings: {offerings ? 'loaded' : 'none'}</Text>
      <Text>Error: {error || 'none'}</Text>
    </View>
  );
};
```

### Test 2: Afficher les Offerings

```javascript
const TestPaywall = () => {
  const { offerings } = useRevenueCat();

  if (!offerings || !offerings.availablePackages) {
    return <Text>No offerings available</Text>;
  }

  return (
    <View>
      {offerings.availablePackages.map((pkg) => (
        <View key={pkg.identifier}>
          <Text>{pkg.packageType}</Text>
          <Text>{pkg.product.title}</Text>
          <Text>${pkg.product.price}</Text>
        </View>
      ))}
    </View>
  );
};
```

### Test 3: Test Purchase

```javascript
import { purchasePackage } from './services/revenueCatService';

const handlePurchase = async (selectedPackage) => {
  const success = await purchasePackage(selectedPackage);
  if (success) {
    // User est maintenant Pro!
    navigation.navigate('Home');
  }
};
```

---

## 🔑 Clés importantes

| Clé | Usage | Où la trouver |
|-----|-------|--------------|
| `test_UqVNHoytCOjGaizaylLHzoAGomE` | Initialize RevenueCat SDK | `revenueCatService.js` |
| `pk_16005ee4001...` | Superwall API Key | Superwall Dashboard |
| `PupyTracker Pro` | Entitlement ID | RevenueCat Entitlements |

---

## 📊 Architecture de Données

```
RevenueCat
  ├── Products
  │   ├── monthly (com.bendombry.pupytracker.premium.monthly)
  │   └── yearly (com.bendombry.pupytracker.premium.yearly)
  ├── Entitlements
  │   └── PupyTracker Pro
  └── Offerings
      └── default
          ├── Package: monthly → PupyTracker Pro
          └── Package: yearly → PupyTracker Pro
                    ↓
              Superwall Dashboard
                    ↓
              App Store Connect Webhooks
                    ↓
              Real-time syncing
```

---

## 🚀 Utilisation dans ton code

### Vérifie si l'utilisateur est Pro:

```javascript
import { hasEntitlement, ENTITLEMENTS } from './services/revenueCatService';

const isPro = await hasEntitlement(ENTITLEMENTS.PRO);
```

### Affiche le Customer Center:

```javascript
import { showCustomerCenter } from './services/revenueCatService';

await showCustomerCenter(); // Interface native pour gérer l'abonnement
```

### Restaure les achats:

```javascript
import { restorePurchases } from './services/revenueCatService';

const isPro = await restorePurchases();
```

---

## ⚠️ Common Issues

### Products pas visibles dans RevenueCat?
→ Vérifie que l'ID du produit **match exactement** Apple Connect

### Webhooks pas reçus?
→ Attends que tes produits IAP soient **approuvés** par Apple

### Entitlement pas actif après achat?
→ Peut prendre 5-10 secondes. Re-fetch customer info après 10s

### Error: "RevenueCat not configured"?
→ Vérifie que `initializeRevenueCat()` a été appelé au démarrage

---

## 📚 Ressources

- RevenueCat Docs: https://docs.revenuecat.com
- Superwall Integration: https://docs.superwall.com/revenuecat
- Apple App Store Connect: https://appstoreconnect.apple.com
