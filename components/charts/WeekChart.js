import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getLast7DaysStats } from '../services/chartService';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export const WeekChart = ({ dogId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const stats = await getLast7DaysStats(dogId);
      setData(stats);
      setLoading(false);
    };

    if (dogId) {
      fetchData();
    }
  }, [dogId]);

  // Refetch toutes les 5 secondes pour voir les changements en temps réel
  useEffect(() => {
    const interval = setInterval(async () => {
      if (dogId) {
        const stats = await getLast7DaysStats(dogId);
        setData(stats);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dogId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des données...</Text>
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Pas encore de données cette semaine</Text>
          <Text style={styles.emptySubtext}>Enregistre des sorties pour voir l'évolution</Text>
        </View>
      </View>
    );
  }

  // Obtenir la date d'aujourd'hui normalisée en UTC
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  // INVERSER : aujourd'hui à gauche
  const chartData = [...data].reverse();

  // Hauteur fixe pour toutes les barres
  const BAR_HEIGHT = 120;

  const handleBarPress = (dayKey) => {
    setSelectedDayKey(selectedDayKey === dayKey ? null : dayKey);
  };

  return (
    <View style={styles.container}>
      {/* Header simple */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Evolution 7 jours</Text>
      </View>

      {/* Graphique */}
      <View style={styles.chartArea}>
        {chartData.map((day) => {
          const isToday = day.dayKey === todayString;
          const isSelected = selectedDayKey === day.dayKey;
          const dayDate = new Date(day.dayKey);
          const shortDayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          // Calculer les pourcentages de remplissage
          const successPercentage = day.total > 0 ? (day.outside / day.total) * 100 : 0;
          const incidentPercentage = day.total > 0 ? (day.inside / day.total) * 100 : 0;

          return (
            <View key={day.dayKey} style={styles.dayColumn}>
              {/* Barre de progression avec conteneur gris */}
              <TouchableOpacity 
                style={styles.barContainer}
                onPress={() => handleBarPress(day.dayKey)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.barBackground,
                  day.total === 0 && { backgroundColor: colors.gray200 }
                ]}>
                  {/* Remplissage : VERT (success) EN BAS */}
                  <View style={[styles.barFill, { height: `${successPercentage}%` }, styles.barSuccess]} />
                </View>

                {/* Pourcentage au-dessus SI SÉLECTIONNÉ */}
                {isSelected && (
                  <View style={styles.percentageBadge}>
                    {day.total > 0 ? (
                      <Text style={styles.percentageText} numberOfLines={1}>{`${day.percentage}%`}</Text>
                    ) : (
                      <Text style={styles.percentageText}>Pas de données</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>

              {/* Label du jour */}
              <View style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>
                  {shortDayName.charAt(0).toUpperCase() + shortDayName.slice(1, 3)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotSuccess]} />
          <Text style={styles.legendText}>Dehors (réussi)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotIncident]} />
          <Text style={styles.legendText}>Incidents</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    paddingRight: spacing.md,
    paddingLeft : spacing.md,

    marginBottom: spacing.sm,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  
  // Loading & Empty
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Header simple
  header: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },

  // Chart
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    position: 'relative',
  },
  barBackground: {
    width: 32,
    height: 120,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.gray300,
    justifyContent: 'flex-end',
    ...shadows.small,
  },
  barFill: {
    width: '100%',
  },
  barSuccess: {
    backgroundColor: colors.success,
  },
  barIncident: {
    backgroundColor: colors.danger,
  },
  percentageBadge: {
    position: 'absolute',
    top: -32,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  percentageText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
    textAlign: 'center',
  },

  // Day labels
  dayLabel: {
    marginTop: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray100,
    minWidth: 36,
    alignItems: 'center',
    height: 24,
  },
  dayLabelToday: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  dayTextToday: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.sm,
  },
  legendDotSuccess: {
    backgroundColor: colors.success,
  },
  legendDotIncident: {
    backgroundColor: colors.danger,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
});

WeekChart.propTypes = {
  dogId: PropTypes.number,
};

WeekChart.defaultProps = {
  dogId: null,
};