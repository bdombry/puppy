import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import DOG_BREEDS from '../../constants/dogBreeds';

const Onboarding4Screen = ({ navigation, route }) => {
  const [breed, setBreed] = useState('');
  const [searchBreed, setSearchBreed] = useState('');

  const filteredBreeds = searchBreed.trim() === '' 
    ? DOG_BREEDS 
    : DOG_BREEDS.filter(b => b.toLowerCase().includes(searchBreed.toLowerCase()));

  const handleSelect = (selectedBreed) => {
    setBreed(selectedBreed);
    setSearchBreed('');
  };

  const handleContinue = () => {
    const dogData = {
      ...route.params?.dogData,
      breed,
    };
    navigation.navigate('Onboarding5', {
      dogData,
      userProblems: route.params?.userProblems || [],
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.navigate('Onboarding3')} />
        <OnboardingProgressBar percent={64} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>

        {/* Titre */}
        <Text style={{ fontSize: 34, fontWeight: '700', color: colors.black, marginBottom: spacing.xs, letterSpacing: -0.5 }}>
          Quelle est la
        </Text>
        <Text style={{ fontSize: 34, fontWeight: '700', color: colors.primary, marginBottom: spacing.lg, letterSpacing: -0.5 }}>
          race ?
        </Text>

        {/* Sous-titre */}
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 24 }}>
          Sélectionnez la race de votre chien
        </Text>

        {/* Barre de recherche */}
        <TextInput
          placeholder="Rechercher une race..."
          placeholderTextColor={colors.textTertiary}
          value={searchBreed}
          onChangeText={setSearchBreed}
          style={{
            backgroundColor: colors.pupyBackground,
            borderRadius: 10,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            color: colors.black,
            fontSize: 16,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.pupyBorder,
          }}
        />

        {/* Liste des races */}
        <ScrollView style={{ maxHeight: 320, backgroundColor: colors.pupyBackground, borderRadius: 10, borderWidth: 1, borderColor: colors.pupyBorder }} scrollEnabled={true} nestedScrollEnabled={true}>
          {filteredBreeds.map((b, index) => (
            <TouchableOpacity
              key={`${b}-${index}`}
              onPress={() => handleSelect(b)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: colors.pupyBorderLight,
                backgroundColor: breed === b ? colors.primaryLight : 'transparent',
              }}
            >
              <Text style={{ fontSize: 16, color: breed === b ? colors.primary : colors.black, fontWeight: breed === b ? '600' : '400' }}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Affichage race sélectionnée */}
        {breed && (
          <View style={{ backgroundColor: colors.pupyBackground, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: spacing.xs }}>Race sélectionnée</Text>
            <Text style={{ fontSize: 18, color: colors.primary, fontWeight: '600' }}>{breed}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bouton */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!breed}
          style={{
            paddingVertical: spacing.md,
            borderRadius: 10,
            backgroundColor: breed ? colors.primary : colors.disabled,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: colors.pureWhite, fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding4Screen;
