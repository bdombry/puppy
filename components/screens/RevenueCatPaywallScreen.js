/**
 * RevenueCatPaywallScreen
 *
 * Hard paywall : l'utilisateur DOIT acheter pour continuer.
 * - Si l'utilisateur ferme sans acheter → le paywall se re-présente.
 * - Affiché UNE seule fois par session grâce à UserContext.paywallShownThisSession.
 * - Après achat ou restore réussi :
 *   1) refreshPremiumStatus() met à jour isPremium dans UserContext
 *   2) App.js observe isPremium et auto-dismiss le paywall (approche réactive)
 *   3) Le callback onPaywallDismissed est aussi appelé en backup
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import { colors, spacing } from '../../constants/theme';
import { presentPaywall } from '../../services/revenueCatService';

const RevenueCatPaywallScreen = ({ navigation, onPaywallDismissed }) => {
  const { user } = useAuth();
  const {
    isPremium,
    revenueCatReady,
    refreshPremiumStatus,
    markPaywallShown,
  } = useUser();

  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const hasPresented = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Hard paywall loop ──
  useEffect(() => {
    if (!revenueCatReady) return;
    if (hasPresented.current) return;

    hasPresented.current = true;

    const displayHardPaywall = async () => {
      // Si déjà premium, skip direct
      if (isPremium) {
        console.log('✅ User already premium - skipping paywall');
        markPaywallShown();
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        if (isMounted.current) setPurchaseComplete(true);
        // App.js va auto-dismiss via le useEffect [isPremium]
        // Backup callback au cas où :
        try { onPaywallDismissed?.(); } catch (e) { console.warn('dismiss cb error:', e); }
        return;
      }

      markPaywallShown();
      console.log('🎯 Presenting HARD paywall...');

      let purchased = false;

      while (!purchased && isMounted.current) {
        try {
          const { success } = await presentPaywall({
            listeners: {
              onPurchaseCompleted: () => console.log('✅ Purchase completed'),
              onPurchaseCancelled: () => console.log('👋 Cancelled - will re-present'),
              onRestoreCompleted: () => console.log('✅ Restore completed'),
              onDismiss: () => console.log('🚪 Dismissed - checking entitlement'),
            },
          });

          // Vérifier le statut premium à la source
          // Cela met à jour isPremium dans UserContext → App.js le détecte
          const isNowPremium = await refreshPremiumStatus();

          if (isNowPremium || success) {
            purchased = true;
            console.log('✅ Premium confirmed after purchase');
          } else {
            console.log('🔄 Not premium yet - re-presenting in 500ms...');
            await new Promise((r) => setTimeout(r, 500));
          }
        } catch (error) {
          console.error('❌ Paywall loop error:', error.message);
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      if (isMounted.current) {
        console.log('✅ Purchase loop finished');
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        setPurchaseComplete(true);
        // App.js détecte isPremium=true et auto-dismiss.
        // Backup callback :
        try { onPaywallDismissed?.(); } catch (e) { console.warn('dismiss cb error:', e); }
      }
    };

    displayHardPaywall();
  }, [revenueCatReady]);

  // ── Fallback navigation.reset si on est toujours là 2s après l'achat ──
  useEffect(() => {
    if (!purchaseComplete) return;
    const timeout = setTimeout(() => {
      console.log('⏱️ Fallback: navigation.reset vers MainTabs');
      try {
        onPaywallDismissed?.();
        // Vérifier que MainTabs existe dans le navigateur avant de reset
        if (navigation.getState()?.routeNames?.includes('MainTabs')) {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      } catch (e) {
        console.warn('Fallback navigation error (non-bloquant):', e);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [purchaseComplete, navigation, onPaywallDismissed]);

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
          {purchaseComplete
            ? 'Préparation de votre espace...'
            : 'Chargement de l\'offre spéciale...'}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RevenueCatPaywallScreen;
