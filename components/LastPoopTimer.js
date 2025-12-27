/**
 * Composant LastPoopTimer
 * Affiche le dernier caca enregistré
 * Format: "Dernier caca : il y a 2h 15m 💩"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function LastPoopTimer({ lastPoopTime }) {
  if (!lastPoopTime) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Dernier caca : aucun enregistrement 💩</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Dernier caca : {lastPoopTime} 💩</Text>
    </View>
  );
}

LastPoopTimer.propTypes = {
  lastPoopTime: PropTypes.string,
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
