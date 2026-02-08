import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import FormInput from '../FormInput';

const DogRaceScreen = ({ navigation, route }) => {
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('male');
  const dogData = route?.params?.dogData || {};

  const handleNext = () => {
    if (breed.trim()) {
      navigation.navigate('DogBirthdateScreen', {
        dogData: {
          ...dogData,
          breed: breed.trim(),
          sex,
        }
      });
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
          <OnboardingProgressBar current={8} total={10} />
        </View>

        {/* Navigation Buttons */}
        <OnboardingNavigation 
          current={8}
          total={10}
          onPrev={() => navigation.goBack()} 
          onNext={handleNext}
          disablePrev={false}
          disableNext={!breed.trim()}
        />

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Mascotte */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 80 }}>🐾</Text>
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
            Quelle est la race et le sexe ?
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
            Cela nous aide à mieux comprendre {dogData.name}
          </Text>

          {/* Race Input */}
          <View style={{ marginTop: spacing.lg }}>
            <FormInput
              label="Race *"
              placeholder="Ex: Golden Retriever"
              value={breed}
              onChangeText={setBreed}
            />
          </View>

          {/* Sex Selection */}
          <View style={{ marginTop: spacing.lg }}>
            <Text
              style={{
                fontSize: typography.sizes.base,
                fontWeight: '600',
                color: colors.pupyTextPrimary,
                marginBottom: spacing.md,
              }}
            >
              Sexe *
            </Text>
            
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {[
                { value: 'male', label: 'Mâle', emoji: '♂️' },
                { value: 'female', label: 'Femelle', emoji: '♀️' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => setSex(option.value)}
                  style={{
                    flex: 1,
                    backgroundColor: sex === option.value ? colors.primary : colors.white,
                    borderRadius: borderRadius.lg,
                    padding: spacing.base,
                    borderWidth: sex === option.value ? 2 : 1,
                    borderColor: sex === option.value ? colors.primary : colors.pupyBorder,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 32, marginBottom: spacing.xs }}>{option.emoji}</Text>
                  <Text
                    style={{
                      fontSize: typography.sizes.lg,
                      fontWeight: '600',
                      color: sex === option.value ? colors.white : colors.pupyTextPrimary,
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DogRaceScreen;
