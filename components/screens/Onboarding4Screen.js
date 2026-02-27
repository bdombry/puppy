import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../constants/theme';
import BackButton from '../BackButton';
import { OnboardingProgressBar } from '../OnboardingProgressBar';

const DOG_BREEDS = [
  'Labrador', 'Golden Retriever', 'Berger Allemand', 'Beagle', 'Bulldog',
  'Caniche', 'Rottweiler', 'Yorkshire Terrier', 'Chihuahua', 'Dachshund',
  'Boxer', 'Husky Sibérien', 'Cocker Spaniel', 'Schnauzer', 'Dalmatien',
  'Carlin', 'Boston Terrier', 'Cavalier King Charles', 'Shiba Inu', 'Akita',
  'Autre race'
].sort();

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
      onDogDataSelected: route.params?.onDogDataSelected,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.pupyBackground }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <BackButton onPress={() => navigation.goBack()} />
        <OnboardingProgressBar percent={64} />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>

        {/* Titre */}
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#000', marginBottom: spacing.xs, letterSpacing: -0.5 }}>
          Quelle est la
        </Text>
        <Text style={{ fontSize: 34, fontWeight: '700', color: '#007AFF', marginBottom: spacing.lg, letterSpacing: -0.5 }}>
          race ?
        </Text>

        {/* Sous-titre */}
        <Text style={{ fontSize: 16, color: '#666', marginBottom: spacing.lg, lineHeight: 24 }}>
          Sélectionnez la race de votre chien
        </Text>

        {/* Barre de recherche */}
        <TextInput
          placeholder="Rechercher une race..."
          placeholderTextColor="#999"
          value={searchBreed}
          onChangeText={setSearchBreed}
          style={{
            backgroundColor: '#f5f5f5',
            borderRadius: 10,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            color: '#000',
            fontSize: 16,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: '#e0e0e0',
          }}
        />

        {/* Liste des races */}
        <ScrollView style={{ maxHeight: 320, backgroundColor: '#f5f5f5', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' }} scrollEnabled={true} nestedScrollEnabled={true}>
          {filteredBreeds.map((b, index) => (
            <TouchableOpacity
              key={`${b}-${index}`}
              onPress={() => handleSelect(b)}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.md,
                borderBottomWidth: 1,
                borderBottomColor: '#e8e8e8',
                backgroundColor: breed === b ? '#e6f2ff' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 16, color: breed === b ? '#007AFF' : '#000', fontWeight: breed === b ? '600' : '400' }}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Affichage race sélectionnée */}
        {breed && (
          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: spacing.xs }}>Race sélectionnée</Text>
            <Text style={{ fontSize: 18, color: '#007AFF', fontWeight: '600' }}>{breed}</Text>
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
            backgroundColor: breed ? '#007AFF' : '#d0d0d0',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
            Continuer
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Onboarding4Screen;
