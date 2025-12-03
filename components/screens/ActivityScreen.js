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
import { formatDateTimeLocal } from '../services/dateService';
import { getDogMessages } from '../../constants/dogMessages';

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
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const newDate = new Date(datetime);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setDatetime(newDate);
    }
    setShowDatePicker(Platform.OS === 'ios');
  };

  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const newDate = new Date(datetime);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setDatetime(newDate);
    }
    setShowTimePicker(Platform.OS === 'ios');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Utiliser la fonction centralisée pour formatter la date
      const datetimeISO = formatDateTimeLocal(datetime);

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
      };

      console.log('💾 Enregistrement activité:', activityData);
      let result = await supabase.from('activities').insert([activityData]);

      if (result.error) {
        console.error('❌ Erreur insert avec treat:', result.error);
        
        // Si erreur, essayer sans treat (la colonne peut ne pas exister)
        if (result.error.message?.includes('treat')) {
          console.log('⚠️ Tentative sans colonne treat...');
          delete activityData.treat;
          result = await supabase.from('activities').insert([activityData]);
        }
        
        if (result.error) {
          throw result.error;
        }
      }

      console.log('✅ Activité enregistrée avec succès');
      Alert.alert('✅ Enregistré !', 'La balade a été enregistrée avec succès');
      
      // Délai pour s'assurer que Supabase a bien sauvegardé avant de naviguer
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (err) {
      console.error('❌ Erreur handleSave:', err);
      Alert.alert('❌ Erreur', err.message || 'Erreur lors de l\'enregistrement');
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
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Titre (optionnel)</Text>
            <TextInput
              style={screenStyles.input}
              placeholder="Ex: Balade au parc"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
            />
          </View>

          {/* Description */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Description (optionnel)</Text>
            <TextInput
              style={[screenStyles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              placeholder="Notes sur la balade..."
              value={description}
              onChangeText={setDescription}
              multiline
              editable={!loading}
            />
          </View>

          {/* Localisation */}
          <View style={screenStyles.formGroup}>
            <Text style={screenStyles.label}>Localisation (optionnel)</Text>
            <TextInput
              style={screenStyles.input}
              placeholder="Ex: Parc, rue, forêt..."
              value={location}
              onChangeText={setLocation}
              editable={!loading}
            />
          </View>

          {/* Date et Heure côte à côte */}
          <View style={styles.dateTimeRow}>
            <View style={{ flex: 1 }}>
              <Text style={screenStyles.label}>Date *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
                disabled={loading}
              >
                <Text style={styles.dateButtonText}>
                  {datetime.toLocaleDateString('fr-FR')}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={datetime}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={screenStyles.label}>Heure *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
                disabled={loading}
              >
                <Text style={styles.dateButtonText}>
                  {datetime.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={datetime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                />
              )}
            </View>
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
                    <Text style={styles.needsLabel}>Pipi</Text>
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
                    <Text style={styles.needsLabel}>Caca</Text>
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
            <Text style={screenStyles.label}>Récompense (optionnel)</Text>
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
              style={[screenStyles.button, screenStyles.buttonPrimary]}
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
