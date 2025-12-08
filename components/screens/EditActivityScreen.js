import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { supabase } from '../../config/supabase';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { cacheService } from '../services/cacheService';

// ✅ Parser une chaîne ISO locale (sans timezone) en Date locale
const parseLocalISOString = (isoString) => {
  if (!isoString) return new Date();
  // Format: "2025-12-08T00:14:09" (LOCAL, pas UTC)
  const [datePart, timePart] = isoString.split('T');
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds));
};

export default function EditActivityScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog } = useAuth();

  const activity = route.params?.activity;
  const onSave = route.params?.onSave;

  const [title, setTitle] = useState(activity?.title || 'Balade');
  const [location, setLocation] = useState(activity?.location || '');
  const [durationMinutes, setDurationMinutes] = useState(activity?.duration_minutes ? String(activity.duration_minutes) : '');
  const [pee, setPee] = useState(activity?.pee || false);
  const [peeIncident, setPeeIncident] = useState(activity?.pee_incident || false);
  const [poop, setPoop] = useState(activity?.poop || false);
  const [poopIncident, setPoopIncident] = useState(activity?.poop_incident || false);
  const [treat, setTreat] = useState(activity?.treat || false);
  const [dogAskedForWalk, setDogAskedForWalk] = useState(activity?.dog_asked_for_walk || false);
  const [datetime, setDatetime] = useState(parseLocalISOString(activity?.datetime));
  const [showDateTimeEditor, setShowDateTimeEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateTimeChange = (event, selectedDate) => {
    if (selectedDate) {
      setDatetime(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!pee && !poop) {
      Alert.alert('⚠️ Attention', 'Coche au moins pipi ou caca');
      return;
    }

    setLoading(true);
    try {
      const pad = (n) => String(n).padStart(2, '0');
      const datetimeISO = `${datetime.getFullYear()}-${pad(datetime.getMonth() + 1)}-${pad(datetime.getDate())}T${pad(datetime.getHours())}:${pad(datetime.getMinutes())}:${pad(datetime.getSeconds())}`;

      const updateData = {
        title,
        location,
        duration_minutes: parseInt(durationMinutes) || 0,
        pee,
        pee_incident: pee ? peeIncident : false,
        poop,
        poop_incident: poop ? poopIncident : false,
        treat,
        dog_asked_for_walk: dogAskedForWalk,
        datetime: datetimeISO,
      };

      const { error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', activity.id);

      if (error) throw error;

      // Invalider le cache
      cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
      cacheService.invalidatePattern(`analytics_${currentDog?.id}_.*`);

      Alert.alert('✅ Modifié', 'La balade a été mise à jour');
      setTimeout(() => {
        navigation.goBack();
        if (onSave) onSave();
      }, 500);
    } catch (err) {
      Alert.alert('❌ Erreur', err.message || 'Impossible de modifier');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer}>
        <View style={styles.header}>
          <View style={[screenStyles.avatar, { backgroundColor: '#faf5ff' }]}>
            <Text style={screenStyles.avatarEmoji}>🚶</Text>
          </View>
          <Text style={screenStyles.screenTitle}>Éditer balade</Text>
          <Text style={screenStyles.screenSubtitle}>Modifie les détails de la balade</Text>
        </View>

        {/* Date et Heure */}
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
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>📅 Sélectionne la date</Text>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={datetime}
                    mode="date"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) setDatetime(selectedDate);
                    }}
                  />
                </View>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>🕐 Sélectionne l'heure</Text>
                <View style={styles.pickerWrapper}>
                  <DateTimePicker
                    value={datetime}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedTime) => {
                      if (selectedTime) setDatetime(selectedTime);
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.pickerValidateButton}
                onPress={() => setShowDateTimeEditor(false)}
              >
                <Text style={styles.pickerValidateText}>✅ Valider</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Titre */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>📝 Titre</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Balade au parc"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Localisation */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>📍 Localisation</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Parc du quartier"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Durée */}
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>⏱️ Durée (minutes)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="30"
            keyboardType="numeric"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
          />
        </View>

        {/* Pipi/Caca */}
        <View style={{ marginBottom: spacing.lg }}>
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

        {/* Friandise */}
        <View style={{ marginBottom: spacing.lg }}>
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
        <View style={{ marginBottom: spacing.lg }}>
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
                { backgroundColor: '#8b5cf6', marginBottom: spacing.lg },
              ]}
              onPress={handleSave}
            >
              <Text style={screenStyles.buttonPrimaryText}>
                ✅ Sauvegarder
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
    marginBottom: spacing.md,
  },
  textInput: {
    backgroundColor: colors.gray50,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray200,
    fontSize: typography.sizes.base,
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
    backgroundColor: '#8b5cf6',
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
  checkmark: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
  },
  optionsContainer: {
    gap: spacing.md,
    marginTop: spacing.base,
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
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActiveGreen: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxActiveTreat: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
  },
  checkboxActiveBlue: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
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
});
