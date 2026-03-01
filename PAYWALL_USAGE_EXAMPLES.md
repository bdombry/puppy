# 🎯 Exemplaire d'Utilisation du Paywall RevenueCat

Ce fichier montre comment implémenter le paywall dans différents contextes.

---

## 📦 **Cas 1: Paywall Modal au Sein de l'App**

Utilisez `presentPaywallIfNeeded()` pour afficher un paywall uniquement si l'utilisateur n'a pas l'accès Pro.

### Exemple: Bouton "Unlock Pro Features"
```javascript
// Dans un component quelconque
import { presentPaywallIfNeeded, ENTITLEMENTS } from '../services/revenueCatService';
import { Alert } from 'react-native';

const ProFeaturesButton = () => {
  const [loading, setLoading] = useState(false);

  const handleUnlockPro = async () => {
    try {
      setLoading(true);

      // ✅ Cet appel affiche le paywall SEULEMENT si l'utilisateur
      // n'a pas déjà l'accès Pro
      const result = await presentPaywallIfNeeded(ENTITLEMENTS.PRO, {
        // Ces listeners sont appelés au cours du flow
        onPurchaseStarted: () => {
          console.log('💳 Purchase started');
        },
        onPurchaseCompleted: (customerInfo) => {
          console.log('✅ Purchase completed!');
          Alert.alert('🎉 Succès!', 'Vous avez débloqué l\'accès Pro');
          // Refresh vos données/UI ici
        },
        onPurchaseError: (error) => {
          console.error('❌ Purchase error:', error);
          Alert.alert('❌ Erreur', `Erreur d'achat: ${error.message}`);
        },
        onDismiss: () => {
          console.log('🚪 Paywall dismissed');
        },
      });

      // Vérifier le résultat
      if (result.hadEntitlement) {
        // L'utilisateur avait DÉJÀ l'accès Pro
        // Le paywall N'A PAS ÉTÉ AFFICHÉ
        Alert.alert('ℹ️ Info', 'Vous avez déjà l\'accès Pro!');
      } else if (result.success) {
        // L'utilisateur vient d'ACHETER Pro
        console.log('✅ New Pro user!');
      } else {
        // L'utilisateur a ANNULÉ
        console.log('👋 User cancelled');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌ Erreur', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleUnlockPro} disabled={loading}>
      <Text>{loading ? 'Chargement...' : '🔓 Unlock Pro'}</Text>
    </TouchableOpacity>
  );
};

export default ProFeaturesButton;
```

---

## 📰 **Cas 2: Paywall Full-Screen Après Onboarding**

Utilisez `presentPaywall()` pour afficher le paywall systématiquement après que l'utilisateur ait créé son compte.

### Exemple: RevenueCatPaywallScreen (déjà implémenté) ✅

```javascript
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../constants/theme';
import { presentPaywall, hasEntitlement, ENTITLEMENTS } from '../../services/revenueCatService';

const RevenueCatPaywallScreen = ({ navigation, revenueCatReady = false }) => {
  const { user, currentDog } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const displayPaywall = async () => {
      if (!revenueCatReady) {
        console.log('⏳ Waiting for RevenueCat...');
        return;
      }

      try {
        setLoading(true);

        const paywallResponse = await presentPaywall({
          // 💳 Achat commencé
          onPurchaseStarted: () => {
            console.log('🛒 Purchase flow started');
          },

          // ✅ Achat réussi
          onPurchaseCompleted: (customerInfo) => {
            console.log('✅ Purchase successful!', {
              entitlements: Object.keys(customerInfo.entitlements.active),
            });
          },

          // ❌ Erreur lors de l'achat
          onPurchaseError: (error) => {
            console.error('❌ Purchase failed:', error);
          },

          // 👋 Utilisateur a annulé
          onPurchaseCancelled: () => {
            console.log('👋 User cancelled purchase');
          },

          // 🔄 Restauration commencée
          onRestoreStarted: () => {
            console.log('🔄 Attempting to restore purchases...');
          },

          // ✅ Restauration réussie
          onRestoreCompleted: (customerInfo) => {
            console.log('✅ Purchases restored!');
          },

          // ❌ Erreur de restauration
          onRestoreError: (error) => {
            console.error('❌ Restore failed:', error);
          },

          // 🚪 Paywall fermé (peu importe la raison)
          onDismiss: () => {
            console.log('🚪 Paywall dismissed');
          },
        });

        console.log('📊 Paywall result:', paywallResponse);

        // Vérifier l'accès après fermeture du paywall
        const hasPro = await hasEntitlement(ENTITLEMENTS.PRO);
        console.log('Pro access after paywall:', hasPro);

        setLoading(false);

        // Naviguer vers l'app principale
        if (user && currentDog) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } else {
          navigation.goBack();
        }
      } catch (error) {
        console.error('❌ Error:', error);
        setLoading(false);
        Alert.alert('Erreur', error.message, [
          { text: 'Continuer', onPress: () => navigation.goBack() },
        ]);
      }
    };

    displayPaywall();
  }, [revenueCatReady, user, currentDog, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </SafeAreaView>
  );
};

