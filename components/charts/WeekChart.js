import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getLast7DaysStats } from '../services/chartService';
import { colors, spacing, borderRadius, shadows } from '../../constants/theme';

export const WeekChart = ({ dogId, isGuestMode }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📊 Pas encore de données cette semaine</Text>
        </View>
      </View>
    );
  }

  // Obtenir la date d'aujourd'hui normalisée
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];

  // Inverser les données pour afficher aujourd'hui à gauche
  const reversedData = [...data].reverse();

  // Trouver le jour avec le plus de sorties pour la hauteur max
  const maxTotal = Math.max(...data.map(d => d.total || 0), 1);
  const MAX_HEIGHT = 100;

  return (
    <View style={styles.container}>
      {/* Graphique */}
      <View style={styles.chartContainer}>
        {reversedData.map((day) => {
          const isToday = day.dayKey === todayString;
          const dayDate = new Date(day.date);
          const shortDayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
          const dayNumber = dayDate.getDate();

          const heightRatio = day.total > 0 ? day.total / maxTotal : 0;
          const barHeight = heightRatio * MAX_HEIGHT;
          const greenHeight = day.total > 0 ? (day.outside / day.total) * barHeight : 0;
          const percentage = day.percentage || 0;

          return (
            <View 
              key={day.dayKey} 
              style={[
                styles.dayColumn,
                isToday && styles.dayColumnToday
              ]}
            >
              {/* Barre verte et grise brutes */}
              {barHeight > 0 && (
                <View style={[styles.bar, { height: barHeight }, isToday && styles.barToday]}>
                  {greenHeight > 0 && (
                    <View 
                      style={[
                        styles.barGreen, 
                        { height: greenHeight, width: '100%' }
                      ]} 
                    />
                  )}
                  {(barHeight - greenHeight) > 0 && (
                    <View 
                      style={{
                        height: barHeight - greenHeight,
                        width: '100%',
                        backgroundColor: '#e5e7eb',
                      }} 
                    />
                  )}
                </View>
              )}

              {/* Pourcentage */}
              {percentage > 0 && (
                <Text style={[
                  styles.percentage,
                  isToday && styles.percentageToday
                ]}>
                  {percentage}%
                </Text>
              )}

              {/* Jour et date */}
              <Text style={[
                styles.dayName,
                isToday && styles.dayNameToday
              ]}>
                {shortDayName.charAt(0).toUpperCase() + shortDayName.slice(1)}
              </Text>
              <Text style={[
                styles.dayNumber,
                isToday && styles.dayNumberToday
              ]}>
                {dayNumber}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Légende */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Dehors</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: colors.gray200 }]} />
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
    marginBottom: spacing.xl,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    gap: 6,
    paddingBottom: 12,
    marginBottom: 12,
  },
  dayColumn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray150,
  },
  dayColumnToday: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  bar: {
    width: '70%',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    minHeight: 2,
  },
  barToday: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  barGreen: {
    backgroundColor: colors.success,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: 6,
    marginBottom: 4,
  },
  percentageToday: {
    color: colors.primary,
    fontWeight: '800',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dayNameToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray400,
    marginTop: 2,
  },
  dayNumberToday: {
    color: colors.primary,
    fontSize: 14,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
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
