import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import { supabase } from '../../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WalkScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog, user, isGuestMode } = useAuth();
  
  // Type: 'incident' ou 'walk'
  const eventType = route.params?.type || 'walk';
  const isIncident = eventType === 'incident';

  const [pee, setPee] = useState(false);
  const [poop, setPoop] = useState(false);
  const [treat, setTreat] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveGuestWalk = async (walk) => {
    try {
      const existing = await AsyncStorage.getItem('guestWalks');
      const walks = existing ? JSON.parse(existing) : [];
      walks.push({ id: Date.now(), ...walk });
      await AsyncStorage.setItem('guestWalks', JSON.stringify(walks));
    } catch (err) {
      console.log('Erreur stockage invité:', err);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!pee && !poop) {
      Alert.alert(
        'Attention',
        'Coche au moins une option (pipi ou caca) 💧💩'
      );
      return;
    }

    setLoading(true);
    try {
      let locationData = null;
      if (locationEnabled) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          locationData = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          };
        }
      }

      // Automatique : incident = inside, sortie = outside
      const location = isIncident ? 'inside' : 'outside';

      const walkData = {
        dog_id: currentDog.id,
        user_id: user?.id || null,
        datetime: new Date().toISOString(),
        pee,
        pee_location: pee ? location : null,
        poop,
        poop_location: poop ? location : null,
        treat,
        location: locationData,
      };

      if (isGuestMode) {
        await saveGuestWalk(walkData);
        Alert.alert(
          '✅ Enregistré !',
          isIncident
            ? "L'incident a été noté."
            : 'La sortie a été notée.'
        );
      } else {
        const { error } = await supabase.from('outings').insert([walkData]);
        if (error) throw error;
        Alert.alert(
          '✅ Enregistré !',
          isIncident
            ? "L'incident a été synchronisé."
            : 'La sortie a été synchronisée.'
        );
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        {/* HEADER */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: isIncident ? '#fef2f2' : '#f0fdf4',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 48 }}>
              {isIncident ? '⚠️' : '🌳'}
            </Text>
          </View>

          <Text style={styles.title}>
            {isIncident ? 'Incident à la maison' : 'Sortie réussie'}
          </Text>
          <Text style={styles.subtitle}>
            {isIncident
              ? `Qu'a fait ${currentDog?.name} à l'intérieur ?`
              : `Qu'a fait ${currentDog?.name} dehors ?`}
          </Text>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          {/* PIPI */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              pee && (isIncident ? styles.optionCardActiveRed : styles.optionCardActiveGreen),
            ]}
            onPress={() => setPee(!pee)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  pee && (isIncident ? styles.checkboxActiveRed : styles.checkboxActiveGreen),
                ]}
              >
                {pee && <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💧 Pipi</Text>
                <Text style={styles.optionHint}>
                  {isIncident ? 'À l\'intérieur' : 'À l\'extérieur'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* CACA */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              poop && (isIncident ? styles.optionCardActiveRed : styles.optionCardActiveGreen),
            ]}
            onPress={() => setPoop(!poop)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  poop && (isIncident ? styles.checkboxActiveRed : styles.checkboxActiveGreen),
                ]}
              >
                {poop && <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💩 Caca</Text>
                <Text style={styles.optionHint}>
                  {isIncident ? 'À l\'intérieur' : 'À l\'extérieur'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* FRIANDISE (seulement pour sortie) */}
          {!isIncident && (
            <TouchableOpacity
              style={[
                styles.optionCard,
                treat && styles.optionCardActivePurple,
              ]}
              onPress={() => setTreat(!treat)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.checkbox,
                    treat && styles.checkboxActivePurple,
                  ]}
                >
                  {treat && <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>🍬 Friandise</Text>
                  <Text style={styles.optionHint}>Récompense donnée</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* LOCALISATION */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              locationEnabled && styles.optionCardActiveBlue,
            ]}
            onPress={() => setLocationEnabled(!locationEnabled)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  locationEnabled && styles.checkboxActiveBlue,
                ]}
              >
                {locationEnabled && <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>📍 Localisation</Text>
                <Text style={styles.optionHint}>Enregistrer la position GPS</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#6366f1"
            style={{ marginTop: 24 }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={[
                GlobalStyles.buttonPrimary,
                styles.fullWidth,
                { backgroundColor: isIncident ? '#ef4444' : '#10b981' },
              ]}
              onPress={handleSave}
            >
              <Text style={GlobalStyles.buttonPrimaryText}>
                {isIncident ? '✅ Enregistrer l\'incident' : '✅ Enregistrer la sortie'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, styles.fullWidth]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionCardActiveGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  optionCardActiveRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  optionCardActivePurple: {
    backgroundColor: '#faf5ff',
    borderColor: '#8b5cf6',
  },
  optionCardActiveBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxActiveGreen: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxActiveRed: {
    backgroundColor: '#ef4444',
    borderColor: '#ef4444',
  },
  checkboxActivePurple: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  checkboxActiveBlue: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionLabel: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '700',
    marginBottom: 2,
  },
  optionHint: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  fullWidth: {
    width: '100%',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});