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
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { supabase } from '../../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DogProfileScreen() {
  const { currentDog, isGuestMode, user, setCurrentDog } = useAuth();
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

      if (isGuestMode) {
        // Mode invité
        const guestData = await AsyncStorage.getItem('guestMode');
        const parsed = JSON.parse(guestData);
        parsed.dog = { ...parsed.dog, ...dogData };
        await AsyncStorage.setItem('guestMode', JSON.stringify(parsed));
        setCurrentDog(parsed.dog);
      } else {
        // Mode connecté
        const { data, error } = await supabase
          .from('Dogs')
          .update(dogData)
          .eq('id', currentDog.id)
          .select()
          .single();

        if (error) throw error;
        setCurrentDog(data);
      }

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
              if (isGuestMode) {
                // Reset mode invité
                await AsyncStorage.removeItem('guestMode');
                await AsyncStorage.removeItem('guestWalks');
                navigation.replace('Auth');
              } else {
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
              }
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
          <Text style={styles.emptyIcon}>🐶</Text>
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
            <Text style={styles.avatarEmoji}>🐶</Text>
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
    padding: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 32,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarEmoji: {
    fontSize: 64,
  },
  editButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  form: {
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  valueText: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
    paddingVertical: 8,
  },
  ageText: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
    marginTop: 4,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  actions: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  buttonSecondaryText: {
    color: '#6b7280',
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDanger: {
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  buttonDangerText: {
    color: '#ef4444',
    fontSize: 17,
    fontWeight: '700',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
  },
});