import React from 'react';
import { View } from 'react-native';
import { colors, spacing } from '../constants/theme';

export const OnboardingProgressBar = ({ current, total, percent }) => {
  const progress = typeof percent === 'number' ? percent : (current / total) * 100;

  return (
    <View
      style={{
        height: 6,
        backgroundColor: 'transparent',
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        marginHorizontal: spacing.base,
        borderWidth: 1.5,
        borderColor: '#F2A43B',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${Math.max(0, Math.min(100, progress))}%`,
          backgroundColor: '#F2A43B',
          borderRadius: 3,
        }}
      />
    </View>
  );
};
