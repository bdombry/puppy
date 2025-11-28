import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMOJI } from '../../constants/config';

export default function DogProfileScreen() {
  const { currentDog, user, setCurrentDog } = useAuth();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentDog?.name || '');
  const [breed, setBreed] = useState(currentDog?.breed || '');
  const [birthDate, setBirthDate] = useState(
    currentDog?.birth_date ? new Date(currentDog.birth_date) : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const getDogAge = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    const months = ageDate.getUTCMonth() + ageDate.getUTCFullYear() * 12 - 12 * 1970;
    if (months < 1) return "moins d'un mois";
    if (months === 1) return '1 mois';
    return `${months} mois`;
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom du chiot est obligatoire');
      return;
    }

    setLoading(true);
    try {
      const dogData = {
        name: name.trim(),
        breed: breed.trim() || null,
        birth_date: birthDate ? birthDate.toISOString().split('T')[0] : null,
      };

      const { data, error } = await supabase
        .from('Dogs')
        .update(dogData)
        .eq('id', currentDog.id)
        .select()
        .single();

      if (error) throw error;
      setCurrentDog(data);

      Alert.alert('✅ Succès', 'Les informations ont été mises à jour');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Erreur', "Impossible de sauvegarder les modifications");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '⚠️ Supprimer le profil',
      `Veux-tu vraiment supprimer le profil de ${currentDog?.name} ?\n\nToutes les données seront perdues.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Suppression en base
              // D'abord supprimer tous les outings
              await supabase
                .from('outings')
                .delete()
                .eq('dog_id', currentDog.id);

              // Puis supprimer le chien
              const { error } = await supabase
                .from('Dogs')
                .delete()
                .eq('id', currentDog.id);

              if (error) throw error;
              navigation.replace('DogSetup');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le profil');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    setName(currentDog?.name || '');
    setBreed(currentDog?.breed || '');
    setBirthDate(currentDog?.birth_date ? new Date(currentDog.birth_date) : null);
    setIsEditing(false);
  };

  if (!currentDog) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>{EMOJI.dog}</Text>
          <Text style={styles.emptyText}>Aucun chien enregistré</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Profil du chien</Text>

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>{EMOJI.dog}</Text>
          </View>
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✏️ Modifier</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Formulaire */}
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nom *</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ex: Max"
                editable={!loading}
              />
            ) : (
              <Text style={styles.valueText}>{currentDog.name}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Race</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={breed}
                onChangeText={setBreed}
                placeholder="Ex: Golden Retriever"
                editable={!loading}
              />
            ) : (
              <Text style={styles.valueText}>
                {currentDog.breed || 'Non renseignée'}
              </Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Date de naissance</Text>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowPicker(true)}
                  disabled={loading}
                >
                  <Text style={styles.dateButtonText}>
                    {birthDate
                      ? birthDate.toLocaleDateString('fr-FR')
                      : 'Sélectionner une date'}
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
              </>
            ) : (
              <View>
                <Text style={styles.valueText}>
                  {currentDog.birth_date
                    ? new Date(currentDog.birth_date).toLocaleDateString('fr-FR')
                    : 'Non renseignée'}
                </Text>
                {currentDog.birth_date && (
                  <Text style={styles.ageText}>
                    {getDogAge(currentDog.birth_date)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Boutons d'action */}
        {isEditing ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.buttonPrimaryText}>
                {loading ? 'Enregistrement...' : '✅ Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.buttonSecondaryText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleDelete}
          >
            <Text style={styles.buttonDangerText}>🗑️ Supprimer le profil</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: spacing.lg,
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.gray900,
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLighter,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.large,
  },
  avatarEmoji: {
    fontSize: 64,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.full,
    ...shadows.base,
  },
  editButtonText: {
    color: '#fff',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  form: {
    marginBottom: spacing.xxxl,
  },
  formGroup: {
    marginBottom: spacing.xxxl,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.gray700,
    marginBottom: spacing.base,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: typography.sizes.base,
    color: colors.gray900,
    fontWeight: typography.weights.normal,
  },
  valueText: {
    fontSize: typography.sizes.lg,
    color: colors.gray900,
    fontWeight: typography.weights.bold,
    paddingVertical: spacing.base,
  },
  ageText: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginTop: spacing.base,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  dateButtonText: {
    fontSize: typography.sizes.base,
    color: colors.gray700,
  },
  actions: {
    gap: spacing.base,
  },
  button: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.base,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  buttonSecondaryText: {
    color: colors.gray600,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonDanger: {
    backgroundColor: colors.errorLight,
    borderWidth: 2,
    borderColor: colors.error,
  },
  buttonDangerText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.gray600,
    textAlign: 'center',
  },
});