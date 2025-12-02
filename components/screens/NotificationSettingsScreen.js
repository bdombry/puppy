/**
 * Écran de configuration des notifications
 * Sélection du preset + configuration des heures silencieuses
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
  PUPPY_PRESETS,
} from '../services/notificationService';
import { FEEDING_PRESETS } from '../services/feedingService';

// Options prédéfinies pour les intervalles
const OUTING_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 12, 24]; // heures
const EATING_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120]; // minutes
const DRINKING_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120]; // minutes

export function NotificationSettingsScreen({ dogName, onGoBack }) {
  const [settings, setSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULT_NOTIFICATION_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingRange, setAddingRange] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [newRangeStart, setNewRangeStart] = useState(new Date(2025, 11, 2, 22, 0));
  const [newRangeEnd, setNewRangeEnd] = useState(new Date(2025, 11, 2, 8, 0));
  const [editingOutingInterval, setEditingOutingInterval] = useState(false);
  const [showOutingPicker, setShowOutingPicker] = useState(false);
  const [newOutingInterval, setNewOutingInterval] = useState(new Date(2025, 11, 2, 3, 0));
  const [editingEatInterval, setEditingEatInterval] = useState(false);
  const [showEatPicker, setShowEatPicker] = useState(false);
  const [newEatInterval, setNewEatInterval] = useState(new Date(2025, 11, 2, 0, 20));
  const [editingDrinkInterval, setEditingDrinkInterval] = useState(false);
  const [showDrinkPicker, setShowDrinkPicker] = useState(false);
  const [newDrinkInterval, setNewDrinkInterval] = useState(new Date(2025, 11, 2, 0, 20));

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadNotificationSettings();
      // Merger avec les defaults pour s'assurer que customIntervals existe
      const merged = {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...loaded,
        customIntervals: {
          ...DEFAULT_NOTIFICATION_SETTINGS.customIntervals,
          ...(loaded.customIntervals || {}),
        },
      };
      setSettings(merged);
      setOriginalSettings(merged); // Garder une copie originale
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
      setSettings(DEFAULT_NOTIFICATION_SETTINGS);
      setOriginalSettings(DEFAULT_NOTIFICATION_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await saveNotificationSettings(settings);
      setOriginalSettings(settings); // Mettre à jour après sauvegarde
      Alert.alert('✅ Succès', 'Paramètres sauvegardés !');
    } catch (error) {
      Alert.alert('❌ Erreur', 'Impossible de sauvegarder');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        '⚠️ Changements non sauvegardés',
        'Tu as des modifications. Veux-tu vraiment partir sans sauvegarder ?',
        [
          { text: '❌ Annuler', onPress: () => {}, style: 'cancel' },
          { text: '💾 Sauvegarder', onPress: () => handleSave().then(() => onGoBack()) },
          { text: '🚪 Partir', onPress: () => onGoBack(), style: 'destructive' },
        ]
      );
    } else {
      onGoBack();
    }
  };

  const handlePresetChange = (presetKey) => {
    setSettings(prev => ({
      ...prev,
      preset: presetKey,
    }));
  };

  const addExcludedRange = () => {
    const startStr = `${String(newRangeStart.getHours()).padStart(2, '0')}:${String(newRangeStart.getMinutes()).padStart(2, '0')}`;
    const endStr = `${String(newRangeEnd.getHours()).padStart(2, '0')}:${String(newRangeEnd.getMinutes()).padStart(2, '0')}`;

    const newRange = {
      start: startStr,
      end: endStr,
    };

    setSettings(prev => ({
      ...prev,
      excludedRanges: [...(prev.excludedRanges || []), newRange],
    }));

    setAddingRange(false);
    Alert.alert('✅ Plage ajoutée', `${startStr} → ${endStr}`);
  };

  const removeExcludedRange = (index) => {
    setSettings(prev => ({
      ...prev,
      excludedRanges: prev.excludedRanges.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const currentPreset = PUPPY_PRESETS[settings.preset];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Notifications</Text>
        <View style={{ width: 50 }}>
          {hasChanges && <Text style={styles.unsavedIndicator}>●</Text>}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
        {/* INFO: Fonctionnement */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📌 Comment ça marche ?</Text>
          <Text style={styles.infoText}>
            Quand tu enregistres une sortie, {dogName} reçoit une notification après l'intervalle configuré (2h, 3h ou 4h) pour que tu ressortes ton chiot.
          </Text>
          <Text style={styles.infoText}>
            Les heures silencieuses empêchent les notifications pendant ces périodes.
          </Text>
        </View>

        {/* PRESET SELECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Intervalle de notification</Text>
          <Text style={styles.sectionDescription}>
            Choisir selon l'âge du chiot
          </Text>

          {Object.entries(PUPPY_PRESETS).map(([key, preset]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.presetButton,
                settings.preset === key && styles.presetButtonActive,
              ]}
              onPress={() => handlePresetChange(key)}
            >
              <View style={styles.presetContent}>
                <Text style={[styles.presetName, settings.preset === key && styles.presetNameActive]}>
                  {preset.label}
                </Text>
                <Text style={[styles.presetInterval, settings.preset === key && styles.presetIntervalActive]}>
                  {preset.interval}h entre chaque sortie
                </Text>
              </View>
              {settings.preset === key && (
                <Text style={styles.presetCheckmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}

          {currentPreset && (
            <View style={styles.presetInfoBox}>
              <Text style={styles.presetInfoText}>
                ✨ Sélectionné: {currentPreset.label}
              </Text>
            </View>
          )}
        </View>

        {/* CUSTOM INTERVALS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏱️ Intervalle des notifications</Text>
          <Text style={styles.sectionDescription}>
            Personnaliser quand tu veux être notifié après chaque action
          </Text>

          {/* SORTIE */}
          <View style={styles.intervalSection}>
            <Text style={styles.intervalSectionTitle}>🚪 Après une sortie</Text>
            {!editingOutingInterval ? (
              <View style={styles.intervalDisplayBox}>
                <View>
                  <Text style={styles.intervalDisplayLabel}>Attendre</Text>
                  <Text style={styles.intervalDisplayValue}>
                    {settings.customIntervals?.outing 
                      ? `${settings.customIntervals.outing}h` 
                      : `${PUPPY_PRESETS[settings.preset]?.interval}h (par défaut)`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editIntervalButton}
                  onPress={() => {
                    const hours = settings.customIntervals?.outing || PUPPY_PRESETS[settings.preset]?.interval || 3;
                    setNewOutingInterval(new Date(2025, 11, 2, hours, 0));
                    setEditingOutingInterval(true);
                  }}
                >
                  <Text style={styles.editIntervalButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.intervalEditBox}>
                <Text style={styles.formLabel}>⏱️ Intervalle (heures):</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowOutingPicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {String(newOutingInterval.getHours()).padStart(2, '0')}h
                  </Text>
                </TouchableOpacity>
                {showOutingPicker && (
                  <DateTimePicker
                    value={newOutingInterval}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setNewOutingInterval(selectedDate);
                      }
                      setShowOutingPicker(false);
                    }}
                  />
                )}

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonConfirm]}
                    onPress={() => {
                      const newSettings = { ...settings };
                      newSettings.customIntervals.outing = newOutingInterval.getHours();
                      setSettings(newSettings);
                      setEditingOutingInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>✓ Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonCancel]}
                    onPress={() => {
                      if (settings.customIntervals?.outing) {
                        const newSettings = { ...settings };
                        newSettings.customIntervals.outing = null;
                        setSettings(newSettings);
                      }
                      setEditingOutingInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>Réinitialiser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* MANGER */}
          <View style={styles.intervalSection}>
            <Text style={styles.intervalSectionTitle}>🍽️ Après un repas</Text>
            {!editingEatInterval ? (
              <View style={styles.intervalDisplayBox}>
                <View>
                  <Text style={styles.intervalDisplayLabel}>Attendre</Text>
                  <Text style={styles.intervalDisplayValue}>
                    {settings.customIntervals?.eat 
                      ? `${settings.customIntervals.eat} min` 
                      : `${FEEDING_PRESETS[settings.preset]?.eat || 20} min (par défaut)`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editIntervalButton}
                  onPress={() => {
                    const minutes = settings.customIntervals?.eat || FEEDING_PRESETS[settings.preset]?.eat || 20;
                    setNewEatInterval(new Date(2025, 11, 2, 0, minutes));
                    setEditingEatInterval(true);
                  }}
                >
                  <Text style={styles.editIntervalButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.intervalEditBox}>
                <Text style={styles.formLabel}>⏱️ Intervalle (minutes):</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowEatPicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {String(newEatInterval.getMinutes()).padStart(2, '0')} min
                  </Text>
                </TouchableOpacity>
                {showEatPicker && (
                  <DateTimePicker
                    value={newEatInterval}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setNewEatInterval(selectedDate);
                      }
                      setShowEatPicker(false);
                    }}
                  />
                )}

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonConfirm]}
                    onPress={() => {
                      const newSettings = { ...settings };
                      newSettings.customIntervals.eat = newEatInterval.getMinutes();
                      setSettings(newSettings);
                      setEditingEatInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>✓ Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonCancel]}
                    onPress={() => {
                      if (settings.customIntervals?.eat) {
                        const newSettings = { ...settings };
                        newSettings.customIntervals.eat = null;
                        setSettings(newSettings);
                      }
                      setEditingEatInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>Réinitialiser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* BOIRE */}
          <View style={styles.intervalSection}>
            <Text style={styles.intervalSectionTitle}>💧 Après avoir bu</Text>
            {!editingDrinkInterval ? (
              <View style={styles.intervalDisplayBox}>
                <View>
                  <Text style={styles.intervalDisplayLabel}>Attendre</Text>
                  <Text style={styles.intervalDisplayValue}>
                    {settings.customIntervals?.drink 
                      ? `${settings.customIntervals.drink} min` 
                      : `${FEEDING_PRESETS[settings.preset]?.drink || 20} min (par défaut)`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.editIntervalButton}
                  onPress={() => {
                    const minutes = settings.customIntervals?.drink || FEEDING_PRESETS[settings.preset]?.drink || 20;
                    setNewDrinkInterval(new Date(2025, 11, 2, 0, minutes));
                    setEditingDrinkInterval(true);
                  }}
                >
                  <Text style={styles.editIntervalButtonText}>Modifier</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.intervalEditBox}>
                <Text style={styles.formLabel}>⏱️ Intervalle (minutes):</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowDrinkPicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {String(newDrinkInterval.getMinutes()).padStart(2, '0')} min
                  </Text>
                </TouchableOpacity>
                {showDrinkPicker && (
                  <DateTimePicker
                    value={newDrinkInterval}
                    mode="time"
                    display="spinner"
                    onChange={(event, selectedDate) => {
                      if (selectedDate) {
                        setNewDrinkInterval(selectedDate);
                      }
                      setShowDrinkPicker(false);
                    }}
                  />
                )}

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonConfirm]}
                    onPress={() => {
                      const newSettings = { ...settings };
                      newSettings.customIntervals.drink = newDrinkInterval.getMinutes();
                      setSettings(newSettings);
                      setEditingDrinkInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>✓ Confirmer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.formButton, styles.formButtonCancel]}
                    onPress={() => {
                      if (settings.customIntervals?.drink) {
                        const newSettings = { ...settings };
                        newSettings.customIntervals.drink = null;
                        setSettings(newSettings);
                      }
                      setEditingDrinkInterval(false);
                    }}
                  >
                    <Text style={styles.formButtonText}>Réinitialiser</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* EXCLUDED RANGES */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌙 Heures silencieuses</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Désactiver les notifications pendant ces périodes
          </Text>

          {/* Current Ranges */}
          {settings.excludedRanges && settings.excludedRanges.length > 0 && (
            <View style={styles.rangesList}>
              {settings.excludedRanges.map((range, index) => (
                <View key={index} style={styles.rangeItem}>
                  <View>
                    <Text style={styles.rangeTime}>
                      🔕 {range.start} → {range.end}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => removeExcludedRange(index)}>
                    <Text style={styles.removeButton}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add New Range */}
          {!addingRange ? (
            <TouchableOpacity
              style={styles.addRangeButton}
              onPress={() => setAddingRange(true)}
            >
              <Text style={styles.addRangeButtonText}>+ Ajouter une plage</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.addRangeForm}>
              {/* Start Time Picker */}
              <Text style={styles.formLabel}>🕐 Début (sans notif à partir de):</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.timePickerButtonText}>
                  {String(newRangeStart.getHours()).padStart(2, '0')}:
                  {String(newRangeStart.getMinutes()).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={newRangeStart}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setNewRangeStart(selectedDate);
                    }
                    setShowStartPicker(false);
                  }}
                />
              )}

              {/* End Time Picker */}
              <Text style={[styles.formLabel, { marginTop: spacing.lg }]}>🕐 Fin (pas de notif jusqu'à):</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setShowEndPicker(true)}
              >
                <Text style={styles.timePickerButtonText}>
                  {String(newRangeEnd.getHours()).padStart(2, '0')}:
                  {String(newRangeEnd.getMinutes()).padStart(2, '0')}
                </Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={newRangeEnd}
                  mode="time"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setNewRangeEnd(selectedDate);
                    }
                    setShowEndPicker(false);
                  }}
                />
              )}

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonConfirm]}
                  onPress={addExcludedRange}
                >
                  <Text style={styles.formButtonText}>✓ Ajouter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonCancel]}
                  onPress={() => setAddingRange(false)}
                >
                  <Text style={styles.formButtonText}>✕ Annuler</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {settings.excludedRanges && settings.excludedRanges.length === 0 && !addingRange && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucune plage silencieuse configurée</Text>
            </View>
          )}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Actions rapides</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('✅ Test', 'Notif dans 10 secondes...');
              Notifications.scheduleNotificationAsync({
                identifier: 'test-10sec',
                content: {
                  title: 'Test',
                  body: 'Si tu vois ça, les notifs marchent !',
                  sound: 'default',
                },
                trigger: { seconds: 10, repeats: false },
              });
            }}
          >
            <Text style={styles.actionButtonText}>Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              setSettings(DEFAULT_NOTIFICATION_SETTINGS);
              Alert.alert('🔄 Réinitialisation', 'Paramètres par défaut appliqués');
            }}
          >
            <Text style={styles.actionButtonText}>🔄 Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Résumé</Text>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryItem}>
              • Intervalle: <Text style={styles.summaryValue}>{currentPreset?.interval || '?'}h</Text>
            </Text>
            <Text style={styles.summaryItem}>
              • Heures silencieuses: <Text style={styles.summaryValue}>
                {settings.excludedRanges && settings.excludedRanges.length > 0
                  ? `${settings.excludedRanges.length}`
                  : 'Aucune'}
              </Text>
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>💾 Enregistrer</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

