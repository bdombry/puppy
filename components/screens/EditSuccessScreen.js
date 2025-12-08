import React, { useState } from 'react';
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

export default function EditSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog } = useAuth();

  const success = route.params?.success;
  const onSave = route.params?.onSave;

  const [pee, setPee] = useState(success?.pee || false);
  const [poop, setPoop] = useState(success?.poop || false);
  const [treat, setTreat] = useState(success?.treat || false);
  const [dogAskedForWalk, setDogAskedForWalk] = useState(success?.dog_asked_for_walk || false);
  const [datetime, setDatetime] = useState(parseLocalISOString(success?.datetime));
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
        pee,
        pee_location: pee ? 'outside' : null,
        poop,
        poop_location: poop ? 'outside' : null,
        treat,
        dog_asked_for_walk: dogAskedForWalk,
        datetime: datetimeISO,
      };

      const { error } = await supabase
        .from('outings')
        .update(updateData)
        .eq('id', success.id);

      if (error) throw error;

      // Invalider le cache
      cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
      cacheService.invalidatePattern(`analytics_${currentDog?.id}_.*`);

      Alert.alert('✅ Modifié', 'La réussite a été mise à jour');
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
          <View style={[screenStyles.avatar, { backgroundColor: colors.successLight }]}>
            <Text style={screenStyles.avatarEmoji}>✅</Text>
          </View>
          <Text style={screenStyles.screenTitle}>Éditer réussite</Text>
          <Text style={screenStyles.screenSubtitle}>Modifie les détails de la sortie</Text>
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
            pee && styles.optionCardActiveGreen,
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
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>💧 Pipi</Text>
              <Text style={styles.optionHint}>À l'extérieur</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Caca */}
        <TouchableOpacity
          style={[
            styles.optionCard,
            poop && styles.optionCardActiveGreen,
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
            <View style={{ flex: 1 }}>
              <Text style={styles.optionLabel}>💩 Caca</Text>
              <Text style={styles.optionHint}>À l'extérieur</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Friandise */}
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

        {/* Le chien a demandé */}
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
                { backgroundColor: colors.success, marginBottom: spacing.lg },
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
  optionCardActiveGreen: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  optionCardActivePurple: {
    backgroundColor: '#faf5ff',
    borderColor: '#d8b4fe',
  },
  optionCardActiveBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
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
  checkboxActivePurple: {
    backgroundColor: '#d8b4fe',
    borderColor: '#d8b4fe',
  },
  checkboxActiveBlue: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
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
