import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { screenStyles } from '../styles/screenStyles';

/**
 * Communication du chien - Deux blocs identiques au design Friandises
 * Layout: Icône à gauche + Contenu à droite
 */
export const DogCommunicationStats = ({ activitiesAsked, totalActivities, successWithDemand, outingsAsked, totalSuccesses, dogName = 'chien' }) => {
  console.log('🗣️ DogCommunicationStats reçu:', { activitiesAsked, totalActivities, successWithDemand, outingsAsked, totalSuccesses });
  
  // Si pas de données
  if (!totalActivities || totalActivities === 0) {
    console.log('⚠️ Pas de données: totalActivities =', totalActivities);
    return null;
  }

  const activitiesPercentage = Math.round((activitiesAsked / totalActivities) * 100);
  console.log('✅ Rendu DogCommunicationStats avec percentage:', activitiesPercentage);
  console.log('🚪 Deuxième bloc - outingsAsked:', outingsAsked, 'totalSuccesses:', totalSuccesses);

  return (
    <View>
      {/* Bloc 1: Balades demandées */}
      <View style={styles.insightCard}>
        <View style={styles.insightIcon}>
          <Text style={{ fontSize: 32 }}>🗣️</Text>
        </View>
        <View style={styles.insightContent}>
          <Text style={screenStyles.statValue}>{activitiesPercentage}%</Text>
          <Text style={styles.insightLabel}>des balades demandées</Text>
          <Text style={styles.insightSubtext}>
            {activitiesAsked} sur {totalActivities} balades
          </Text>
        </View>
      </View>

      {/* Bloc 2: Réussites demandées */}
      <View style={styles.insightCard}>
        <View style={styles.insightIcon}>
          <Text style={{ fontSize: 32 }}>🚪</Text>
        </View>
        <View style={styles.insightContent}>
          <Text style={screenStyles.statValue}>{successWithDemand || 0}%</Text>
          <Text style={styles.insightLabel}>des réussites demandées</Text>
          <Text style={styles.insightSubtext}>
            {outingsAsked || 0} sur {totalSuccesses || 0} réussites
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.base,
  },
  insightIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  insightSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
});
