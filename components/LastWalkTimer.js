/**
 * Composant LastWalkTimer
 * Affiche "Dernière balade : il y a X temps"
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { EMOJI } from '../constants/config';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function LastWalkTimer({ timeSince }) {
  if (!timeSince) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {EMOJI.timer} Dernière balade : il y a {timeSince}
      </Text>
    </View>
  );
}

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

LastWalkTimer.propTypes = {
  timeSince: PropTypes.string,
};