export default RevenueCatPaywallScreen;
```

---

## 🔗 **Cas 3: Accès via DeepLink**

Permettre aux utilisateurs d'accéder au paywall via un lien personnalisé.

### Setup DeepLink dans App.js ✅
```javascript
const linking = {
  prefixes: ['pupytracker://', 'https://pupytracker.app/'],
  config: {
    screens: {
      RevenueCatPaywall: 'paywall',  // ← DeepLink pour le paywall
      MainTabs: '',
      // ... autres routes
    },
  },
};
```

### Utilisation
```javascript
// Partager ce lien avec les utilisateurs:
// pupytracker://paywall
// https://pupytracker.app/paywall

// Quand ils cliquent, le paywall s'ouvre automatiquement
```

---

## 🔐 **Cas 4: Vérifier l'Accès Avant D'Afficher une Feature**

Utilisez `hasEntitlement()` pour vérifier silencieusement si l'utilisateur a accès.

### Exemple: Premium Feature Guard
```javascript
import { hasEntitlement, ENTITLEMENTS } from '../services/revenueCatService';
import { useEffect, useState } from 'react';

const PremiumFeatureScreen = ({ navigation }) => {
  const [canAccess, setCanAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const hasPro = await hasEntitlement(ENTITLEMENTS.PRO);
        setCanAccess(hasPro);

        if (!hasPro) {
          // Pas d'accès → montrer paywall
          navigation.navigate('RevenueCatPaywall');
        }
      } catch (error) {
        console.error('Check error:', error);
        setCanAccess(false); // Par défaut, pas d'accès
      } finally {
        setChecking(false);
      }
    };

    checkAccess();
  }, [navigation]);

  if (checking) {
    return <ActivityIndicator />;
  }

  if (!canAccess) {
    return <Text>Revenez après l'achat</Text>;
  }

  return (
    // Afficher la feature premium
    <View>
      <Text>🎉 Premium Feature Content</Text>
    </View>
  );
};

export default PremiumFeatureScreen;
```

---

## 👥 **Cas 5: Customer Center - Gérer l'Abonnement**

Permettre aux utilisateurs Pro de gérer leur abonnement.

### Dans AccountScreen
```javascript
import { showCustomerCenter, hasEntitlement, ENTITLEMENTS } from '../services/revenueCatService';
import { TouchableOpacity, Alert } from 'react-native';

