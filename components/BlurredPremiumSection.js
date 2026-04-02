/**
 * BlurredPremiumSection
 * 
 * Enveloppe un contenu pour le flouter avec un overlay "Premium"
 * Le titre reste visible en haut.
 * 
 * Usage:
 *   <BlurredPremiumSection 
 *     title="Insights 💡"
 *     message="Statistiques avancées"
 *     onPress={() => presentSoftPaywall()}
 *     isPremium={false}
 *   >
 *     <View>Contenu premium</View>
 *   </BlurredPremiumSection>
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { colors, spacing, borderRadius, typography } from '../constants/theme';
import { screenStyles } from '../styles/screenStyles';

const BlurredPremiumSection = ({ 
  children, 
  title,
  message = 'Fonctionnalité Premium',
  onPress,
  isPremium = false,
  blurIntensity = 0.25
}) => {
  // Si premium, afficher sans blur
  if (isPremium) {
    return (
      <View style={screenStyles.section}>
        {title && <Text style={screenStyles.sectionTitle}>{title}</Text>}
        <View>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={screenStyles.section}>
      {title && <Text style={screenStyles.sectionTitle}>{title}</Text>}
      
      <View style={styles.blurredContainer}>
        <View style={[styles.blurredContent, { opacity: 0.55 }]}>
          {children}
        </View>

        <View style={styles.overlay}>
          <View style={styles.contentBox}>
            <Text style={styles.lockIcon}>🔒</Text>
            <Text style={styles.message}>{message}</Text>
            
            {onPress && (
              <TouchableOpacity 
                style={styles.button}
                onPress={onPress}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Déverrouiller Pro</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

BlurredPremiumSection.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  onPress: PropTypes.func,
  isPremium: PropTypes.bool,
  blurIntensity: PropTypes.number,
};

BlurredPremiumSection.defaultProps = {
  title: null,
  message: 'Fonctionnalité Premium',
  onPress: null,
  isPremium: false,
  blurIntensity: 0.25,
};

const styles = StyleSheet.create({
  blurredContainer: {
    position: 'relative',
  },
  blurredContent: {
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  contentBox: {
    backgroundColor: colors.primary,
    padding: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    minWidth: '75%',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: spacing.base,
    color: colors.white,
  },
  message: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  button: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    minWidth: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: typography.sizes.base,
  },
});

export default BlurredPremiumSection;
