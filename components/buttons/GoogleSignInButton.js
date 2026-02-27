import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../config/supabase';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import PropTypes from 'prop-types';

WebBrowser.maybeCompleteAuthSession();

const GoogleSignInButton = ({ onSuccess, onError, dogData, userData, refreshDogs }) => {
  const [loading, setLoading] = useState(false);

  // Sauvegarde les infos de l'utilisateur dans la table profiles
  const saveUserInfo = async (userId) => {
    try {
      if (!userData || !userData.name) {
        console.log('⚠️ No user data to save');
        return;
      }

      console.log('💾 Saving user info to profiles...', userData);

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            first_name: userData.name || '',
            age_range: userData.ageRange || null,
            gender: userData.gender || null,
            family_situation: userData.situation || null,
          },
        ]);

      if (error) {
        console.warn('⚠️ Could not save user info:', error);
      } else {
        console.log('✅ User info saved successfully');
      }
    } catch (err) {
      console.warn('⚠️ Error saving user info:', err);
    }
  };

  // Sauvegarde les infos du chien
  const saveDogInfo = async (userId) => {
    try {
      if (!dogData || !dogData.name) {
        console.log('⚠️ No dog data to save');
        return;
      }

      console.log('💾 Saving dog info to Supabase...', dogData);

      const { error } = await supabase
        .from('Dogs')
        .insert([
          {
            id: `${userId}-${Date.now()}`, // Génère un ID unique
            user_id: userId,
            name: dogData.name || 'Mon chiot',
            breed: dogData.breed || '',
            birthdate: dogData.birthDate || null,
            sex: dogData.sex || 'unknown',
            photo_url: dogData.photo_url || null,
            situation: userData?.situation || dogData.situation || '',
            created_at: new Date().toISOString(),
          },
        ]);

      if (error) {
        console.warn('⚠️ Could not save dog info:', error);
        // Ne pas bloquer l'authentification si ça échoue
      } else {
        console.log('✅ Dog info saved successfully');
      }
    } catch (err) {
      console.warn('⚠️ Error saving dog info:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('🔵 Starting Google Sign In...');

      // Appeler signInWithOAuth pour obtenir l'URL
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'pupytracker://',
          skipBrowserRedirect: true, // On ouvre le navigateur manuellement
        },
      });

      if (error) {
        console.error('❌ Google OAuth error:', error);
        onError?.(error);
        setLoading(false);
        return;
      }

      if (data?.url) {
        console.log('✅ Google OAuth URL generated, opening browser...');
        
        // Ouvrir le navigateur avec l'URL OAuth
        const result = await WebBrowser.openBrowserAsync(data.url);
        
        console.log('🌐 Browser closed with result:', result.type);

        // Petit délai pour que Supabase récupère les credentials
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Sauvegarder les infos du chien
        if (data?.user?.id) {
          await saveDogInfo(data.user.id);
        }

        // Rafraîchir les infos du chien dans le context
        if (refreshDogs) {
          console.log('🔄 Refreshing dogs after Google Sign In...');
          await refreshDogs();
        }

        // Marquer que le paywall doit être affiché
        await AsyncStorage.setItem('show_paywall_on_login', 'true');
        
        console.log('✅ Google Sign In - calling onSuccess');
        onSuccess?.();
      } else {
        console.error('❌ No URL returned from Google OAuth');
        Alert.alert('Erreur', 'Impossible de récupérer l\'URL Google');
      }
    } catch (error) {
      console.error('❌ Google Sign In error:', error);
      Alert.alert('Erreur', error.message || 'Impossible de se connecter avec Google');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleGoogleSignIn}
      disabled={loading}
      style={{
        paddingVertical: spacing.base,
        paddingHorizontal: spacing.base,
        borderRadius: borderRadius.xl,
        backgroundColor: '#4285F4',
        alignItems: 'center',
        marginBottom: spacing.md,
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text
          style={{
            fontSize: typography.sizes.lg,
            fontWeight: '600',
            color: '#FFFFFF',
          }}
        >
          🔵 Continuer avec Google
        </Text>
      )}
    </TouchableOpacity>
  );
};

GoogleSignInButton.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  dogData: PropTypes.object,
  userData: PropTypes.object,
  refreshDogs: PropTypes.func,
};

export default GoogleSignInButton;
