import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppleSignInButton from '../buttons/AppleSignInButton';
// import GoogleSignInButton from '../buttons/GoogleSignInButton'; // TODO: Réactiver plus tard

/**
 * CreateAccountScreen
 * 
 * Écran de création de compte après l'onboarding.
 * L'utilisateur peut se créer un compte via:
 * - Apple
 * - Google  
 * - Email + Mdp
 * 
 * Après création, navigue vers le paywall.
 */
const CreateAccountScreen = ({ navigation, route }) => {
  const dogData = route?.params?.dogData || {};
  const userData = route?.params?.userData || {};
  const { refreshDogs } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useEmailSignup, setUseEmailSignup] = useState(false);

  // Sauvegarde les infos de l'utilisateur dans la table profiles
  const saveUserInfo = async (userId) => {
    try {
      console.log('💾 saveUserInfo called with userId:', userId);
      console.log('   userData:', userData);

      const firstName = userData?.name || '';
      const ageRange = userData?.ageRange || null;
      const gender = userData?.gender || null;
      const situation = userData?.situation || null;

      const { error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            first_name: firstName,
            age_range: ageRange,
            gender: gender,
            family_situation: situation,
          },
        ])
        .select();

      if (error) {
        console.error('❌ Could not save user info:', error);
        console.error('   Error details:', error.message, error.code);
        // Ne pas bloquer la création du compte si ça échoue
        return false;
      } else {
        console.log('✅ User info saved to profiles table');
        return true;
      }
    } catch (err) {
      console.error('❌ Error saving user info:', err);
      // Ne pas bloquer la création du compte si ça échoue
      return false;
    }
  };

  // Sauvegarde les infos du chien après création du compte
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
            id: `${userId}-${Date.now()}`, // Génère un ID unique
            user_id: userId,
            name: dogName,
            breed: breed,
            birthdate: birthDate,
            sex: sex,
            photo_url: photoUrl,
            situation: situation,
            created_at: new Date().toISOString(),
          },
        ])
        .select(); // Récupère les données créées

      if (error) {
        console.error('❌ Could not save dog info:', error);
        console.error('   Error details:', error.message, error.code);
        // Ne pas bloquer la création du compte si ça échoue
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

  // Handle Email Signup
  const handleEmailSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Starting email signup...');
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        let message = error.message;
        
        if (error.message.includes('already registered')) {
          message = 'Cet email est déjà utilisé';
        } else if (error.message.includes('Password')) {
          message = error.message;
        }
        
        console.error('❌ Signup error:', message);
        Alert.alert('Erreur de création', message);
      } else {
        const userId = data?.user?.id;
        console.log('✅ User created with ID:', userId);
        
        if (!userId) {
          Alert.alert('Erreur', 'Impossible de créer le compte');
          setLoading(false);
          return;
        }
        
        // Sauvegarder les infos de l'utilisateur
        console.log('👤 Saving user info...');
        await saveUserInfo(userId);
        
        // Sauvegarder les infos du chien - CRUCIAL
        console.log('🐕 Saving dog info...');
        const dogCreated = await saveDogInfo(userId);
        
        if (!dogCreated) {
          console.warn('⚠️ Dog creation may have failed, but continuing...');
        }
        
        // Attendre que les données soient persistées et synchro
        console.log('⏳ Waiting for data sync...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Forcer le rechargement du chien dans le context
        console.log('🔄 Refreshing dogs...');
        if (refreshDogs) {
          await refreshDogs();
          console.log('✅ Dogs refreshed');
        }
        
        // Marquer que le paywall doit être affiché
        console.log('📋 Setting paywall flag...');
        await AsyncStorage.setItem('show_paywall_on_login', 'true');
        
        // L'app va se re-render et montrer le paywall automatiquement
        console.log('✅ Email signup complete - App will navigate to paywall');
        setLoading(false);
      }
    } catch (err) {
      console.error('❌ Email signup exception:', err);
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Apple Sign In
  const handleAppleSignIn = async () => {
    try {
      console.log('🍎 Starting Apple Sign In...');
      // Le bouton AppleSignInButton va gérer la logique
      // On suppose qu'il navigue après connexion
      // Marquer le paywall
      await AsyncStorage.setItem('show_paywall_on_login', 'true');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    try {
      console.log('🔵 Starting Google Sign In...');
      // Le bouton GoogleSignInButton va gérer la logique
      // On suppose qu'il navigue après connexion
      // Marquer le paywall
      await AsyncStorage.setItem('show_paywall_on_login', 'true');
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Icon */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl }}>
            <Text style={{ fontSize: 80 }}>🐕</Text>
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
            Créer un compte
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
            Pour accéder à tous les bénéfices premium
          </Text>

          {/* Social Sign In Buttons */}
          {!useEmailSignup && (
            <>
              {Platform.OS === 'ios' && (
                <AppleSignInButton 
                  dogData={dogData}
                  userData={userData}
                  refreshDogs={refreshDogs}
                  onSuccess={() => {
                    console.log('✅ Apple Sign In successful');
                    AsyncStorage.setItem('show_paywall_on_login', 'true');
                  }}
                  onError={(err) => {
                    Alert.alert('Erreur Apple', err.message);
                  }}
                />
              )}

              {/* TODO: Google Sign In - À activer plus tard */}
              {/* <GoogleSignInButton
                dogData={dogData}
                userData={userData}
                refreshDogs={refreshDogs}
                onSuccess={() => {
                  console.log('✅ Google Sign In successful');
                  AsyncStorage.setItem('show_paywall_on_login', 'true');
                }}
                onError={(err) => {
                  Alert.alert('Erreur Google', err.message);
                }}
              /> */}

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.pupyBorder }} />
                <Text style={{ marginHorizontal: spacing.md, color: colors.pupyTextSecondary }}>ou</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.pupyBorder }} />
              </View>

              {/* Switch to Email */}
              <TouchableOpacity 
                onPress={() => setUseEmailSignup(true)}
                style={{
                  paddingVertical: spacing.base,
                  paddingHorizontal: spacing.base,
                  borderRadius: borderRadius.xl,
                  borderWidth: 1,
                  borderColor: colors.pupyAccent,
                  alignItems: 'center',
                  marginBottom: spacing.xl,
                }}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.lg,
                    fontWeight: '600',
                    color: colors.primary,
                  }}
                >
                  ✉️ Créer avec email
                </Text>
              </TouchableOpacity>
            </>
          )}

          {/* Email Signup Form */}
          {useEmailSignup && (
            <>
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
                  paddingVertical: spacing.base,
                  fontSize: typography.sizes.base,
                  color: colors.pupyTextPrimary,
                  marginBottom: spacing.md,
                }}
                placeholderTextColor={colors.pupyTextSecondary}
              />

              {/* Password Input */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.pupyAccent,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.base,
                marginBottom: spacing.md,
              }}>
                <TextInput
                  placeholder="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.base,
                    fontSize: typography.sizes.base,
                    color: colors.pupyTextPrimary,
                  }}
                  placeholderTextColor={colors.pupyTextSecondary}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={{ fontSize: 18 }}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Confirm Password Input */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.pupyAccent,
                borderRadius: borderRadius.lg,
                paddingHorizontal: spacing.base,
                marginBottom: spacing.xl,
              }}>
                <TextInput
                  placeholder="Confirmer le mot de passe"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.base,
                    fontSize: typography.sizes.base,
                    color: colors.pupyTextPrimary,
                  }}
                  placeholderTextColor={colors.pupyTextSecondary}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Text style={{ fontSize: 18 }}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Back to Social */}
              <TouchableOpacity 
                onPress={() => setUseEmailSignup(false)}
                disabled={loading}
              >
                <Text
                  style={{
                    fontSize: typography.sizes.sm,
                    color: colors.primary,
                    fontWeight: '600',
                    textDecorationLine: 'underline',
                    marginBottom: spacing.xl,
                    textAlign: 'center',
                  }}
                >
                  ← Retour aux autres méthodes
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>

        {/* Fixed Bottom - Sign Up Button */}
        {useEmailSignup && (
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
              onPress={handleEmailSignup}
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
                    Création...
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
                  ✓ Créer mon compte
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateAccountScreen;
