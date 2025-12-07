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
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [datetime, setDatetime] = useState(new Date());
  const [showDateTimeEditor, setShowDateTimeEditor] = useState(false);
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
      const pad = (n) => String(n).padStart(2, '0');
      const datetimeISO = `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(datetime.getDate())}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}:${pad(datetime.getSeconds())}`;

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
        await scheduleFeedingNotification(type, datetime, currentDog.name);
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

        {/* Date et Heure combinées */}
        <View style={styles.fieldCard}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldEmoji}>📅</Text>
            <Text style={styles.fieldLabel}>Date et heure</Text>
          </View>
          <TouchableOpacity
            style={styles.dateTimeButton}
            onPress={() => setShowDateTimeEditor(!showDateTimeEditor)}
            disabled={loading}
          >
            <Text style={styles.dateTimeButtonText}>
              {datetime.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} à {datetime.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </TouchableOpacity>

          {showDateTimeEditor && (
            <View style={styles.dateTimeEditor}>
              {/* Date picker section */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>📅 Sélectionne la date</Text>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={datetime}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setDatetime(selectedDate);
                      }
                    }}
                  />
                </View>
              </View>

              {/* Time picker section */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>🕐 Sélectionne l'heure</Text>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={datetime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) {
                        setDatetime(selectedTime);
                      }
                    }}
                  />
                </View>
              </View>

              {/* Validate button */}
              <TouchableOpacity
                style={styles.pickerValidateButton}
                onPress={() => setShowDateTimeEditor(false)}
              >
                <Text style={styles.pickerValidateText}>✅ Valider</Text>
              </TouchableOpacity>
            </View>
          )}
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
  fieldCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    marginBottom: spacing.lg,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fieldEmoji: {
    fontSize: typography.sizes.xxl,
    marginRight: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  dateTimeButton: {
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  dateTimeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  dateTimeEditor: {
    marginTop: spacing.md,
    marginLeft: -spacing.lg,
    marginRight: -spacing.lg,
    marginBottom: -spacing.lg,
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  pickerSection: {
    marginBottom: spacing.lg,
  },
  pickerLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  pickerWrapper: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    overflow: 'hidden',
  },
  pickerValidateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  pickerValidateText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});