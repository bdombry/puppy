import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import { useAuth } from '../../context/AuthContext';

const DogBirthdateScreen = ({ navigation, route }) => {
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const dogData = route?.params?.dogData || {};
  const { saveDog } = useAuth();

  const handleSave = async () => {
    if (!birthDate) {
      Alert.alert('Erreur', 'La date de naissance est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const completeData = {
        name: dogData.name,
        breed: dogData.breed,
        sex: dogData.sex,
        birth_date: birthDate.toISOString().split('T')[0],
      };

      await saveDog(completeData);
      // Naviguer vers DogPhotoScreen pour ajouter une photo
      navigation.navigate('DogPhotoScreen', { dogData: completeData });
    } catch (error) {
      console.error('Erreur saveDog:', error);
      Alert.alert(
        'Erreur',
        error?.message || "Impossible d'enregistrer le chien. Veuillez réessayer."
      );
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
          <OnboardingProgressBar current={9} total={10} />
        </View>

        {/* Navigation Buttons */}
        <OnboardingNavigation 
          current={9}
          total={10}
          onPrev={() => navigation.goBack()} 
          onNext={handleSave}
          disablePrev={false}
          disableNext={!birthDate || loading}
        />

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Mascotte */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 80 }}>🎂</Text>
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
            Quelle est la date de naissance ?
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
            Nous suivrons sa croissance
          </Text>

          {/* Date Picker */}
          <View style={{ marginTop: spacing.lg }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.white,
                borderRadius: borderRadius.lg,
                padding: spacing.base,
                borderWidth: 1,
                borderColor: birthDate ? colors.primary : colors.pupyBorder,
                alignItems: 'center',
              }}
              onPress={() => setShowPicker(true)}
            >
              <Text
                style={{
                  fontSize: typography.sizes.lg,
                  fontWeight: '600',
                  color: birthDate ? colors.primary : colors.pupyTextSecondary,
                }}
              >
                {birthDate ? birthDate.toLocaleDateString('fr-FR') : 'Sélectionnez la date'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowPicker(Platform.OS === 'ios');
                  if (selectedDate) setBirthDate(selectedDate);
                }}
              />
            )}
          </View>

          {/* Summary */}
          {birthDate && (
            <View style={{ marginTop: spacing.xl, backgroundColor: colors.primaryLight, borderRadius: borderRadius.lg, padding: spacing.base }}>
              <Text
                style={{
                  fontSize: typography.sizes.base,
                  color: colors.primary,
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                ✓ {dogData.name} • {dogData.breed} • {dogData.sex === 'male' ? '♂️' : '♀️'} • {birthDate.toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        </ScrollView>

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

export default DogBirthdateScreen;
