import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../constants/theme';
import { screenStyles } from '../styles/screenStyles';

const REASON_LABELS = {
  pas_le_temps: '⏰ Pas le temps',
  trop_tard: '🌙 Horaire trop tardif',
  flemme: '😑 Flemme',
  oublie: '🤔 Oublié',
  autre: 'ℹ️ Autre',
};

/**
 * Affiche un graphique des raisons d'incident sous forme de barres horizontales
 * Exemple: ⏰ Pas le temps: ████ 8 (30%)
 */
export const IncidentReasonChart = ({ incidentReasons }) => {
  // Calculer le total
  const total = incidentReasons ? Object.values(incidentReasons).reduce((sum, val) => sum + val, 0) : 0;

  if (!incidentReasons || total === 0) {
    return (
      <View style={[screenStyles.statCard, styles.card]}>
        <Text style={[screenStyles.statLabel, styles.label]}>Raisons des incidents</Text>
        <Text style={screenStyles.emptyText}>Pas d'incidents enregistrés</Text>
      </View>
    );
  }

  // Récalculer (on l'a déjà fait, mais pour la lisibilité)
  const maxValue = Math.max(...Object.values(incidentReasons));

  return (
    <View style={[screenStyles.statCard, styles.card]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⚠️</Text>
        <Text style={[screenStyles.statLabel, styles.label]}>Raisons des incidents</Text>
      </View>

      <View style={styles.chartContainer}>
        {Object.entries(incidentReasons)
          .filter(([, count]) => count > 0)
          .sort(([, a], [, b]) => b - a)
          .map(([reason, count], index) => {
            const percentage = Math.round((count / total) * 100);
            const barWidth = (count / maxValue) * 100;

            return (
              <View key={reason} style={styles.reasonRow}>
                <Text style={styles.reasonLabel}>{REASON_LABELS[reason]}</Text>

                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: getReasonColor(reason),
                      },
                    ]}
                  >
                    <Text style={styles.barText}>{count}</Text>
                  </View>
                </View>

                <Text style={styles.percentage}>{percentage}%</Text>
              </View>
            );
          })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.totalText}>
          Total incidents: <Text style={styles.totalBold}>{total}</Text>
        </Text>
      </View>
    </View>
  );
};

const getReasonColor = (reason) => {
  const colorMap = {
    pas_le_temps: '#FF6B6B',
    trop_tard: '#4ECDC4',
    flemme: '#FFE66D',
    oublie: '#95E1D3',
    autre: '#C7CEEA',
  };
  return colorMap[reason] || colors.primary;
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    flex: 1,
  },
  chartContainer: {
    marginBottom: spacing.md,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  reasonLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
    width: '35%',
  },
  barContainer: {
    flex: 1,
    marginHorizontal: spacing.sm,
    height: 30,
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    minWidth: 30,
  },
  barText: {
    fontSize: typography.sizes.xs,
    fontWeight: '600',
    color: 'white',
  },
  percentage: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.text,
    width: '15%',
    textAlign: 'right',
  },
  footer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  totalBold: {
    fontWeight: '700',
    color: colors.text,
  },
});
