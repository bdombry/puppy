import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getIncidentReasons } from '../services/analyticsService';
import { colors, spacing, borderRadius, typography, shadows } from '../../constants/theme';
import { screenStyles } from '../../styles/screenStyles';

const REASON_LABELS = {
  pas_le_temps: 'Pas le temps',
  trop_tard: 'Horaire trop tardif',
  flemme: 'Flemme',
  oublie: 'Oublié',
  autre: 'Autre',
};

const PIE_RADIUS = 70;
const PIE_CENTER_X = 100;
const PIE_CENTER_Y = 100;

/**
 * Affiche un graphique des raisons d'incident sous forme de camembert
 * Utilise react-native-svg pour un rendu simple et performant
 * Met à jour les données toutes les 5 secondes
 */
export const IncidentReasonChart = ({ dogId }) => {
  const [incidentReasons, setIncidentReasons] = useState({
    pas_le_temps: 0,
    trop_tard: 0,
    flemme: 0,
    oublie: 0,
    autre: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial et quand dogId change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const reasons = await getIncidentReasons(dogId);
      setIncidentReasons(reasons);
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
        const reasons = await getIncidentReasons(dogId);
        setIncidentReasons(reasons);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [dogId]);

  // Calculer le total
  const total = incidentReasons ? Object.values(incidentReasons).reduce((sum, val) => sum + val, 0) : 0;

  // ⚠️ Les hooks DOIVENT être appelés avant les retours conditionnels!
  // Préparer les données pour le camembert
  const chartData = useMemo(() => {
    if (!incidentReasons || total === 0) {
      return [];
    }
    return Object.entries(incidentReasons)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([reason, count]) => ({
        x: REASON_LABELS[reason],
        y: count,
        reason,
        color: getReasonColor(reason),
      }));
  }, [incidentReasons, total]);

  // Générer les segments SVG
  const segments = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    let currentAngle = -90; // Commencer en haut
    
    return chartData.map((item) => {
      const sliceAngle = (item.y / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      
      const segment = createPieSegment(startAngle, endAngle, PIE_RADIUS, item.color);
      currentAngle = endAngle;
      
      return (
        <Path
          key={item.reason}
          d={segment}
          fill={item.color}
          stroke={colors.white}
          strokeWidth={1}
        />
      );
    });
  }, [chartData, total]);

  if (loading) {
    return (
      <View style={[screenStyles.infoCard, styles.chartCard]}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚠️</Text>
          <Text style={screenStyles.sectionTitle}>Raisons des incidents</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  if (!incidentReasons || total === 0) {
    return (
      <View style={[screenStyles.infoCard, styles.chartCard]}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>⚠️</Text>
          <Text style={screenStyles.sectionTitle}>Raisons des incidents</Text>
        </View>
        <Text style={screenStyles.emptyText}>Pas d'incidents enregistrés</Text>
      </View>
    );
  }

  return (
    <View style={[screenStyles.infoCard, styles.chartCard]}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>⚠️</Text>
        <Text style={screenStyles.sectionTitle}>Raisons des incidents</Text>
      </View>

      <View style={styles.chartContent}>
        {/* Camembert SVG */}
        <Svg width={200} height={200} viewBox="0 0 200 200" style={styles.pieWrapper}>
          {segments}
        </Svg>

        {/* Légende */}
        <View style={styles.legend}>
          {chartData.map((item) => (
            <View key={item.reason} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <View style={styles.legendText}>
                <Text style={styles.legendLabel}>{item.x}</Text>
                <Text style={styles.legendValue}>
                  {item.y} ({Math.round((item.y / total) * 100)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total incidents:</Text>
          <Text style={styles.totalValue}>{total}</Text>
        </View>
      </View>
    </View>
  );
};

/**
 * Crée un segment de camembert SVG
 */
const createPieSegment = (startAngle, endAngle, radius, color) => {
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = PIE_CENTER_X + radius * Math.cos(startRad);
  const y1 = PIE_CENTER_Y + radius * Math.sin(startRad);
  const x2 = PIE_CENTER_X + radius * Math.cos(endRad);
  const y2 = PIE_CENTER_Y + radius * Math.sin(endRad);

  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${PIE_CENTER_X} ${PIE_CENTER_Y}`,
    `L ${x1} ${y1}`,
    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
    'Z',
  ].join(' ');
};

const getReasonColor = (reason) => {
  const colorMap = {
    pas_le_temps: colors.error,      // Rouge
    trop_tard: colors.warning,       // Amber
    flemme: colors.info,             // Bleu
    oublie: colors.purple,           // Purple
    autre: colors.gray400,           // Gris
  };
  return colorMap[reason] || colors.primary;
};

IncidentReasonChart.propTypes = {
  dogId: PropTypes.string.isRequired,
};

const styles = StyleSheet.create({
  chartCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  headerIcon: {
    fontSize: typography.sizes.xxxl,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.base,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  chartContent: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  pieWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    flex: 1,
    minWidth: 120,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.base,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
    flexShrink: 0,
  },
  legendText: {
    flex: 1,
  },
  legendLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  legendValue: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
  },
  totalLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
});
