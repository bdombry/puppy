import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  View,
  Text,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { onboardingStyles } from '../../styles/onboardingStyles';
import OnboardingHeader from '../OnboardingHeader';
import FormInput from '../FormInput';
import AuthButton from '../AuthButton';
import BackButton from '../BackButton';
import { EMOJI } from '../../constants/config';

export default function DogSetupScreen() {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { saveDog } = useAuth();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Le nom du chiot est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const dogData = {
        name,
        breed: breed || null,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
      };

      await saveDog(dogData);

      Alert.alert('Succès', 'Votre chiot a été enregistré ! 🎉', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Erreur',
        "Impossible d'enregistrer le chiot. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={onboardingStyles.container}
      contentContainerStyle={onboardingStyles.scrollContent}
      scrollEnabled={false}
    >
      <BackButton onPress={() => navigation.navigate('Auth')} />

      <OnboardingHeader
        icon={EMOJI.dog}
        title="Parlez-nous de votre chiot"
        subtitle="Ces informations nous aideront à suivre sa croissance"
      />

      <View style={onboardingStyles.form}>
        <FormInput
          label="Nom du chiot *"
          placeholder="Ex: Max"
          value={name}
          onChangeText={setName}
        />

        <FormInput
          label="Race (optionnel)"
          placeholder="Ex: Golden Retriever"
          value={breed}
          onChangeText={setBreed}
        />

        <View style={onboardingStyles.formGroup}>
          <Text style={onboardingStyles.label}>Date de naissance (optionnel)</Text>
          <TouchableOpacity
            style={onboardingStyles.dateInput}
            onPress={() => setShowPicker(true)}
          >
            <Text style={onboardingStyles.dateText}>
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
      </View>

      <AuthButton
        type="primary"
        label={`C'est parti ! ${EMOJI.party}`}
        onPress={handleSave}
        loading={loading}
      />
    </ScrollView>
  );
}

DogSetupScreen.propTypes = {
  navigation: PropTypes.object,
};
