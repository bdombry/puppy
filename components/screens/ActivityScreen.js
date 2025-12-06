import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { getDogMessages } from '../../constants/dogMessages';
import { validateActivityData, formatValidationErrors } from '../services/validationService';
import { getUserFriendlyErrorMessage, logError } from '../services/errorHandler';
import { insertWithRetry } from '../services/retryService';
import { cacheService } from '../services/cacheService';

export default function ActivityScreen() {
  const navigation = useNavigation();
  const { currentDog, user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [datetime, setDatetime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('');
  const [pee, setPee] = useState(false);
  const [peeIncident, setPeeIncident] = useState(false); // Pipi est un incident
  const [poop, setPoop] = useState(false);
  const [poopIncident, setPoopIncident] = useState(false); // Caca est un incident
  const [treat, setTreat] = useState(false);
  const [dogAskedForWalk, setDogAskedForWalk] = useState(false); // Le chien a demandé
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const newDate = new Date(datetime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDatetime(newDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (selectedTime) {
      const newDate = new Date(datetime);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDatetime(newDate);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // ✅ IMPORTANT: Créer la date en LOCAL (comme c'était avant)
      // Les deux tables (outings ET activities) stockent en LOCAL dans leur champ datetime
      const pad = (n) => String(n).padStart(2, '0');
      const datetimeISO = `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(datetime.getDate())}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}:${pad(datetime.getSeconds())}`;

      const activityData = {
        dog_id: currentDog.id,
        user_id: user?.id,
        title: title.trim() || null,
        description: description.trim() || null,
        location: location.trim() || null,
        datetime: datetimeISO,
        duration_minutes: duration ? parseInt(duration) : null,
        pee,
        pee_incident: pee && peeIncident ? true : false,
        poop,
        poop_incident: poop && poopIncident ? true : false,
        treat,
        dog_asked_for_walk: dogAskedForWalk,
      };

      // ✅ VALIDATION des données
      const validation = validateActivityData(activityData);
      if (!validation.isValid) {
        throw new Error(formatValidationErrors(validation.errors));
      }

      console.log('💾 Enregistrement activité:', activityData);
      
      // ✅ INSÉRER avec retry automatique et meilleure gestion d'erreur
      try {
        await insertWithRetry(supabase, 'activities', [activityData], {
          maxRetries: 3,
          context: 'ActivityScreen.handleSave',
        });
      } catch (err) {
        // Si erreur sur colonne "treat", essayer sans (migration en cours)
        if (err.message?.includes('treat') || err.code === '42703') {
          console.log('⚠️ Tentative sans colonne treat...');
          const activityDataNoTreat = { ...activityData };
          delete activityDataNoTreat.treat;
          await insertWithRetry(supabase, 'activities', [activityDataNoTreat], {
            maxRetries: 2,
            context: 'ActivityScreen.handleSave (sans treat)',
          });
        } else {
          throw err;
        }
      }

      console.log('✅ Activité enregistrée avec succès');
      Alert.alert('✅ Enregistré !', 'La balade a été enregistrée avec succès');
      
      // 🗑️ Invalider le cache car données modifiées
      cacheService.invalidatePattern(`home_.*_${currentDog.id}`);
      cacheService.invalidatePattern(`walk_history.*_${currentDog.id}`);
      // NOTE: Pas de cache pour les timers (last_outing, last_need)
      
      // Navigation après succès
      setTimeout(() => {
        navigation.goBack();
      }, 500);
    } catch (err) {
      logError('ActivityScreen.handleSave', err);
      const userMessage = getUserFriendlyErrorMessage(err);
      Alert.alert('❌ Erreur', userMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
        <Text style={screenStyles.screenTitle}>Enregistrer une balade</Text>

        <View style={styles.header}>
          <View style={[screenStyles.avatar, { backgroundColor: colors.primaryLight }]}>
            <Text style={screenStyles.avatarEmoji}>🚶</Text>
          </View>
        </View>

        <View style={styles.form}>
          {/* Titre */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldEmoji}>📝</Text>
              <Text style={styles.fieldLabel}>Titre</Text>
              <Text style={styles.fieldOptional}>(optionnel)</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="Ex: Balade au parc"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          {/* Description */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldEmoji}>💬</Text>
              <Text style={styles.fieldLabel}>Description</Text>
              <Text style={styles.fieldOptional}>(optionnel)</Text>
            </View>
            <TextInput
              style={[styles.fieldInput, { minHeight: 100, textAlignVertical: 'top' }]}
              placeholder="Notes sur la balade..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              editable={!loading}
            />
          </View>

          {/* Localisation */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldEmoji}>📍</Text>
              <Text style={styles.fieldLabel}>Localisation</Text>
              <Text style={styles.fieldOptional}>(optionnel)</Text>
            </View>
            <TextInput
              style={styles.fieldInput}
              placeholder="Ex: Parc, rue, forêt..."
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
          </View>

          {/* Date */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldEmoji}>📅</Text>
              <Text style={styles.fieldLabel}>Date de la balade</Text>
            </View>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateTimeButtonText}>
                {datetime.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={datetime}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
                <TouchableOpacity
                  style={styles.pickerValidateButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.pickerValidateText}>✅ Valider</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Heure */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldLabelRow}>
              <Text style={styles.fieldEmoji}>🕐</Text>
              <Text style={styles.fieldLabel}>Heure de la balade</Text>
            </View>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateTimeButtonText}>
                {datetime.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <View style={styles.pickerWrapper}>
                <DateTimePicker
                  value={datetime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
                <TouchableOpacity
                  style={styles.pickerValidateButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.pickerValidateText}>✅ Valider</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Durée */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Durée en minutes (optionnel)</Text>
            <View style={styles.durationContainer}>
              {[15, 30, 45, 60].map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.durationButton,
                    duration === String(minutes) && styles.durationButtonActive,
                  ]}
                  onPress={() => {
                    if (duration === String(minutes)) {
                      setDuration('');
                    } else {
                      setDuration(String(minutes));
                    }
                  }}
                  disabled={loading}
                >
                  <Text
                    style={[
                      styles.durationButtonText,
                      duration === String(minutes) && styles.durationButtonTextActive,
                    ]}
                  >
                    {minutes}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customDurationContainer}>
              <TextInput
                style={styles.customDurationInput}
                placeholder="Autre durée (min)"
                value={duration && !['15', '30', '45', '60'].includes(duration) ? duration : ''}
                onChangeText={(text) => {
                  if (text === '' || /^\d+$/.test(text)) {
                    setDuration(text);
                  }
                }}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>
          </View>

          {/* Pipi/Caca */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Besoins (optionnel)</Text>
            <View style={styles.optionsContainer}>
              {/* Pipi */}
              <View style={styles.needsCard}>
                <TouchableOpacity
                  style={[
                    styles.needsButton,
                    pee && styles.needsButtonActive,
                  ]}
                  onPress={() => setPee(!pee)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.checkbox,
                        pee && styles.checkboxActiveGreen,
                      ]}
                    >
                      {pee && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.needsLabel}>💧 Pipi</Text>
                  </View>
                </TouchableOpacity>

                {pee && (
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        !peeIncident && styles.statusButtonSuccess,
                      ]}
                      onPress={() => setPeeIncident(false)}
                    >
                      <Text style={styles.statusButtonText}>✅ Réussite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        peeIncident && styles.statusButtonIncident,
                      ]}
                      onPress={() => setPeeIncident(true)}
                    >
                      <Text style={styles.statusButtonText}>⚠️ Incident</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Caca */}
              <View style={styles.needsCard}>
                <TouchableOpacity
                  style={[
                    styles.needsButton,
                    poop && styles.needsButtonActive,
                  ]}
                  onPress={() => setPoop(!poop)}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.checkbox,
                        poop && styles.checkboxActiveGreen,
                      ]}
                    >
                      {poop && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.needsLabel}>💩 Caca</Text>
                  </View>
                </TouchableOpacity>

                {poop && (
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        !poopIncident && styles.statusButtonSuccess,
                      ]}
                      onPress={() => setPoopIncident(false)}
                    >
                      <Text style={styles.statusButtonText}>✅ Réussite</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        poopIncident && styles.statusButtonIncident,
                      ]}
                      onPress={() => setPoopIncident(true)}
                    >
                      <Text style={styles.statusButtonText}>⚠️ Incident</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Récompense */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>A-t-il eu une friandise ? (optionnel)</Text>
            <TouchableOpacity
              style={[
                styles.treatCard,
                treat && styles.treatCardActive,
              ]}
              onPress={() => setTreat(!treat)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={[
                    styles.checkbox,
                    treat && styles.checkboxActiveTreat,
                  ]}
                >
                  {treat && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.treatLabel}>🍬 Friandise donnée</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Le chien a demandé */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Qui a demandé ? (optionnel)</Text>
            <TouchableOpacity
              style={[
                styles.initiativeCard,
                dogAskedForWalk && styles.initiativeCardActive,
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
                <Text style={styles.initiativeLabel}>🐕 Le chien l'a demandé</Text>
              </View>
            </TouchableOpacity>
          </View>
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
              style={[screenStyles.button, screenStyles.buttonPrimary, { marginBottom: spacing.lg }]}
              onPress={handleSave}
            >
              <Text style={screenStyles.buttonPrimaryText}>✅ Enregistrer la balade</Text>
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
  form: {
    marginBottom: spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  dateButton: {
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
  checkmark: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
  optionsContainer: {
    gap: spacing.md,
    marginTop: spacing.base,
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
  optionLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  needsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.small,
  },
  needsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 0,
  },
  needsButtonActive: {
    backgroundColor: colors.successLight,
    borderBottomWidth: 2,
    borderBottomColor: colors.success,
  },
  needsLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.extrabold,
    marginLeft: spacing.md,
  },
  statusButtons: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
    backgroundColor: '#fafafa',
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderColor: colors.gray200,
  },
  statusButtonSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: colors.success,
  },
  statusButtonIncident: {
    backgroundColor: '#fef2f2',
    borderColor: colors.error,
  },
  statusButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
  },
  incidentToggle: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.successLight,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  incidentToggleActive: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  incidentToggleText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  durationContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.base,
    marginBottom: spacing.md,
  },
  durationButton: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  durationButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  durationButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  durationButtonTextActive: {
    color: colors.primary,
  },
  customDurationContainer: {
    marginTop: spacing.md,
  },
  customDurationInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  treatCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  treatCardActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  checkboxActiveTreat: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  treatLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.extrabold,
    marginLeft: spacing.md,
  },
  initiativeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.small,
  },
  initiativeCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  checkboxActiveBlue: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  initiativeLabel: {
    fontSize: typography.sizes.xl,
    color: colors.text,
    fontWeight: typography.weights.extrabold,
    marginLeft: spacing.md,
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
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.gray200,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  fieldEmoji: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.sm,
  },
  fieldLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  fieldOptional: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginLeft: spacing.xs,
  },
  fieldInput: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  dateTimeButton: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  pickerWrapper: {
    marginTop: spacing.md,
    marginLeft: -spacing.lg,
    marginRight: -spacing.lg,
    marginBottom: -spacing.lg,
    backgroundColor: colors.gray50,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
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
});
