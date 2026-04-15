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
  const { beginSignup, completeSignup, cancelSignup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [useEmailSignup, setUseEmailSignup] = useState(false);

  // Handle Email Signup - 2 PHASES
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
      // ══════════════════════════════════════════════════
      // PHASE 1: Création du compte + données + vérification
      // ══════════════════════════════════════════════════
      console.log('📝 PHASE 1: Création du compte...');
      setStatusMessage('Création du compte...');

      // Activer la garde: onAuthStateChange ne naviguera PAS
      beginSignup();

      // 1a. Créer le compte Supabase
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError) {
        let message = signupError.message;
        if (signupError.message.includes('already registered')) {
          message = 'Cet email est déjà utilisé';
        }
        throw new Error(message);
      }

      const userId = signupData.user?.id;
      if (!userId) throw new Error('Pas d\'identifiant utilisateur retourné');
      console.log('✅ Compte créé, userId:', userId);

      // ⚠️ CRITICAL: Délai pour que la session Supabase soit appliquée
      // Sinon, RLS policies voient auth.uid() = NULL et bloquent les inserts
      console.log('⏳ Attente de la session Supabase (RLS check)...');
      await new Promise(r => setTimeout(r, 500));

      // 1b. Créer le profil utilisateur
      setStatusMessage('Configuration du profil...');
      console.log('📝 Création du profil...', JSON.stringify(userData));
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: userId,
          first_name: userData.name || '',
          age_range: userData.ageRange || null,
          gender: userData.gender || null,
          family_situation: userData.situation || null,
          user_problems: JSON.stringify(userData.problems || []),
          app_source: userData.app_source || null,
        }], { onConflict: 'id' })
        .select();

      if (profileError) {
        console.error('❌ Erreur profil (BLOCKING):', profileError);
        throw new Error('Profile creation failed: ' + (profileError.message || JSON.stringify(profileError)));
      } else {
        console.log('✅ Profil créé');
      }

      // 1c. Créer le chien
      setStatusMessage('Ajout de votre chien...');
      console.log('🐕 Création du chien...', JSON.stringify(dogData));
      
      // ⚠️ VALIDATION: Le nom du chien est requis!
      if (!dogData.name || dogData.name.trim() === '') {
        throw new Error('Le nom du chien est requis');
      }
      
      // Mapper le sexe en anglais pour l'enum Supabase
      let mappedSex = 'unknown';
      if (dogData.sex === 'Mâle') mappedSex = 'male';
      else if (dogData.sex === 'Femelle') mappedSex = 'female';
      else if (['male', 'female', 'unknown'].includes(dogData.sex)) mappedSex = dogData.sex;

      const { data: dogResult, error: dogError } = await supabase
        .from('Dogs')
        .insert([{
          user_id: userId,
          name: dogData.name,
          breed: dogData.breed || '',
          birth_date: dogData.birthDate || null,
          sex: mappedSex,
          photo_url: dogData.photo || dogData.photo_url || null,
        }])
        .select();

      if (dogError) {
        throw new Error('Erreur création du chien: ' + dogError.message);
      }
      console.log('✅ Chien créé:', dogResult?.[0]?.id, dogResult?.[0]?.name);

      // 1d. Vérification: le chien existe bien en BD
      setStatusMessage('Vérification...');
      const { data: verifyDog, error: verifyError } = await supabase
        .from('Dogs')
        .select('id, name')
        .eq('user_id', userId)
        .limit(1);

      if (verifyError || !verifyDog || verifyDog.length === 0) {
        throw new Error('Vérification échouée: chien non trouvé en base de données');
      }
      console.log('✅ PHASE 1 TERMINÉE: chien vérifié -', verifyDog[0].name);

      // ══════════════════════════════════════════════════
      // PHASE 2: Connexion → navigation automatique
      // ══════════════════════════════════════════════════
      console.log('🔗 PHASE 2: Connexion...');
      setStatusMessage('Connexion...');

      // ⚠️ IMPORTANT: NE PAS poser onboardingCompleted ici!
      // Il sera posé par RevenueCatPaywall après completeSignup()
      // Sinon le Stack.Group 1 se ferme et RevenueCatPaywall ne s'affiche pas
      
      setStatusMessage('Affichage de l\'offre...');
      
      console.log('✅ PHASE 1 & 2 TERMINÉE: navigation vers paywall');
      // Ajouter un petit délai pour que React ait le temps de re-rendre et ajouter RevenueCatPaywall
      setTimeout(() => {
        navigation.replace('RevenueCatPaywall');
      }, 100);

    } catch (err) {
      console.error('❌ Signup error:', err.message);
      
      // ⚠️ DANGER: Si erreur APRÈS auth.signUp(), l'utilisateur est créé mais orphelin!
      // Il faut nettoyer manuellement ou logger l'erreur
      if (err.message.includes('Erreur création du chien') || err.message.includes('Vérification échouée')) {
        console.error('🚨 CRITICAL: User created but dog missing! Check Supabase for orphaned users');
        Alert.alert(
          'Erreur critique',
          'Votre compte a été créé mais il y a eu un problème lors de l\'ajout de votre chien. Veuillez contacter support@pupytracker.app si le problème persiste.'
        );
      } else {
        Alert.alert('Erreur de création', err.message);
      }
      
      cancelSignup();
      setStatusMessage('');
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
                  onSuccess={() => {
                    console.log('✅ Apple Sign In successful - navigation handled by App.js');
                  }}
                  onError={(err) => {
                    console.error('❌ Apple Sign In error in CreateAccountScreen:', err);
                    const errorMessage = err?.message || 'Erreur de connexion Apple';
                    Alert.alert('❌ Connexion Apple échouée', errorMessage, [
                      { text: 'OK', onPress: () => console.log('Error dismissed') }
                    ]);
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
                    {statusMessage || 'Création...'}
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
