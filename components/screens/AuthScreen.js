import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }) => {
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
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        
        // Messages d'erreur plus clairs
        if (error.message.includes('Invalid login credentials')) {
          message = 'Email ou mot de passe incorrect';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Veuillez confirmer votre email avant de vous connecter';
        } else if (error.message.includes('User not found')) {
          message = 'Cet email n\'existe pas';
        }
        
        Alert.alert('Erreur de connexion', message);
      } else {
        // Connexion réussie
        await AsyncStorage.setItem('onboardingCompleted', 'true');
        // Marquer que le paywall doit être affiché
        await AsyncStorage.setItem('show_paywall_on_login', 'true');
        
        // Forcer un refresh du contexte d'authentification
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('✅ Connecté avec:', session.user.email);
          // L'AuthContext va détecter le changement automatiquement
        }
      }
    } catch (err) {
      Alert.alert('Erreur', err.message);
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
            onPress={async () => {
              // Réinitialiser l'onboarding
              await AsyncStorage.setItem('onboardingCompleted', 'false');
              console.log('✨ Onboarding réinitialisé - AppNavigator devrait se mettre à jour');
              // AppState listener dans App.js va détecter le changement
              // et AppNavigator va se re-render pour montrer Onboarding1
            }}
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