const AccountScreen = () => {
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const checkPro = async () => {
      const pro = await hasEntitlement(ENTITLEMENTS.PRO);
      setIsPro(pro);
    };
    checkPro();
  }, []);

  const handleManageSubscription = async () => {
    try {
      await showCustomerCenter();
      // Utilisateur peut voir ses abonnements, annuler, etc.
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  if (!isPro) {
    return (
      <Button 
        title="Upgrade to Pro"
        onPress={() => navigation.navigate('RevenueCatPaywall')}
      />
    );
  }

  return (
    <View>
      <Text>✅ Pro Member</Text>
      <Button 
        title="Manage Subscription"
        onPress={handleManageSubscription}
      />
    </View>
  );
};
```

---

## 🔄 **Cas 6: Restaurer les Achats Précédents**

Permettre aux utilisateurs de restaurer l'accès Pro après un changement de device.

### Dans AccountScreen
```javascript
import { restorePurchases, ENTITLEMENTS, hasEntitlement } from '../services/revenueCatService';
import { Alert, Button } from 'react-native';

const handleRestore = async () => {
  try {
    Alert.alert(
      'Restauration',
      'Vérification des achats précédents...',
      [{ text: 'Annuler', onPress: () => {} }],
      { cancelable: false }
    );

    const isPro = await restorePurchases();

    if (isPro) {
      Alert.alert(
        '✅ Succès',
        'Vos achats précédents ont été restaurés!',
        [{ text: 'OK', onPress: () => {
          // Refresh UI
          checkProStatus();
        }}]
      );
    } else {
      Alert.alert(
        'ℹ️ Info',
        'Aucun achat trouvé pour cet account. Veuillez acheter.',
        [
          { text: 'Annuler', onPress: () => {} },
          { text: 'Acheter', onPress: () => navigation.navigate('RevenueCatPaywall') },
        ]
      );
    }
  } catch (error) {
    Alert.alert('❌ Erreur', error.message);
  }
};
```

---

## 🎯 **Bonnes Pratiques**

### ✅ À Faire
```javascript
// 1. Toujours utiliser le service revenueCatService
import { presentPaywall, presentPaywallIfNeeded } from '../services/revenueCatService';

// 2. Gérer les erreurs
try {
  const result = await presentPaywall({ /* listeners */ });
} catch (error) {
  // Afficher erreur à l'utilisateur
}

// 3. Utiliser les listeners pour UX réactive
onPurchaseStarted: () => showLoadingIndicator(),
onPurchaseCompleted: () => {
  hideLoadingIndicator();
  showSuccessAlert();
  refreshUserData();
}

// 4. Vérifier l'entitlement après achat
const hasPro = await hasEntitlement(ENTITLEMENTS.PRO);
```

### ❌ À Éviter
```javascript
// ❌ NE PAS utiliser directement Purchases
import Purchases from 'react-native-purchases';
const result = await Purchases.presentPaywall(offering); // Mauvais!

// ❌ NE PAS ignorer les erreurs
await presentPaywall(); // Sans try/catch -> crash

// ❌ NE PAS vérifier l'accès seulement une fois au démarrage
// RevenueCat peut changer durant la session (p.ex. achat depuis autre device)

// ❌ NE PAS présenter le paywall à un utilisateur déjà Pro
// (utiliser presentPaywallIfNeeded à la place)
```

---

## 🧪 **Testing**

### Test Mode RevenueCat
```javascript
// Dans App.js, pendant le dev:
const isTestMode = __DEV__; // true en development

if (isTestMode) {
  // Logs plus verbeux
  console.log('🧪 Testing mode - full revenue logs enabled');
}
```

### Mock pour Tests Unitaires
```javascript
// __mocks__/revenueCatService.js
export const presentPaywall = jest.fn().mockResolvedValue({
  success: true,
  result: 'PURCHASED',
  message: 'Mock purchase',
});

export const presentPaywallIfNeeded = jest.fn().mockResolvedValue({
  success: true,
  hadEntitlement: false,
  result: 'PURCHASED',
});

export const hasEntitlement = jest.fn().mockResolvedValue(true);
```

---

## 📊 **Analytics - Tracker les Conversions**

Envoyer les événements d'achat à vos outils d'analytics:

```javascript
// Dans les listeners
onPurchaseCompleted: (customerInfo) => {
  // Envoyer event à Firebase Analytics
  analytics().logEvent('purchase_pro', {
    timestamp: new Date().toISOString(),
    entitlements: Object.keys(customerInfo.entitlements.active),
  });

  // Envoyer à Mixpanel
  mixpanel.track('User Purchased Pro', {
    userId: customerInfo.originalAppUserId,
  });
}
```

---

## ✨ Conclusion

Vous avez maintenant un système paywall **robuste**, **conforme** et **flexible** pour gérer tous les cas de monetization!

Pour plus d'info: https://rev.cat/react-native-paywalls
