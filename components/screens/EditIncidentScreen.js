import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
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

export default function EditIncidentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog } = useAuth();

  const incident = route.params?.incident;
  const onSave = route.params?.onSave;

  const [pee, setPee] = useState(incident?.pee || false);
  const [poop, setPoop] = useState(incident?.poop || false);
  const [incidentReason, setIncidentReason] = useState(incident?.incident_reason || null);
  const [datetime, setDatetime] = useState(parseLocalISOString(incident?.datetime));
  const [showDateTimeEditor, setShowDateTimeEditor] = useState(false);
  const [loading, setLoading] = useState(false);

  const incidentReasons = [
    { label: '⏰ Pas le temps', value: 'pas_le_temps' },
    { label: '🌙 Horaire trop tardif', value: 'trop_tard' },
    { label: '😑 Flemme', value: 'flemme' },
    { label: '🤔 Oublié', value: 'oublie' },
    { label: 'ℹ️ Autre', value: 'autre' },
  ];

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
        pee,
        pee_location: pee ? 'inside' : null,
        poop,
        poop_location: poop ? 'inside' : null,
        datetime: datetimeISO,
        incident_reason: incidentReason,
      };

      const { error } = await supabase
        .from('outings')
        .update(updateData)
        .eq('id', incident.id);

      if (error) throw error;

      // Invalider le cache
      cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
      cacheService.invalidatePattern(`analytics_${currentDog?.id}_.*`);

      Alert.alert('✅ Modifié', 'L\'incident a été mis à jour');
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
          <View style={[screenStyles.avatar, { backgroundColor: colors.errorLight }]}>
            <Text style={screenStyles.avatarEmoji}>⚠️</Text>
          </View>
          <Text style={screenStyles.screenTitle}>Éditer incident</Text>
          <Text style={screenStyles.screenSubtitle}>Modifie les détails de l'accident</Text>
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

        {/* Pipi */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            pee && styles.optionCardActiveRed,
          ]}
          onPress={() => setPee(!pee)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.checkbox,
                pee && styles.checkboxActiveRed,
              ]}
            >
              {pee && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>💧 Pipi</Text>
              <Text style={styles.optionHint}>À l'intérieur</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Caca */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            poop && styles.optionCardActiveRed,
          ]}
          onPress={() => setPoop(!poop)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={[
                styles.checkbox,
                poop && styles.checkboxActiveRed,
              ]}
            >
              {poop && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>💩 Caca</Text>
              <Text style={styles.optionHint}>À l'intérieur</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Raison de l'incident */}
        <View style={styles.reasonsContainer}>
          <Text style={styles.reasonsTitle}>📋 Raison de l'accident</Text>
          {incidentReasons.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              style={[
                styles.reasonOption,
                incidentReason === reason.value && styles.reasonOptionActive,
              ]}
              onPress={() => setIncidentReason(reason.value)}
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
                { backgroundColor: colors.error, marginBottom: spacing.lg },
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
    backgroundColor: colors.error,
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
  optionCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    marginBottom: spacing.md,
  },
  optionCardActiveRed: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
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
  checkboxActiveRed: {
    backgroundColor: colors.error,
    borderColor: colors.error,
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
  reasonsContainer: {
    marginBottom: spacing.xxxl,
  },
  reasonsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  reasonOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  reasonOptionActive: {
    backgroundColor: '#fef2f2',
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
