/**
 * PremiumContent
 *
 * Composant gate qui bloque l'accès au contenu premium.
 * - Si l'utilisateur est premium → affiche le contenu enfant
 * - Si non premium → affiche un message + bouton vers le paywall
 *
 * Usage:
 *   <PremiumContent>
 *     <MyPremiumFeature />
 *   </PremiumContent>
 *
 *   <PremiumContent fallback={<Text>Upgrade pour voir les stats</Text>}>
 *     <AdvancedAnalytics />
 *   </PremiumContent>
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { useUser } from '../context/UserContext';
import { presentPaywall } from '../services/revenueCatService';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

const PremiumContent = ({ children, fallback, featureName }) => {
  const { isPremium, premiumLoading, refreshPremiumStatus } = useUser();

  // Pendant le chargement, ne rien bloquer
  if (premiumLoading) {
    return children;
  }

  // Si premium → afficher le contenu
  if (isPremium) {
    return children;
  }

  // Si fallback personnalisé fourni
  if (fallback) {
    return fallback;
  }

  // Fallback par défaut : message + bouton upgrade
  const handleUpgrade = async () => {
    const { success } = await presentPaywall();
    if (success) {
      await refreshPremiumStatus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.title}>Contenu Premium</Text>
      <Text style={styles.description}>
        {featureName
          ? `"${featureName}" est une fonctionnalité réservée aux abonnés Pro.`
          : 'Cette fonctionnalité est réservée aux abonnés Pro.'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleUpgrade}>
        <Text style={styles.buttonText}>Passer à Pro ✨</Text>
      </TouchableOpacity>
    </View>
  );
};

PremiumContent.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  featureName: PropTypes.string,
};

PremiumContent.defaultProps = {
  fallback: null,
  featureName: null,
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.pupyAccent || '#FFF8F0',
    borderRadius: borderRadius.lg,
    margin: spacing.lg,
  },
  lockIcon: {
    fontSize: 40,
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default PremiumContent;
