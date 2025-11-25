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
import { GlobalStyles } from '../../styles/global'; // import GlobalStyles

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
      style={styles.container}
      contentContainerStyle={[styles.content, GlobalStyles.safeArea]}
    >
      {/* Bouton retour */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.icon}>🐶</Text>
      <Text style={styles.title}>Parlez-nous de votre chiot</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nom du chiot *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Max"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Race (optionnel)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Golden Retriever"
          value={breed}
          onChangeText={setBreed}
        />

        <Text style={styles.label}>Date de naissance (optionnel)</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>
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

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        <Text style={styles.buttonText}>C'est parti ! 🎉</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 24, alignItems: 'center' },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
  },
  icon: { fontSize: 64, marginTop: 16, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: 32 },
  form: { width: '100%', marginBottom: 32 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  dateInput: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateText: { fontSize: 16, color: '#374151' },
  button: { backgroundColor: '#6366f1', padding: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});
