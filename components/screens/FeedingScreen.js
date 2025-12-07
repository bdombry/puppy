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
import { getDogMessages } from '../../constants/dogMessages';
import { validateFeedingData, formatValidationErrors } from '../services/validationService';
import { getUserFriendlyErrorMessage, logError } from '../services/errorHandler';
import { insertBatchWithFallback } from '../services/retryService';
import { cacheService } from '../services/cacheService';

export default function FeedingScreen() {
  const navigation = useNavigation();
  const { currentDog } = useAuth();

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Messages personnalisés selon le sexe
  const messages = getDogMessages(currentDog?.name, currentDog?.sex);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Créer la date en heure locale (chaîne ISO sans conversion UTC)
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const datetimeISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

      const records = selectedTypes.map(type => ({
        dog_id: currentDog.id,
        user_id: user.id,
        type: type,
        datetime: datetimeISO,
      }));

      // ✅ VALIDATION des données
      const validation = validateFeedingData({ types: selectedTypes, datetime: datetimeISO });
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // ✅ PROGRAMMER LES NOTIFICATIONS AVANT l'insert (c'est critique!)
      for (const type of selectedTypes) {
        await scheduleFeedingNotification(type, new Date(), currentDog.name);
      }

      // ✅ PUIS insérer en Supabase (avec fallback retry)
      const { successful, failed } = await insertBatchWithFallback(
        supabase,
        'feeding',
        records,
        { maxRetries: 3 }
      );

      if (failed.length > 0) {
        console.warn(`⚠️ ${failed.length} enregistrement(s) échoué(s)`);
      }

      // Messages personnalisés selon le sexe
      let message = '';
      if (selectedTypes.includes('eat') && selectedTypes.includes('drink')) {
        message = messages.ateAndDrank;
      } else if (selectedTypes.includes('eat')) {
        message = messages.ateFood;
      } else {
        message = messages.drankWater;
      }

      Alert.alert('✅ Enregistré !', message);

      // 🗑️ Invalider le cache car données modifiées
      cacheService.invalidatePattern(`home_.*_${currentDog.id}`);
      cacheService.invalidatePattern(`walk_history.*_${currentDog.id}`);
      cacheService.invalidatePattern(`analytics_${currentDog.id}_.*`);
      // NOTE: Pas de cache pour les timers (last_outing, last_need)

      navigation.goBack();
    } catch (err) {
      logError('FeedingScreen.handleRecord', err);
      const userMessage = getUserFriendlyErrorMessage(err);
      Alert.alert('❌ Erreur', userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
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
            {messages.pronoun} a mangé ou bu ?
          </Text>
        </View>

        <View style={styles.optionsContainer}>
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
                <Text style={styles.optionLabel}>🍗 Manger</Text>
                <Text style={styles.optionHint}>
                  {messages.pronoun} a mangé des croquettes
                </Text>
              </View>
            </View>
          </TouchableOpacity>

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
                  {messages.pronoun} a bu de l'eau
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
                { marginBottom: spacing.lg },
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