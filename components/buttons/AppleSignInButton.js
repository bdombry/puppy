import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { supabase } from '../../config/supabase';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import PropTypes from 'prop-types';

const AppleSignInButton = ({ onSuccess, onError, dogData, userData, refreshDogs }) => {
  const [loading, setLoading] = useState(false);

  // Sauvegarde les infos de l'utilisateur dans la table profiles
  const saveUserInfo = async (userId) => {
    try {
      console.log('💾 saveUserInfo called with userId:', userId);
      console.log('   userData:', userData);

      const firstName = userData?.name || '';
      const ageRange = userData?.ageRange || null;
      const gender = userData?.gender || null;
      const situation = userData?.situation || null;
      const problems = userData?.problems || [];
      const appSource = userData?.app_source || null;

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            first_name: firstName,
            age_range: ageRange,
            gender: gender,
            family_situation: situation,
            user_problems: JSON.stringify(problems),
            app_source: appSource,
          },
        ])
        .select();

      if (error) {
        console.error('❌ Could not save user info:', error);
        console.error('   Error details:', error.message, error.code);
        // Ne pas bloquer même si ça échoue
        return false;
      } else {
        console.log('✅ User info saved successfully');
        return true;
      }
    } catch (err) {
      console.error('❌ Error saving user info:', err);
      // Ne pas bloquer même si ça échoue
      return false;
    }
  };

  // Sauvegarde les infos du chien
  const saveDogInfo = async (userId) => {
    try {
      console.log('💾 saveDogInfo called with userId:', userId);
      console.log('   dogData:', dogData);
      console.log('   userData:', userData);

      // Créer un dog avec les données disponibles ou des valeurs par défaut
      const dogName = dogData?.name || 'Mon chiot';
      const breed = dogData?.breed || '';
      const birthDate = dogData?.birthDate || null;
      const sex = dogData?.sex || 'unknown';
      const situation = userData?.situation || dogData?.situation || '';
      const photoUrl = dogData?.photo_url || null;

      console.log('📝 Dog data to insert:', { dogName, breed, birthDate, sex, situation });

      const { data, error } = await supabase
        .from('Dogs')
        .insert([
          {
            // Laisser la BD générer l'ID (UUID auto-généré)
            user_id: userId,
            name: dogName,
            breed: breed,
            birth_date: birthDate,
            sex: sex,
            photo_url: photoUrl,
            situation: situation,
            // created_at se met à jour automatiquement avec NOW()
          },
        ])
        .select();

      if (error) {
        console.error('❌ Could not save dog info:', error);
        console.error('   Error details:', error.message, error.code);
        return false;
      } else {
        console.log('✅ Dog info saved successfully:', data);
        return true;
      }
    } catch (err) {
      console.error('❌ Error saving dog info:', err);
      return false;
    }
  };

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

      // Envoyer le token à Supabase
      if (credential.identityToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'apple',
          token: credential.identityToken,
        });

        if (error) {
          console.error('❌ Supabase error:', error);
          onError(error);
        } else {
          console.log('✅ User signed in via Apple:', data.user?.email);

          const userId = data.user?.id;
          if (!userId) {
            console.error('❌ No user ID returned');
            throw new Error('No user ID returned from Apple Sign In');
          }

          // Sauvegarder les infos de l'utilisateur
          console.log('👤 Saving user info...');
          await saveUserInfo(userId);

          // Sauvegarder les infos du chien - CRUCIAL
          console.log('🐕 Saving dog info...');
          await saveDogInfo(userId);

          // Mettre à jour le profil avec le prénom Apple si disponible
          // (et si first_name n'a pas été rempli pendant l'onboarding)
          if (credential.fullName?.givenName) {
            const { error: nameError } = await supabase
              .from('profiles')
              .update({ first_name: credential.fullName.givenName })
              .eq('id', userId)
              .is('first_name', null); // Ne pas écraser si déjà rempli

            if (nameError) {
              console.warn('⚠️ Could not update profile first_name:', nameError);
            } else {
              console.log('✅ Profile updated with Apple first_name:', credential.fullName.givenName);
            }
          }

          // Attendre que les données soient persistées et synchro
          console.log('⏳ Waiting for data sync...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Rafraîchir les infos du chien dans le context
          console.log('🔄 Refreshing dogs...');
          if (refreshDogs) {
            console.log('🔄 Refreshing dogs after Apple Sign In...');
            await refreshDogs();
          }
          
          console.log('✅ Apple Sign In - calling onSuccess');
          onSuccess?.();
        }
      } else {
        throw new Error('No identity token');
      }
    } catch (error) {
      console.error('❌ Apple Sign In error:', error);
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
        backgroundColor: colors.black,  // Apple brand black
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
  refreshDogs: PropTypes.func,
};

export default AppleSignInButton;
