/**
 * Écran pour enregistrer alimentation/hydratation
 */

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
import { screenStyles } from '../../styles/screenStyles';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { supabase } from '../../config/supabase';
import { scheduleFeedingNotification } from '../services/feedingService';
import { loadNotificationSettings } from '../services/notificationService';

export default function FeedingScreen() {
  const navigation = useNavigation();
  const { currentDog } = useAuth();

  const [selectedTypes, setSelectedTypes] = useState([]); // ['eat', 'drink'] ou vide
  const [loading, setLoading] = useState(false);

  const toggleFeedingType = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleRecord = async () => {
    if (selectedTypes.length === 0) {
      Alert.alert('⚠️ Attention', 'Sélectionne au moins manger ou boire');
      return;
    }

    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Utilisateur non authentifié');
        setLoading(false);
        return;
      }

      // Save each selected type to Supabase
      const now = new Date().toISOString();
      const records = selectedTypes.map(type => ({
        dog_id: currentDog.id,
        user_id: user.id,
        type: type,
        datetime: now,
      }));

      const { error: insertError } = await supabase
        .from('feeding')
        .insert(records);

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        Alert.alert('❌ Erreur', 'Impossible de sauvegarder l\'enregistrement');
        setLoading(false);
        return;
      }

      // Schedule notifications for each type
      // Charger les settings de notification pour les custom intervals
      const notificationSettings = await loadNotificationSettings();
      
      // Si les 2 sont sélectionnés, ça va automatiquement grouper
      for (const type of selectedTypes) {
        await scheduleFeedingNotification(
          type, 
          new Date(), 
          currentDog.name,
          notificationSettings.customIntervals
        );
      }

      const message = selectedTypes.includes('eat') && selectedTypes.includes('drink')
        ? `${currentDog.name} a mangé ET bu !`
        : selectedTypes.includes('eat')
          ? `${currentDog.name} a mangé !`
          : `${currentDog.name} a bu !`;

      Alert.alert('✅ Enregistré !', message);

      navigation.goBack();
    } catch (err) {
      Alert.alert('❌ Erreur', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={[
            screenStyles.avatar,
            { backgroundColor: colors.primaryLight }
          ]}>
            <Text style={screenStyles.avatarEmoji}>🍽️</Text>
          </View>

          <Text style={screenStyles.screenTitle}>
            Alimentation
          </Text>
          <Text style={screenStyles.screenSubtitle}>
            {`${currentDog?.name} a mangé ou bu ?`}
          </Text>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          {/* MANGER */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedTypes.includes('eat') && styles.optionCardActive,
            ]}
            onPress={() => toggleFeedingType('eat')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  selectedTypes.includes('eat') && styles.checkboxActive,
                ]}
              >
                {selectedTypes.includes('eat') && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>🍖 Manger</Text>
                <Text style={styles.optionHint}>
                  {currentDog?.name} a mangé des croquettes
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* BOIRE */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedTypes.includes('drink') && styles.optionCardActive,
            ]}
            onPress={() => toggleFeedingType('drink')}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  selectedTypes.includes('drink') && styles.checkboxActive,
                ]}
              >
                {selectedTypes.includes('drink') && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💧 Boire</Text>
                <Text style={styles.optionHint}>
                  {currentDog?.name} a bu de l'eau
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: spacing.lg }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={[
                screenStyles.button,
                screenStyles.buttonPrimary,
              ]}
              onPress={handleRecord}
            >
              <Text style={screenStyles.buttonPrimaryText}>
                ✅ Enregistrer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[screenStyles.button, styles.cancelButton]}
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  checkmark: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
  optionsContainer: {
    gap: spacing.md,
    marginBottom: spacing.xxxl,
  },
  optionCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  optionCardActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  optionHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  cancelText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
});
