import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AppleAuthentication from 'expo-apple-authentication';

const AuthScreen = ({ navigation }) => {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Handle Email Login
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      // ✅ Utiliser le contexte AuthContext (pas d'appel Supabase direct)
      // Cela synchronise correctement le state user/loading/dogs
      const user = await signInWithEmail(email, password);
      
      // Marquer l'onboarding comme complété (utilisateur existant qui se reconnecte)
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log('✅ Connecté avec:', user.email);
    } catch (err) {
      let message = err.message;
      
      if (err.message?.includes('Invalid login credentials')) {
        message = 'Email ou mot de passe incorrect';
      } else if (err.message?.includes('Email not confirmed')) {
        message = 'Veuillez confirmer votre email avant de vous connecter';
      } else if (err.message?.includes('User not found')) {
        message = 'Cet email n\'existe pas';
      }
      
      Alert.alert('Erreur de connexion', message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Sign In (LOGIN ONLY - ne crée jamais de compte)
  const handleAppleLogin = async () => {
    setLoading(true);
    try {
      // 1. Vérifier disponibilité
      const available = await AppleAuthentication.isAvailableAsync();
      if (!available) {
        Alert.alert('Erreur', 'La connexion Apple n\'est pas disponible sur cet appareil');
        return;
      }

      // 2. Demander les credentials Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Aucun token Apple reçu');
      }

      // 3. Connexion via Supabase
      // ⚠️ signInWithIdToken déclenche onAuthStateChange → AuthScreen va se démonter
      // On doit juste lancer le login et laisser le contexte gérer le reste
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        Alert.alert('Erreur de connexion', error.message);
        return;
      }

      // 4. Marquer l'onboarding comme complété IMMÉDIATEMENT
      // (avant que onAuthStateChange ne démonte ce composant)
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      console.log('✅ Apple login réussi, le contexte prend le relais');
      
      // Le onAuthStateChange dans AuthContext va:
      // - setUser() → App.js détecte le user
      // - loadUserDog() → charge les chiens
      // - Si pas de chien, le fallback DogSetup s'affiche (ajouté dans App.js)
    } catch (error) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        console.log('👋 Apple Sign In annulé par l\'utilisateur');
      } else {
        console.error('❌ Apple login error:', error);
        Alert.alert('Erreur', 'Impossible de se connecter avec Apple');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://pupytracker.app/reset-password',
      });

      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        Alert.alert(
          'Email envoyé ✓',
          'Vérifiez votre boîte mail. Vous recevrez un lien pour réinitialiser votre mot de passe.'
        );
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Back Button - masqué car on est sur l'écran principal d'auth */}
        {/* <View style={{ paddingHorizontal: spacing.base, paddingVertical: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: typography.sizes.xl, color: colors.primary }}>← Retour</Text>
          </TouchableOpacity>
        </View> */}

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Mascotte */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 100 }}>🔐</Text>
          </View>

          {/* Headline */}
          <Text
            style={{
              fontSize: typography.sizes.xxxl,
              fontWeight: '700',
              color: colors.pupyTextPrimary,
              textAlign: 'center',
              marginBottom: spacing.md,
              lineHeight: 36,
            }}
          >
            Se connecter
          </Text>

          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.pupyTextSecondary,
              textAlign: 'center',
              marginBottom: spacing.xxl,
              lineHeight: 20,
            }}
          >
            Retrouvez votre compte PupyTracker
          </Text>

          {/* Apple Sign In Button (iOS only, login only) */}
          {Platform.OS === 'ios' && (
            <>
              <TouchableOpacity
                onPress={handleAppleLogin}
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
                    🍎 Se connecter avec Apple
                  </Text>
                )}
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.pupyBorder }} />
                <Text style={{ marginHorizontal: spacing.md, color: colors.pupyTextSecondary, fontSize: typography.sizes.sm }}>ou</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.pupyBorder }} />
              </View>
            </>
          )}

          {/* Email Input */}
          <TextInput
            placeholder="Votre email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
            style={{
              borderWidth: 1,
              borderColor: colors.pupyAccent,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.base,
              paddingVertical: spacing.md,
              marginBottom: spacing.md,
              fontSize: typography.sizes.base,
              color: colors.pupyTextPrimary,
            }}
            placeholderTextColor={colors.pupyTextSecondary}
          />

          {/* Password Input */}
          <View style={{ position: 'relative', marginBottom: spacing.xl }}>
            <TextInput
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              style={{
                borderWidth: 1,
                borderColor: colors.pupyAccent,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.md,
                paddingRight: spacing.xxxl,
                fontSize: typography.sizes.base,
                color: colors.pupyTextPrimary,
              }}
              placeholderTextColor={colors.pupyTextSecondary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: spacing.md,
                top: '50%',
                transform: [{ translateY: -12 }],
              }}
            >
              <Text style={{ fontSize: 20 }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity 
            onPress={handleForgotPassword}
            disabled={loading}
            style={{ marginBottom: spacing.xl, alignItems: 'center' }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.primary,
                fontWeight: '600',
                textDecorationLine: 'underline',
              }}
            >
              Mot de passe oublié?
            </Text>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Onboarding1')}
            style={{ marginBottom: spacing.xl, alignItems: 'center' }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.primary,
                fontWeight: '600',
                textDecorationLine: 'underline',
              }}
            >
              ✨ Créer un compte
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Fixed Bottom Section */}
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
          <TouchableOpacity
            style={{
              backgroundColor: loading ? colors.pupyAccent : colors.primary,
              paddingVertical: spacing.base,
              paddingHorizontal: spacing.base,
              borderRadius: borderRadius.xl,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={handleEmailLogin}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator color={colors.white} size="small" style={{ marginRight: spacing.sm }} />
                <Text
                  style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: '600',
                    color: colors.white,
                  }}
                >
                  Connexion...
                </Text>
              </>
            ) : (
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                  color: colors.white,
                }}
              >
                ✓ Se connecter
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthScreen;