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
import { useNavigation, useRoute } from '@react-navigation/native';
import { supabase } from '../../config/supabase';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { scheduleNotificationFromOuting } from '../services/notificationService';

export default function WalkScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { currentDog, user } = useAuth();
  
  // Type: 'incident' ou 'walk'
  const eventType = route.params?.type || 'walk';
  const isIncident = eventType === 'incident';

  const [pee, setPee] = useState(false);
  const [poop, setPoop] = useState(false);
  const [treat, setTreat] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!pee && !poop) {
      Alert.alert(
        'Attention',
        'Coche au moins une option (pipi ou caca) 💧💩'
      );
      return;
    }

    setLoading(true);
    try {
      // Automatique : incident = inside, sortie = outside
      const location = isIncident ? 'inside' : 'outside';

      const walkData = {
        dog_id: currentDog.id,
        user_id: user?.id || null,
        datetime: new Date().toISOString(),
        pee,
        pee_location: pee ? location : null,
        poop,
        poop_location: poop ? location : null,
        treat,
      };

      const { error } = await supabase.from('outings').insert([walkData]);
      if (error) throw error;
      
      // 🔔 Programmer la notification
      const outingTime = new Date(walkData.datetime);
      await scheduleNotificationFromOuting(outingTime, currentDog.name);
      
      Alert.alert(
        '✅ Enregistré !',
        isIncident
          ? "L'incident a été synchronisé."
          : 'La sortie a été synchronisée.'
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert('Erreur', err.message);
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
            { backgroundColor: isIncident ? colors.errorLight : colors.successLight }
          ]}>
            <Text style={screenStyles.avatarEmoji}>
              {isIncident ? '⚠️' : '🌳'}
            </Text>
          </View>

          <Text style={screenStyles.screenTitle}>
            {isIncident ? 'Incident à la maison' : 'Sortie réussie'}
          </Text>
          <Text style={screenStyles.screenSubtitle}>
            {isIncident
              ? `Qu'a fait ${currentDog?.name} à l'intérieur ?`
              : `Qu'a fait ${currentDog?.name} dehors ?`}
          </Text>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[
              styles.optionCard,
              pee && (isIncident ? styles.optionCardActiveRed : styles.optionCardActiveGreen),
            ]}
            onPress={() => setPee(!pee)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  pee && (isIncident ? styles.checkboxActiveRed : styles.checkboxActiveGreen),
                ]}
              >
                {pee && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💧 Pipi</Text>
                <Text style={styles.optionHint}>
                  {isIncident ? 'À l\'intérieur' : 'À l\'extérieur'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.optionCard,
              poop && (isIncident ? styles.optionCardActiveRed : styles.optionCardActiveGreen),
            ]}
            onPress={() => setPoop(!poop)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={[
                  styles.checkbox,
                  poop && (isIncident ? styles.checkboxActiveRed : styles.checkboxActiveGreen),
                ]}
              >
                {poop && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>💩 Caca</Text>
                <Text style={styles.optionHint}>
                  {isIncident ? 'À l\'intérieur' : 'À l\'extérieur'}
                </Text>
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
                { backgroundColor: isIncident ? colors.error : colors.success },
              ]}
              onPress={handleSave}
            >
              <Text style={screenStyles.buttonPrimaryText}>
                {isIncident ? '✅ Enregistrer l\'incident' : '✅ Enregistrer la sortie'}
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
    backgroundColor: '#faf5ff',
    borderColor: '#d8b4fe',
  },
  optionCardActiveBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  optionCardActiveYellow: {
    backgroundColor: '#fffbeb',
    borderColor: '#fbbf24',
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
    backgroundColor: '#d8b4fe',
    borderColor: '#d8b4fe',
  },
  checkboxActiveBlue: {
    backgroundColor: '#bfdbfe',
    borderColor: '#bfdbfe',
  },
  checkboxActiveYellow: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
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