import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getLast7DaysStats } from '../services/chartService';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export const WeekChart = ({ dogId, isGuestMode }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayKey, setSelectedDayKey] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const stats = await getLast7DaysStats(dogId, isGuestMode);
      setData(stats);
      setLoading(false);
    };

    if (dogId) {
      fetchData();
    }
  }, [dogId, isGuestMode]);

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

  // Obtenir la date d'aujourd'hui normalisée
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  // INVERSER : aujourd'hui à gauche
  const chartData = [...data].reverse();

  // Trouver le max pour normaliser les hauteurs
  const maxTotal = Math.max(...data.map(d => d.total || 0), 1);
  const MAX_BAR_HEIGHT = 120;

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
          const dayDate = new Date(day.date);
          const shortDayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
          
          // Calculer les hauteurs - VERT EN BAS (base)
          const totalHeight = day.total > 0 ? (day.total / maxTotal) * MAX_BAR_HEIGHT : 0;
          const outsideHeight = day.total > 0 ? (day.outside / day.total) * totalHeight : 0;
          const insideHeight = totalHeight - outsideHeight;

          return (
            <View key={day.dayKey} style={styles.dayColumn}>
              {/* Barre empilée */}
              <TouchableOpacity 
                style={styles.barContainer}
                onPress={() => handleBarPress(day.dayKey)}
                activeOpacity={0.7}
              >
                {totalHeight > 0 ? (
                  <View style={[styles.bar, { height: totalHeight }]}>
                    {/* Partie GRISE (inside) EN HAUT */}
                    {insideHeight > 0 && (
                      <View style={[styles.barSegment, styles.barInside, { height: insideHeight }]} />
                    )}
                    {/* Partie VERTE (outside) EN BAS = BASE */}
                    {outsideHeight > 0 && (
                      <View style={[styles.barSegment, styles.barOutside, { height: outsideHeight }]} />
                    )}
                  </View>
                ) : (
                  <View style={styles.barEmpty} />
                )}

                {/* Pourcentage au-dessus SI SÉLECTIONNÉ */}
                {isSelected && day.total > 0 && (
                  <View style={styles.percentageBadge}>
                    <Text style={styles.percentageText}>{day.percentage}%</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Label du jour */}
              <View style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                <Text style={[styles.dayText, isToday && styles.dayTextToday]}>
                  {shortDayName.charAt(0).toUpperCase() + shortDayName.slice(1, 3)}
                </Text>
                {isToday && <View style={styles.todayDot} />}
              </View>
            </View>
          );
        })}
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotSuccess]} />
          <Text style={styles.legendText}>Dehors</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotIncident]} />
          <Text style={styles.legendText}>Dedans</Text>
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

    marginBottom: spacing.xl,
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
  bar: {
    width: 32,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...shadows.small,
  },
  barEmpty: {
    width: 32,
    height: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.gray200,
  },
  barSegment: {
    width: '100%',
  },
  barOutside: {
    backgroundColor: colors.success,
  },
  barInside: {
    backgroundColor: colors.gray300,
  },
  percentageBadge: {
    position: 'absolute',
    top: -28,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    minWidth: 40,
    alignItems: 'center',
    ...shadows.small,
  },
  percentageText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
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
    fontWeight: typography.weights.bold,
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
    backgroundColor: colors.gray300,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
});

WeekChart.propTypes = {
  dogId: PropTypes.string,
  isGuestMode: PropTypes.bool,
};

WeekChart.defaultProps = {
  dogId: null,
  isGuestMode: false,
};