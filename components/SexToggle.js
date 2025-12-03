import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export default function SexToggle({ value, onValueChange, disabled = false }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          value === 'female' && styles.buttonActive,
        ]}
        onPress={() => !disabled && onValueChange('female')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, value === 'female' && styles.buttonTextActive]}>
          ♀️ Femelle
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          value === 'male' && styles.buttonActive,
        ]}
        onPress={() => !disabled && onValueChange('male')}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, value === 'male' && styles.buttonTextActive]}>
          ♂️ Mâle
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.base,
    marginVertical: spacing.base,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  buttonTextActive: {
    color: colors.white,
  },
});