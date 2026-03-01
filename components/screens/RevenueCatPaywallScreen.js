import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../constants/theme';
import { 
  ENTITLEMENTS, 
  hasEntitlement,
  presentPaywall,
} from '../../services/revenueCatService';

/**
 * RevenueCatPaywallScreen
 *
 * Écran du paywall RevenueCat no-code.
 * Affiche le paywall custom que tu as créé sur le dashboard RevenueCat.
 *
 * Accessible via:
 * - deeplink: pupytracker://paywall
 * - Navigation dans le flow onboarding
 *
 * Après fermeture ou achat réussi, navigue vers l'écran approprié.
 */
const RevenueCatPaywallScreen = ({ navigation, revenueCatReady = false }) => {
  const { user, currentDog } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offeringId] = useState('PupyTracker');

  console.log('🔷 RevenueCatPaywallScreen mounted');
  console.log('  user:', user?.email || 'not logged in');
  console.log('  currentDog:', currentDog?.name || 'no dog');
  console.log('  revenueCatReady:', revenueCatReady);

  const navigateNext = async () => {
    console.log('📍 navigateNext called');

    try {
      // Si ouvert via deeplink et pas authenticated, fermer simplement
      if (!user) {
        console.log('→ No user, going back (deeplink case)');
        navigation.goBack();
        return;
      }

      // Marquer l'onboarding comme complété maintenant que le paywall est fermé
      console.log('📝 Marking onboarding as completed (after paywall)');
      await AsyncStorage.setItem('onboardingCompleted', 'true');

      // Petit délai
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Après paywall, aller directement à Home
      if (user && currentDog) {
        console.log('→ Going to MainTabs (user + dog)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (user && !currentDog) {
        console.log('→ Going to MainTabs (user + no dog yet)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        console.log('→ Going to Auth (not logged in)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } catch (error) {
      console.error('❌ Error in navigateNext:', error);
      // Continuer quand même
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  useEffect(() => {
    const displayPaywall = async () => {
      try {
        // Attendre que RevenueCat soit prêt
        if (!revenueCatReady) {
          console.log('⏳ Waiting for RevenueCat to be ready...');
          return;
        }

        setLoading(true);
        console.log('🎯 Presenting RevenueCat paywall with RevenueCatUI...');

        // 🎬 Appeler le nouveau service avec listeners
        const paywallResponse = await presentPaywall({
          offering: null, // Utilise l'offering par défaut
          
          // Listeners pour suivre le cycle de vie du paywall
          onPurchaseStarted: () => {
            console.log('💳 Purchase flow started');
          },
          
          onPurchaseCompleted: (customerInfo) => {
            console.log('✅ Purchase completed!', {
              entitlements: Object.keys(customerInfo.entitlements.active || {}),
            });
          },
          
          onPurchaseError: (error) => {
            console.error('❌ Purchase error during flow:', error);
          },
          
          onPurchaseCancelled: () => {
            console.log('👋 User cancelled purchase');
          },
          
          onRestoreStarted: () => {
            console.log('🔄 Restore purchases started');
          },
          
          onRestoreCompleted: (customerInfo) => {
            console.log('✅ Restore completed!', {
              entitlements: Object.keys(customerInfo.entitlements.active || {}),
            });
          },
          
          onRestoreError: (error) => {
            console.error('❌ Restore error:', error);
          },
          
          onDismiss: () => {
            console.log('🚪 Paywall dismissed');
          },
        });

        console.log('📊 Paywall response:', {
          success: paywallResponse.success,
          result: paywallResponse.result,
          message: paywallResponse.message,
        });

        // Vérifier si l'utilisateur a acheté après la fermeture
        const hasPro = await hasEntitlement(ENTITLEMENTS.PRO);
        console.log('🔑 Post-paywall entitlement check:', hasPro ? '✅ Pro' : '❌ Free');

        setLoading(false);
        
        // Naviguer après fermeture du paywall
        navigateNext();
      } catch (error) {
        console.error('❌ Unexpected error in paywall flow:', error);
        console.error('  Error message:', error.message);
        console.error('  Stack:', error.stack);

        setLoading(false);
        
        Alert.alert(
          '❌ Erreur Paywall',
          `${error.message || 'Une erreur est survenue'}\n\nVeuillez réessayer.`,
          [{ text: 'Continuer', onPress: navigateNext }]
        );
      }
    };

    displayPaywall();

    return () => {
      // Cleanup
    };
  }, [user, currentDog, navigation, revenueCatReady]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{
            marginTop: spacing.lg,
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: 'center',
          }}
        >
          Chargement de l'offre spéciale...
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RevenueCatPaywallScreen;
