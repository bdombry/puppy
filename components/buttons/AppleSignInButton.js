import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import PropTypes from 'prop-types';

const AppleSignInButton = ({ onSuccess, onError, dogData, userData }) => {
  const { beginSignup, completeSignup, cancelSignup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🍎 Starting Apple Sign In...');

      // Vérifier si Apple Sign In est disponible
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        throw new Error('Apple Sign In not available');
      }

      // Demander les credentials
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('✅ Apple credential received:', credential.identityTokenPayload?.email);

      if (!credential.identityToken) {
        throw new Error('No identity token');
      }

      // ══════════════════════════════════════════════════
      // PHASE 1: Auth Apple + Création données + Vérification
      // ══════════════════════════════════════════════════
      console.log('📝 PHASE 1: Auth Apple + données...');
      setStatusMessage('Connexion Apple...');

      // Activer la garde: onAuthStateChange ne naviguera PAS
      beginSignup();

      // 1a. Auth Apple → Supabase
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        throw error;
      }

      const userId = data.user?.id;
      if (!userId) throw new Error('No user ID from Apple auth');
      console.log('✅ Apple auth OK, userId:', userId);

      // 1b. Vérifier si c'est un returning user (a déjà des chiens)
      const { data: existingDogs } = await supabase
        .from('Dogs')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (existingDogs && existingDogs.length > 0) {
        // Returning user → pas besoin de créer le chien
        console.log('🔄 Returning Apple user - skipping data creation');
        setStatusMessage('Connexion...');

        // ══ PHASE 2 directe: Connexion ══
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        await completeSignup();
        console.log('✅ Returning user connected');
        onSuccess?.();
        return;
      }

      // 1c. Nouveau user → créer profil
      setStatusMessage('Configuration du profil...');
      console.log('📝 Creating profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          first_name: credential.fullName?.givenName || userData?.name || '',
          age_range: userData?.ageRange || null,
          gender: userData?.gender || null,
          family_situation: userData?.situation || null,
          user_problems: JSON.stringify(userData?.problems || []),
        }], { onConflict: 'id' })
        .select();

      if (profileError) {
        console.warn('⚠️ Profile error (non-blocking):', profileError.message);
      } else {
        console.log('✅ Profile created');
      }

      // 1d. Créer le chien
      setStatusMessage('Ajout de votre chien...');
      console.log('🐕 Creating dog...');
      const { data: dogResult, error: dogError } = await supabase
        .from('Dogs')
        .insert([{
          user_id: userId,
          name: dogData?.name || 'Mon chiot',
          breed: dogData?.breed || '',
          birth_date: dogData?.birthDate || null,
          sex: dogData?.sex || 'unknown',
          photo_url: dogData?.photo || dogData?.photo_url || null,
          situation: userData?.situation || dogData?.situation || '',
        }])
        .select();

      if (dogError) {
        throw new Error('Dog creation failed: ' + dogError.message);
      }
      console.log('✅ Dog created:', dogResult?.[0]?.id);

      // 1e. Vérification
      setStatusMessage('Vérification...');
      const { data: verifyDog } = await supabase
        .from('Dogs')
        .select('id, name')
        .eq('user_id', userId)
        .limit(1);

      if (!verifyDog || verifyDog.length === 0) {
        throw new Error('Dog verification failed');
      }
      console.log('✅ PHASE 1 COMPLETE: dog verified -', verifyDog[0].name);

      // ══════════════════════════════════════════════════
      // PHASE 2: Connexion → navigation
      // ══════════════════════════════════════════════════
      console.log('🔗 PHASE 2: Connexion...');
      setStatusMessage('Connexion...');

      await AsyncStorage.setItem('onboardingCompleted', 'true');
      await AsyncStorage.setItem('show_paywall_on_login', 'true');

      await completeSignup();
      console.log('✅ PHASE 2 COMPLETE');
      onSuccess?.();

    } catch (error) {
      console.error('❌ Apple Sign In error:', error);
      cancelSignup();
      setStatusMessage('');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  // Ne montrer le bouton que sur iOS
  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handleAppleSignIn}
      disabled={loading}
      style={{
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.black,
        alignItems: 'center',
        marginBottom: spacing.md,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color={colors.pureWhite} />
      ) : (
        <Text
          style={{
            fontSize: typography.sizes.lg,
            fontWeight: '600',
            color: colors.pureWhite,
          }}
        >
          🍎 Continuer avec Apple
        </Text>
      )}
    </TouchableOpacity>
  );
};

AppleSignInButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  dogData: PropTypes.object,
  userData: PropTypes.object,
};

export default AppleSignInButton;
