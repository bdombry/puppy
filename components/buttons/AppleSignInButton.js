import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import PropTypes from 'prop-types';

// Utilitaire pour extraire le message d'erreur de Supabase correctement
const getErrorMessage = (error) => {
  if (!error) return 'Erreur inconnue';
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  if (error.msg) return error.msg;
  return 'Une erreur est survenue lors de la connexion Apple';
};

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

      // ⚠️ CRITICAL: Délai pour que la session Supabase soit appliquée
      // Sinon, RLS policies voient auth.uid() = NULL et bloquent les inserts
      console.log('⏳ Attente de la session Supabase (RLS check)...');
      await new Promise(r => setTimeout(r, 500));

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
        await AsyncStorage.setItem('show_paywall_on_login', 'false');
        await completeSignup();
        console.log('✅ Returning user connected');
        onSuccess?.();
        return;
      }

      // 1c. Nouveau user → créer profil
      setStatusMessage('Configuration du profil...');
      console.log('📝 Creating profile...', JSON.stringify(userData));
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          first_name: credential.fullName?.givenName || userData?.name || '',
          age_range: userData?.ageRange || null,
          gender: userData?.gender || null,
          family_situation: userData?.situation || null,
          user_problems: JSON.stringify(userData?.problems || []),
          app_source: userData?.app_source || null,
        }], { onConflict: 'id' })
        .select();

      if (profileError) {
        console.error('❌ Profile error (BLOCKING):', profileError);
        throw new Error('Profile creation failed: ' + (profileError.message || JSON.stringify(profileError)));
      } else {
        console.log('✅ Profile created');
      }

      // 1d. Créer le chien
      setStatusMessage('Ajout de votre chien...');
      console.log('🐕 Creating dog...', JSON.stringify(dogData));
      
      // ⚠️ VALIDATION: Le nom du chien est requis!
      if (!dogData?.name || dogData.name.trim() === '') {
        throw new Error('Le nom du chien est requis');
      }
      
      // Mapper le sexe en anglais pour l'enum Supabase (IMPORTANT: du français vers anglais)
      let mappedSex = 'unknown';
      if (dogData?.sex === 'Mâle') mappedSex = 'male';
      else if (dogData?.sex === 'Femelle') mappedSex = 'female';
      else if (['male', 'female', 'unknown'].includes(dogData?.sex)) mappedSex = dogData.sex;
      
      const { data: dogResult, error: dogError } = await supabase
        .from('Dogs')
        .insert([{
          user_id: userId,
          name: dogData.name,
          breed: dogData?.breed || '',
          birth_date: dogData?.birthDate || null,
          sex: mappedSex,
          photo_url: dogData?.photo || dogData?.photo_url || null,
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
      const errorMessage = getErrorMessage(error);
      console.error('📝 Formatted error message:', errorMessage);
      cancelSignup();
      setStatusMessage('');
      
      // Passer un objet d'erreur structuré avec un message clair
      const formattedError = new Error(errorMessage);
      formattedError.originalError = error;
      onError?.(formattedError);
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
