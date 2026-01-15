import React, { useState } from 'react';
import {
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
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
import { useImageUpload } from '../../hooks/useImageUpload';

export default function AddDogScreen() {
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState('female');
  const [birthDate, setBirthDate] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const { user, dogs, saveDog } = useAuth();
  const { pickImage, uploadImage } = useImageUpload();
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
        photo_url: photoUrl,
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

      // ✅ Utiliser la fonction saveDog du contexte pour mettre à jour l'état
      await saveDog(dogData);

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
      Alert.alert('Erreur', error.message || 'Impossible de créer le profil du chien');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePhoto = async () => {
    const uri = await pickImage();
    if (uri) {
      setUploadingPhoto(true);
      try {
        // Créer un ID temporaire pour l'upload
        const tempId = 'temp_' + Date.now();
        const url = await uploadImage(uri, tempId);
        setPhotoUrl(url);
        Alert.alert('✅ Succès', 'Photo sélectionnée!');
      } catch (err) {
        console.error('Upload failed:', err);
        Alert.alert('Erreur', 'Impossible de sauvegarder la photo');
      } finally {
        setUploadingPhoto(false);
      }
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
        <View style={styles.headerContainer}>
          <Text style={screenStyles.screenTitle}>Ajouter un chien</Text>
          <Text style={styles.dogsCount}>
            Vous avez déjà {dogs.length} {dogs.length <= 1 ? 'chien' : 'chiens'}
          </Text>
        </View>

        {/* Section photo de profil */}
        <TouchableOpacity 
          onPress={handleChangePhoto}
          disabled={uploadingPhoto}
          style={styles.photoContainer}
        >
          {uploadingPhoto ? (
            <View style={styles.photoPlaceholder}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : photoUrl ? (
            <Image 
              source={{ uri: photoUrl }} 
              style={styles.photoPreview}
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderEmoji}>📷</Text>
              <Text style={styles.photoPlaceholderText}>Ajouter une photo</Text>
            </View>
          )}
        </TouchableOpacity>

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
  headerContainer: {
    marginBottom: spacing.xl,
  },
  dogsCount: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderEmoji: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  photoPlaceholderText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.small,
  },
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