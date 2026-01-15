import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { screenStyles } from '../../styles/screenStyles';
import { GlobalStyles } from '../../styles/global';
import FormInput from '../FormInput';
import SexToggle from '../SexToggle';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { EMOJI } from '../../constants/config';

export default function AddDogScreen() {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('female');
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const navigation = useNavigation();

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Erreur', 'Le nom du chien est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const dogData = {
        name: name.trim(),
        sex,
        user_id: user.id,
      };

      // Ajouter breed seulement s'il y a une valeur
      if (breed && breed.trim()) {
        dogData.breed = breed.trim();
      }

      // Ajouter birth_date seulement s'il y a une valeur
      if (birthDate) {
        dogData.birth_date = birthDate.toISOString().split('T')[0];
      }

      console.log('🐕 Création du chien:', dogData);

      const { data, error } = await supabase
        .from('Dogs')
        .insert([dogData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur création chien:', error);
        throw error;
      }

      console.log('✅ Chien créé avec succès:', data);

      Alert.alert(
        '✅ Succès',
        `${name} a été ajouté à votre compte !`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      Alert.alert('Erreur', 'Impossible de créer le profil du chien');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Sélectionner une date';
    return date.toLocaleDateString('fr-FR');
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
        <Text style={screenStyles.screenTitle}>Ajouter un chien</Text>

        <View style={styles.form}>
          <FormInput
            label="Nom du chien"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Max, Luna..."
            required
          />

          <FormInput
            label="Race (optionnel)"
            value={breed}
            onChangeText={setBreed}
            placeholder="Ex: Labrador, Berger allemand..."
          />

          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Sexe</Text>
            <SexToggle value={sex} onValueChange={setSex} />
          </View>

          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Date de naissance (optionnel)</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {formatDate(birthDate)}
              </Text>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={birthDate || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          {Platform.OS === 'ios' && showPicker && (
            <TouchableOpacity
              style={styles.pickerValidateButton}
              onPress={() => setShowPicker(false)}
            >
              <Text style={styles.pickerValidateText}>Valider</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[screenStyles.button, screenStyles.buttonPrimary, { marginBottom: spacing.lg }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={screenStyles.buttonPrimaryText}>
              {loading ? 'Création...' : '🐕 Créer le profil'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[screenStyles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    marginBottom: spacing.xl,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  dateButtonText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.normal,
  },
  pickerValidateButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  pickerValidateText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  actions: {
    marginTop: spacing.xl,
  },
  cancelButton: {
    backgroundColor: colors.gray200,
  },
  cancelText: {
    color: colors.textSecondary,
    fontWeight: typography.weights.normal,
  },
});