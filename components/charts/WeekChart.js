// src/components/charts/WeekChart.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getLast7DaysStats } from '../services/chartService';

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
        <Text style={styles.title}>📊 Évolution sur 7 jours</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.total), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Évolution sur 7 jours</Text>

      {data.every(d => d.total === 0) ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Pas encore de données cette semaine</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartContainer}>
            {data.map((day, index) => {
              const heightRatio = maxTotal > 0 ? day.total / maxTotal : 0;
              const barHeight = Math.max(heightRatio * 100, 4);
              const outsideHeight = day.total > 0 ? (day.outside / day.total) * 100 : 0;

              const isToday = index === data.length - 1;

              return (
                <View key={day.dayKey} style={styles.barContainer}>
                  {/* Barre */}
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: barHeight },
                        isToday && styles.barToday,
                      ]}
                    >
                      {/* Partie "dehors" (vert) */}
                      <View
                        style={[
                          styles.barOutside,
                          { height: `${outsideHeight}%` },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Pourcentage si > 0 */}
                  {day.total > 0 && (
                    <Text style={styles.percentage}>{day.percentage}%</Text>
                  )}

                  {/* Label du jour */}
                  <Text style={[styles.label, isToday && styles.labelToday]}>
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Légende */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
              <Text style={styles.legendText}>Dehors</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#e5e7eb' }]} />
              <Text style={styles.legendText}>Dedans</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  loadingContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    marginBottom: 16,
    paddingBottom: 4,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    paddingHorizontal: 2,
  },
  bar: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    minHeight: 4,
  },
  barToday: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  barOutside: {
    width: '100%',
    backgroundColor: '#10b981',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  percentage: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
  },
  label: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  labelToday: {
    color: '#6366f1',
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});