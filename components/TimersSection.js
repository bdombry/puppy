/**
 * Composant TimersSection
 * Affiche deux timers:
 * - Dernière balade (promenade)
 * - Dernier besoin (pipi/caca)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { EMOJI } from '../constants/config';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function TimersSection({ lastOuting, lastNeed }) {
  if (!lastOuting && !lastNeed) return null;

  return (
    <View style={styles.container}>
      {lastOuting && (
        <View style={styles.timerBox}>
          <Text style={styles.text}>
            🚶 Dernière balade : il y a {lastOuting}
          </Text>
        </View>
      )}
      
      {lastNeed && (
        <View style={[styles.timerBox, styles.timerBoxSecondary]}>
          <Text style={[styles.text, styles.textSecondary]}>
            � Dernier besoin : il y a {lastNeed}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  timerBox: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  timerBoxSecondary: {
    backgroundColor: colors.successLight,
  },
  text: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  textSecondary: {
    color: colors.success,
  },
});

TimersSection.propTypes = {
  lastOuting: PropTypes.string,
  lastNeed: PropTypes.string,
};

TimersSection.defaultProps = {
  lastOuting: null,
  lastNeed: null,
};
