/**
 * Composant ProgressSection
 * Affiche la section progression avec sélection période et barre de progrès
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { homeStyles } from '../styles/homeStyles';
import { PERIODS } from '../constants/config';
import { colors } from '../constants/theme';

export function ProgressSection({
  stats,
  loading,
  selectedPeriod,
  onPeriodChange,
  progressAnim,
}) {
  return (
    <View style={homeStyles.progressContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={homeStyles.periodScroll}
      >
        {PERIODS.map((period) => (
          <TouchableOpacity
            key={period.id}
            style={[
              homeStyles.periodButton,
              selectedPeriod === period.id
                ? homeStyles.periodButtonActive
                : homeStyles.periodButtonInactive,
            ]}
            onPress={() => onPeriodChange(period.id)}
          >
            <Text
              style={[
                homeStyles.periodText,
                selectedPeriod === period.id
                  ? homeStyles.periodTextActive
                  : homeStyles.periodTextInactive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={homeStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={homeStyles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <>
          <View style={homeStyles.statsHeader}>
            <Text style={homeStyles.statsTitle}>Besoins dehors</Text>
            <Text style={homeStyles.statsPercentage}>{stats.percentage}%</Text>
          </View>

          <View style={homeStyles.progressBar}>
            <Animated.View
              style={[
                homeStyles.progressFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          <View style={homeStyles.statsLegend}>
            <View style={homeStyles.legendItem}>
              <View style={[homeStyles.legendDot, homeStyles.legendDotSuccess]} />
              <Text style={homeStyles.legendText}>{stats.outside} réussites</Text>
            </View>
            <View style={homeStyles.legendItem}>
              <View style={[homeStyles.legendDot, homeStyles.legendDotIncident]} />
              <Text style={homeStyles.legendText}>{stats.inside} accidents</Text>
            </View>
          </View>

          {stats.total > 0 ? (
            <Text style={homeStyles.encouragementText}>
              {stats.percentage >= 80
                ? '🎉 Excellent progrès !'
                : stats.percentage >= 50
                ? '💪 Bon travail, continue !'
                : '🌱 Patience, ça va venir !'}
            </Text>
          ) : (
            <Text style={homeStyles.encouragementText}>
              {selectedPeriod === 'all'
                ? 'Enregistre les besoins de ton chiot 🚀'
                : 'Aucune donnée sur cette période'}
            </Text>
          )}
        </>
      )}
    </View>
  );
}

ProgressSection.propTypes = {
  stats: PropTypes.shape({
    outside: PropTypes.number.isRequired,
    inside: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    percentage: PropTypes.number.isRequired,
  }).isRequired,
  loading: PropTypes.bool.isRequired,
  selectedPeriod: PropTypes.string.isRequired,
  onPeriodChange: PropTypes.func.isRequired,
  progressAnim: PropTypes.object.isRequired,
};
