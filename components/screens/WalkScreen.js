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
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export default function WalkScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog, user } = useAuth();
  
  // Type: 'incident' ou 'walk'
  const eventType = route.params?.type || 'walk';
  const isIncident = eventType === 'incident';

  const [pee, setPee] = useState(false);
  const [poop, setPoop] = useState(false);
  const [treat, setTreat] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const { error } = await supabase.from('outings').insert([walkData]);
      if (error) throw error;
      Alert.alert(
        '✅ Enregistré !',
        isIncident
          ? "L'incident a été synchronisé."
          : 'La sortie a été synchronisée.'
      );

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
              backgroundColor: isIncident ? colors.errorLight : colors.successLight,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.base,
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
                { backgroundColor: isIncident ? colors.error : colors.success },
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
    marginBottom: spacing.base,
  },
  backButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  optionCard: {
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  optionCardActiveGreen: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  optionCardActiveRed: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  optionCardActivePurple: {
    backgroundColor: colors.purpleLight,
    borderColor: colors.purple,
  },
  optionCardActiveBlue: {
    backgroundColor: colors.infoLight,
    borderColor: colors.info,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxActiveGreen: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxActiveRed: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  checkboxActivePurple: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  checkboxActiveBlue: {
    backgroundColor: colors.info,
    borderColor: colors.info,
  },
  optionLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  optionHint: {
    fontSize: typography.sizes.base,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
  fullWidth: {
    width: '100%',
    marginTop: spacing.md,
  },
  cancelButton: {
    paddingVertical: spacing.base,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray300,
    marginTop: spacing.md,
  },
  cancelText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
});