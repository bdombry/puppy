/**
 * Composant LastPeeTimer
 * Affiche le dernier pipi enregistré
 * Format: "Dernier pipi : il y a 2h 15m 💧"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function LastPeeTimer({ lastPeeTime }) {
  if (!lastPeeTime) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Dernier pipi : aucun enregistrement 💧</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dernier pipi : {lastPeeTime} 💧</Text>
    </View>
  );
}

LastPeeTimer.propTypes = {
  lastPeeTime: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
