import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../context/AuthContext';

const AccessCodeScreen = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, currentDog } = useAuth();

  const handleValidateCode = async () => {
    if (!code.trim() || code.length < 6) {
      Alert.alert('Erreur', 'Veuillez entrer un code valide');
      return;
    }

    setLoading(true);
    try {
      // Chercher le chien avec ce code d'accès
      const { data: dogs, error: dogsError } = await supabase
        .from('Dogs')
        .select('*')
        .eq('access_code', code.toUpperCase())
        .single();

      if (dogsError || !dogs) {
        Alert.alert('Code invalide', 'Ce code n\'existe pas ou a expiré');
        setLoading(false);
        return;
      }

      // Ajouter l'utilisateur actuel comme collaborateur
      const { error: addError } = await supabase
        .from('dog_collaborators')
        .insert([{
          dog_id: dogs.id,
          user_id: user.id,
          role: 'collaborator',
        }]);

      if (addError) {
        Alert.alert('Erreur', 'Impossible d\'ajouter ce chien');
        setLoading(false);
        return;
      }

      Alert.alert('Succès! 🎉', `Vous avez accès à ${dogs.name}!`);
      
      // Retourner à l'écran précédent ou au home
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }, 1500);

    } catch (error) {
      console.error('Erreur validation code:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.base, marginBottom: spacing.md }}>
          <OnboardingProgressBar current={7} total={14} />
        </View>

        <OnboardingNavigation 
          current={7}
          total={14}
          onPrev={handleCancel} 
          onNext={() => {}}
          disablePrev={false}
          showNext={false}
        />

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 100 }}>🔐</Text>
          </View>

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
            Accéder avec un code
          </Text>

          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.pupyTextSecondary,
              textAlign: 'center',
              marginBottom: spacing.xl,
              lineHeight: 20,
            }}
          >
            Si quelqu'un partage un chien avec vous, entrez le code d'accès reçu
          </Text>

          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: borderRadius.lg,
              padding: spacing.base,
              marginBottom: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.pupyTextSecondary,
                marginBottom: spacing.sm,
              }}
            >
              Code d'accès
            </Text>
            <TextInput
              placeholder="Ex: ABC123XYZ789"
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholderTextColor={colors.pupyTextSecondary}
              maxLength={12}
              style={{
                fontSize: typography.sizes.lg,
                fontWeight: '600',
                color: colors.pupyTextPrimary,
                letterSpacing: 2,
                textAlign: 'center',
              }}
            />
          </View>

          <View
            style={{
              backgroundColor: colors.white,
              borderRadius: borderRadius.lg,
              padding: spacing.base,
              marginTop: spacing.lg,
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.sm,
                color: colors.pupyTextSecondary,
                lineHeight: 18,
              }}
            >
              💡 <Text style={{ fontWeight: '600' }}>Vous recevrez ce code de</Text>
              {'\n'}la personne qui partage le chien avec vous.
            </Text>
          </View>
        </ScrollView>

        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.md }}>
          <TouchableOpacity
            onPress={handleValidateCode}
            disabled={loading || !code.trim()}
            style={{
              backgroundColor: loading || !code.trim() ? colors.pupyAccent : colors.primary,
              paddingVertical: spacing.base,
              borderRadius: borderRadius.xl,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
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
                  Vérification...
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
                Valider le code
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCancel}
            disabled={loading}
            style={{
              paddingVertical: spacing.base,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: typography.sizes.lg,
                fontWeight: '600',
                color: colors.pupyTextSecondary,
              }}
            >
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AccessCodeScreen;
