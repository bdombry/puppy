import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius } from '../../constants/theme';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { OnboardingNavigation } from '../OnboardingNavigation';
import FormInput from '../FormInput';

const DogSetupScreen = ({ navigation, route }) => {
  const [dogName, setDogName] = useState('');
  const [dogData, setDogData] = useState(route?.params?.dogData || {});

  const handleNext = () => {
    if (dogName.trim()) {
      navigation.navigate('DogRaceScreen', {
        dogData: {
          ...dogData,
          name: dogName,
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
          <OnboardingProgressBar current={7} total={10} />
        </View>

        {/* Navigation Buttons */}
        <OnboardingNavigation 
          current={7}
          total={10}
          onPrev={() => navigation.goBack()} 
          onNext={handleNext}
          disablePrev={false}
          disableNext={!dogName.trim()}
        />

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl }}
          scrollEventThrottle={16}
        >
          {/* Mascotte */}
          <View style={{ alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.lg }}>
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
            Comment s'appelle votre chien ?
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
            Commençons par le plus important
          </Text>

          {/* Input */}
          <View style={{ marginTop: spacing.lg }}>
            <FormInput
              label="Nom du chien *"
              placeholder="Ex: Max"
              value={dogName}
              onChangeText={setDogName}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DogSetupScreen;