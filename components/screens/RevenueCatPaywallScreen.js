import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../constants/theme';
import { ENTITLEMENTS, hasEntitlement } from '../../services/revenueCatService';

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
    const presentPaywall = async () => {
      try {
        // Attendre que RevenueCat soit prêt
        if (!revenueCatReady) {
          console.log('⏳ Waiting for RevenueCat to be ready...');
          return;
        }

        setLoading(true);
        console.log('🎯 Presenting RevenueCat paywall...');

        // Vérifier que Purchases est bien initialisé
        if (!Purchases) {
          console.error('❌ Purchases not initialized!');
          navigateNext();
          return;
        }

        // Récupérer les offerings
        console.log('📦 Fetching offerings...');
        const offerings = await Purchases.getOfferings();
        
        console.log('📦 Offerings retrieved:', {
          current: offerings.current?.identifier,
          all: offerings.all?.map(o => o.identifier)
        });

        if (!offerings.current) {
          console.error('❌ No current offering available!');
          console.error('   Available offerings:', offerings.all?.map(o => ({ id: o.identifier, packages: o.packages.length })));
          Alert.alert(
            'Erreur Offre',
            'Aucune offre disponible. Vérifiez votre configuration RevenueCat.',
            [{ text: 'Continuer', onPress: navigateNext }]
          );
          setLoading(false);
          return;
        }

        console.log(
          '📦 Current offering:',
          offerings.current.identifier,
          'with packages:',
          offerings.current.packages.map(p => p.identifier)
        );

        // 🎬 Présenter le paywall
        console.log('📱 Calling Purchases.presentPaywall()...');
        await Purchases.presentPaywall(offerings.current);

        console.log('✅ Paywall was presented successfully');

        // Vérifier si l'utilisateur a acheté après fermeture
        const hasPro = await hasEntitlement(ENTITLEMENTS.PRO);
        console.log('🔑 Post-paywall entitlement check:', hasPro ? '✅ Pro' : '❌ Free');

        setLoading(false);
        navigateNext();
      } catch (error) {
        console.error('❌ Error presenting paywall:', error);
        console.error('  Error message:', error.message);
        console.error('  Error code:', error.code);
        console.error('  Stack:', error.stack);

        // Si c'est juste une fermeture normale (pas une erreur critique)
        if (error.message?.includes('User cancelled') || error.code === 'ERR_PURCHASER_CANCELLED') {
          console.log('👋 User cancelled paywall');
          setLoading(false);
          navigateNext();
          return;
        }

        // Erreur réelle
        setLoading(false);
        Alert.alert(
          '❌ Erreur Paywall',
          `${error.message || 'Une erreur est survenue'}\n\nCode: ${error.code || 'UNKNOWN'}`,
          [{ text: 'Continuer', onPress: navigateNext }]
        );
      }
    };

    presentPaywall();

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
