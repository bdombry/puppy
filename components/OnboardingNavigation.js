import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';

export const OnboardingNavigation = ({ 
  onNext, 
  onPrev, 
  showPrev = true,
  showNext = true,
  disablePrev = false,
  disableNext = false 
}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.base,
        paddingVertical: spacing.base,
        backgroundColor: colors.pupyBackground,
      }}
    >
      {/* Previous Button */}
      {showPrev ? (
        <TouchableOpacity
          onPress={onPrev}
          disabled={disablePrev}
          style={{
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.base,
            opacity: disablePrev ? 0.4 : 1,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            ← Retour
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.base }} />
      )}

      {/* Next Button */}
      {showNext ? (
        <TouchableOpacity
          onPress={onNext}
          disabled={disableNext}
          style={{
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.base,
            opacity: disableNext ? 0.4 : 1,
          }}
        >
          <Text
            style={{
              fontSize: typography.sizes.base,
              fontWeight: '600',
              color: colors.primary,
            }}
          >
            Suivant →
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={{ paddingVertical: spacing.sm, paddingHorizontal: spacing.base }} />
      )}
    </View>
  );
};
