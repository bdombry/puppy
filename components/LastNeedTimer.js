/**
 * Composant LastNeedTimer
 * Affiche le dernier besoin enregistré (pipi ou caca)
 * Format: "Dernier besoin : il y a 2h 15m 💧"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function LastNeedTimer({ lastNeedTime }) {
  if (!lastNeedTime) return null;

  return (
    
    <View style={styles.container}>
        <Text style={styles.text}>Dernier besoin : {lastNeedTime}</Text>
      </View>
  );
}

LastNeedTimer.propTypes = {
  lastNeedTime: PropTypes.string,
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

