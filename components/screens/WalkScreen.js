import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { scheduleNotificationFromOuting } from '../services/notificationService';
import { getDogMessages } from '../../constants/dogMessages';
import { validateWalkData, formatValidationErrors } from '../services/validationService';
import { getUserFriendlyErrorMessage, logError } from '../services/errorHandler';
import { insertWithRetry } from '../services/retryService';
import { cacheService } from '../services/cacheService';

export default function WalkScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog, user } = useAuth();

  const eventType = route.params?.type || 'walk';
  const isIncident = eventType === 'incident';

  console.log('🚶 WalkScreen montée, eventType:', eventType, 'isIncident:', isIncident);

  const [pee, setPee] = useState(false);
  const [poop, setPoop] = useState(false);
  const [treat, setTreat] = useState(false);
  const [dogAskedForWalk, setDogAskedForWalk] = useState(false);
  const [incidentReason, setIncidentReason] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [datetime, setDatetime] = useState(new Date());
  const [showDateTimeEditor, setShowDateTimeEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  const incidentReasons = [
    { label: '⏰ Pas le temps', value: 'pas_le_temps' },
    { label: '🌙 Horaire trop tardif', value: 'trop_tard' },
    { label: '😑 Flemme', value: 'flemme' },
    { label: '🤔 Oublié', value: 'oublie' },
    { label: 'ℹ️ Autre', value: 'autre' },
  ];

  const messages = getDogMessages(currentDog?.name, currentDog?.sex);

  const handleSave = async () => {
    console.log('🚶 WalkScreen handleSave appelé avec:', { pee, poop, treat, dogAskedForWalk });
    
    if (!pee && !poop) {
      console.log('❌ WalkScreen: Pas de pee ni poop, Alert affiché');
      Alert.alert(
        '⚠️ Attention',
        'Coche au moins une option (pipi ou caca) 💧💩'
      );
      return;
    }

    console.log('✅ WalkScreen: Validation réussie, création de walkData');
    setLoading(true);
    try {
      const location = isIncident ? 'inside' : 'outside';
      // ✅ IMPORTANT: Utiliser la date modifiée (ou maintenant si pas modifiée)
      // Les deux tables (outings ET activities) stockent en LOCAL dans leur champ datetime
      const pad = (n) => String(n).padStart(2, '0');
      const datetimeISO = `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(datetime.getDate())}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}:${pad(datetime.getSeconds())}`;

      const walkData = {
        dog_id: currentDog.id,
        user_id: user?.id || null,
        datetime: datetimeISO,
        pee,
        pee_location: pee ? location : null,
        poop,
        poop_location: poop ? location : null,
        treat,
        dog_asked_for_walk: dogAskedForWalk,
        incident_reason: isIncident ? incidentReason : null,
      };
      
      console.log('📤 WalkScreen: Données à envoyer:', walkData);

      // ✅ VALIDATION des données AVANT Supabase
      const validation = validateWalkData(walkData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      // ✅ PROGRAMMER LES NOTIFICATIONS AVANT l'insert Supabase (c'est critique!)
      // Comme ça, même si Supabase échoue, la notif est programmée localement
      // Convert LOCAL datetime string to Date for notification
      const outingTime = datetime; // Use the modified datetime Date object
      const notificationScheduled = await scheduleNotificationFromOuting(outingTime, currentDog.name);
      
      if (!notificationScheduled) {
        console.warn('⚠️ Notification non programmée, mais on continue avec l\'insert');
      }

      // ✅ PUIS insérer en Supabase (avec retry automatique)
      await insertWithRetry(supabase, 'outings', [walkData], {
        maxRetries: 3,
        context: 'WalkScreen.handleSave',
      });

      let successMessage = '';
      if (pee && poop && treat) {
        successMessage = `${messages.pronoun} a tout fait! 💧💩🍖`;
      } else if (pee && poop) {
        successMessage = `${messages.pronoun} a fait pipi et caca! 💧💩`;
      } else if (pee) {
        successMessage = messages.peeDone;
      } else if (poop) {
        successMessage = messages.poopDone;
      }

      Alert.alert(
        '✅ Enregistré !',
        isIncident
          ? `L'incident a été synchronisé. ${successMessage}`
          : `La sortie a été synchronisée. ${successMessage}`
      );

      // 🗑️ Invalider le cache car données modifiées
      cacheService.invalidatePattern(`home_.*_${currentDog.id}`);
      cacheService.invalidatePattern(`walk_history.*_${currentDog.id}`);
      cacheService.invalidatePattern(`analytics_${currentDog.id}_.*`);
      // NOTE: Pas de cache pour les timers (last_outing, last_need)

      // ✅ Navigation après succès
      setTimeout(() => {
        navigation.navigate('MainTabs', { screen: 'Home' });
      }, 1000); // Réduit de 2s à 1s puisqu'on a le retry
    } catch (err) {
      logError('WalkScreen.handleSave', err);
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
            { backgroundColor:
                isIncident
                  ? colors.errorLight
                  : eventType === 'walk'
                    ? colors.pupyAccent
                    : colors.successLight }
          ]}>
            <Text style={screenStyles.avatarEmoji}>
              {isIncident ? '⚠️' : eventType === 'walk' ? '🚶' : '🌳'}
            </Text>
          </View>

          <Text style={screenStyles.screenTitle}>
            {isIncident ? 'Incident' : eventType === 'walk' ? 'Balade' : 'Réussite'}
          </Text>
          <Text style={screenStyles.screenSubtitle}>
            {isIncident
              ? messages.incidentInside
              : eventType === 'walk'
                ? `Balade avec ${currentDog?.name}`
                : `Qu'a fait ${currentDog?.name} ?`}
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
              pee && (isIncident
                ? styles.optionCardActiveRed
                : eventType === 'walk'
                  ? styles.optionCardActiveBlue
                  : styles.optionCardActiveGreen),
            ]}
            onPress={() => {
              console.log('💧 WalkScreen: Toggle pee, avant:', pee);
              setPee(!pee);
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  pee && (isIncident
                    ? styles.checkboxActiveRed
                    : eventType === 'walk'
                      ? styles.checkboxActiveBlue
                      : styles.checkboxActiveGreen),
                ]}
              >
                {pee && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💧 Pipi</Text>
                
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              poop && (isIncident
                ? styles.optionCardActiveRed
                : eventType === 'walk'
                  ? styles.optionCardActiveBlue
                  : styles.optionCardActiveGreen),
            ]}
            onPress={() => {
              console.log('💩 WalkScreen: Toggle poop, avant:', poop);
              setPoop(!poop);
            }}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  poop && (isIncident
                    ? styles.checkboxActiveRed
                    : eventType === 'walk'
                      ? styles.checkboxActiveBlue
                      : styles.checkboxActiveGreen),
                ]}
              >
                {poop && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💩 Caca</Text>
              </View>
            </View>
          </TouchableOpacity>

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
                  {treat && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>🍬 Friandise</Text>
                  <Text style={styles.optionHint}>Récompense donnée</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Le chien a demandé */}
          {!isIncident && (
            <TouchableOpacity
              style={[
                styles.optionCard,
                dogAskedForWalk && styles.optionCardActiveBlue,
              ]}
              onPress={() => setDogAskedForWalk(!dogAskedForWalk)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.checkbox,
                    dogAskedForWalk && styles.checkboxActiveBlue,
                  ]}
                >
                  {dogAskedForWalk && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>🐕 Le chien l'a demandé</Text>
                  <Text style={styles.optionHint}>Initié par le chien</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* Raison de l'incident */}
          {isIncident && (
            <TouchableOpacity
              style={[
                styles.optionCard,
                incidentReason && styles.optionCardActiveRed,
              ]}
              onPress={() => setShowReasonModal(true)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.checkbox,
                    incidentReason && styles.checkboxActiveRed,
                  ]}
                >
                  {incidentReason && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.optionLabel}>
                    {incidentReason
                      ? incidentReasons.find((r) => r.value === incidentReason)?.label
                      : '📋 Raison'}
                  </Text>
                  <Text style={styles.optionHint}>Pourquoi cet accident ?</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Modal pour la raison de l'incident */}
        {isIncident && (
          <Modal
            visible={showReasonModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowReasonModal(false)}
          >
            <TouchableOpacity
              style={styles.reasonModalOverlay}
              onPress={() => setShowReasonModal(false)}
              activeOpacity={1}
            >
              <View style={styles.reasonModalContent}>
                <Text style={styles.reasonModalTitle}>Pourquoi cet accident ?</Text>
                {incidentReasons.map((reason) => (
                  <TouchableOpacity
                    key={reason.value}
                    style={[
                      styles.reasonOption,
                      incidentReason === reason.value && styles.reasonOptionActive,
                    ]}
                    onPress={() => {
                      setIncidentReason(reason.value);
                      setShowReasonModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.reasonOptionText,
                        incidentReason === reason.value && styles.reasonOptionTextActive,
                      ]}
                    >
                      {reason.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.reasonClearButton}
                  onPress={() => {
                    setIncidentReason(null);
                    setShowReasonModal(false);
                  }}
                >
                  <Text style={styles.reasonClearText}>Effacer la sélection</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>
        )}

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
                { backgroundColor: isIncident ? colors.error : colors.success, marginBottom: spacing.lg },
              ]}
              onPress={handleSave}
            >
              <Text style={screenStyles.buttonPrimaryText}>
                {isIncident ? '✅ Enregistrer l\'accident' : '✅ Enregistrer le besoin'}
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
    borderColor: colors.purpleLighter,
  },
  optionCardActiveBlue: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primaryLighter,
  },
  optionCardActiveYellow: {
    backgroundColor: colors.warningLightest,
    borderColor: colors.warningLighter,
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
  checkboxActiveGreen: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxActiveRed: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  checkboxActivePurple: {
    backgroundColor: colors.purpleLighter,
    borderColor: colors.purpleLighter,
  },
  checkboxActiveBlue: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxActiveYellow: {
    backgroundColor: colors.warningLighter,
    borderColor: colors.warningLighter,
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
  reasonButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    marginTop: spacing.base,
    marginBottom: spacing.lg,
  },
  reasonButtonActive: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  reasonButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  reasonModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  reasonModalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  reasonModalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  reasonOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
  },
  reasonOptionActive: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  reasonOptionText: {
    fontSize: typography.sizes.lg,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  reasonOptionTextActive: {
    color: colors.error,
  },
  reasonClearButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
  },
  reasonClearText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
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
    backgroundColor: colors.success,
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