import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { useAuth } from '../../context/AuthContext';

const DogPhotoScreen = ({ navigation, route }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const dogData = route?.params?.dogData || {};
  const { uploadDogPhoto } = useAuth();

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner une image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission refusée', 'Nous avons besoin de l\'accès à la caméra');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de prendre une photo');
    }
  };

  const handleSkip = async () => {
    // Passer directement à la sauvegarde sans photo
    setLoading(true);
    try {
      // La photo est optionnelle, donc on peut passer sans
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!photoUri) {
      Alert.alert('Erreur', 'Veuillez sélectionner une photo');
      return;
    }

    setLoading(true);
    try {
      await uploadDogPhoto(photoUri);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } catch (error) {
      console.error('Erreur upload photo:', error);
      Alert.alert('Erreur', 'Impossible de télécharger la photo');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Progress Bar - Top Fixed */}
        <View style={{ paddingHorizontal: spacing.base, marginTop: spacing.base, marginBottom: spacing.md }}>
          <OnboardingProgressBar current={10} total={10} />
        </View>

        {/* Navigation Buttons */}
        <OnboardingNavigation 
          current={10}
          total={10}
          onPrev={() => navigation.goBack()} 
          onNext={() => {}}
          disablePrev={false}
          disableNext={true}
        />

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Mascotte */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 80 }}>📸</Text>
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
            Photo de {dogData.name}
          </Text>

          <Text
            style={{
              fontSize: typography.sizes.base,
              color: colors.pupyTextSecondary,
              textAlign: 'center',
              marginBottom: spacing.lg,
              lineHeight: 20,
            }}
          >
            Ajoutez une belle photo de votre chien (optionnel)
          </Text>

          {/* Photo Preview or Placeholder */}
          <View style={{ marginTop: spacing.lg }}>
            {photoUri ? (
              <View style={{ position: 'relative' }}>
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: '100%',
                    height: 300,
                    borderRadius: borderRadius.lg,
                    backgroundColor: colors.white,
                  }}
                />
                <TouchableOpacity
                  onPress={() => setPhotoUri(null)}
                  style={{
                    position: 'absolute',
                    top: spacing.md,
                    right: spacing.md,
                    backgroundColor: colors.white,
                    borderRadius: 50,
                    width: 44,
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={{
                  width: '100%',
                  height: 300,
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.white,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: colors.pupyBorder,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 60, marginBottom: spacing.md }}>🐕</Text>
                <Text
                  style={{
                    fontSize: typography.sizes.base,
                    color: colors.pupyTextSecondary,
                    textAlign: 'center',
                  }}
                >
                  Pas de photo encore
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
            <TouchableOpacity
              onPress={handleTakePhoto}
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.base,
                paddingHorizontal: spacing.base,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.sm }}>📷</Text>
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                  color: colors.white,
                }}
              >
                Prendre une photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePickImage}
              disabled={loading}
              style={{
                backgroundColor: colors.white,
                borderRadius: borderRadius.lg,
                paddingVertical: spacing.base,
                paddingHorizontal: spacing.base,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: colors.primary,
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20, marginRight: spacing.sm }}>🖼️</Text>
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                  color: colors.primary,
                }}
              >
                Galerie
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Fixed Bottom Buttons */}
        <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base, gap: spacing.md }}>
          {photoUri ? (
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={{
                backgroundColor: loading ? colors.pupyAccent : colors.primary,
                paddingVertical: spacing.base,
                paddingHorizontal: spacing.base,
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
                    Sauvegarde...
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
                  ✓ Sauvegarder la photo
                </Text>
              )}
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={handleSkip}
            disabled={loading}
            style={{
              paddingVertical: spacing.base,
              paddingHorizontal: spacing.base,
              borderRadius: borderRadius.xl,
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
              Passer pour le moment →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Indicator */}
        {loading && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DogPhotoScreen;
