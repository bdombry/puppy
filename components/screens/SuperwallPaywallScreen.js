import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePlacement } from 'expo-superwall';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing } from '../../constants/theme';

const SuperwallPaywallScreen = ({ navigation }) => {
  const { user, currentDog } = useAuth();

  console.log('🔷 SuperwallPaywallScreen mounted');
  console.log('  user:', user?.email || 'not logged in');
  console.log('  currentDog:', currentDog?.name || 'no dog');

  const { registerPlacement, state: placementState } = usePlacement({
    onError: (err) => {
      console.error('❌ Placement Error:', err);
      // Si erreur, continuer au prochain écran approprié
      navigateNext();
    },
    onPresent: (info) => {
      console.log('✅ Paywall Presented:', info);
    },
    onDismiss: (info, result) => {
      console.log('👋 Paywall Dismissed:', info, 'Result:', result);
      // Quand l'utilisateur ferme le paywall, aller à l'écran approprié
      setTimeout(() => {
        navigateNext();
      }, 500);
    },
  });

  const navigateNext = async () => {
    console.log('📍 navigateNext called');
    
    try {
      // Marquer l'onboarding comme complété maintenant que le paywall est terminated
      console.log('📝 Marking onboarding as completed (after paywall)');
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // Petit délai
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Logique de navigation après paywall
      if (user && currentDog) {
        // Connecté + a un chien → Main App
        console.log('→ Going to MainTabs (user + dog)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else if (user && !currentDog) {
        // Connecté + pas de chien → Dog Setup
        console.log('→ Going to DogSetup (user + no dog)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'DogSetup' }],
        });
      } else {
        // Pas connecté → Auth
        console.log('→ Going to Auth (not logged in)');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Auth' }],
        });
      }
    } catch (error) {
      console.error('❌ Error in navigateNext:', error);
    }
  };

  useEffect(() => {
    // Trigger le paywall automatiquement au chargement du screen
    const triggerPaywall = async () => {
      try {
        console.log('🎯 Triggering placement: campaign_trigger');
        await registerPlacement({
          placement: 'campaign_trigger', // Placement par défaut Superwall
        });
        console.log('✅ Placement registered successfully');
      } catch (error) {
        console.error('❌ Error triggering placement:', error);
        // En cas d'erreur, continuer
        navigateNext();
      }
    };

    triggerPaywall();
  }, [registerPlacement]);

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

export default SuperwallPaywallScreen;