NotificationSettingsScreen.propTypes = {
  dogName: PropTypes.string.isRequired,
  onGoBack: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  backButton: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  unsavedIndicator: {
    fontSize: 20,
    color: colors.error,
    textAlign: 'right',
  },

  infoBox: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },

  section: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  /* Presets */
  presetButton: {
    backgroundColor: colors.white,
    borderColor: colors.gray200,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetContent: {
    flex: 1,
  },
  presetName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  presetNameActive: {
    color: colors.white,
  },
  presetInterval: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  presetIntervalActive: {
    color: colors.white,
  },
  presetCheckmark: {
    fontSize: 24,
    color: colors.white,
    marginLeft: spacing.md,
  },
  presetInfoBox: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  presetInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.success,
    fontWeight: typography.weights.bold,
  },

  /* Ranges */
  rangesList: {
    marginTop: spacing.md,
  },
  rangeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  rangeTime: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  removeButton: {
    fontSize: 20,
    color: colors.error,
    fontWeight: typography.weights.bold,
  },

  addRangeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  addRangeButtonText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },

  addRangeForm: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  formLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  timePickerButton: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  timePickerButtonText: {
    fontSize: typography.sizes.xl,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  timeInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray300,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  timeInputText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  formButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  formButtonConfirm: {
    backgroundColor: colors.success,
  },
  formButtonCancel: {
    backgroundColor: colors.error,
  },
  formButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },

  emptyBox: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },

  /* Actions */
  actionButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
  },
  actionButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },

  /* Summary */
  summaryBox: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  summaryItem: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: typography.weights.semibold,
  },
  summaryValue: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },

  /* Save Button */
  saveButton: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.success,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.base,
  },
  saveButtonDisabled: {
    backgroundColor: colors.gray400,
  },
  saveButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },

  /* Custom Intervals */
  intervalSection: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  intervalSectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  intervalDisplayBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  intervalDisplayLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  intervalDisplayValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  editIntervalButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  editIntervalButtonText: {
    fontSize: typography.sizes.sm,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  intervalEditBox: {
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  intervalInput: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  numberPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  numberPickerButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberPickerButtonText: {
    fontSize: typography.sizes.xxl,
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  numberPickerValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    minWidth: 80,
    textAlign: 'center',
  },
});
