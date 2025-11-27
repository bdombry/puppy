/**
 * Composant TrialModal
 * Modal affichée quand l'essai gratuit est terminé
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { EMOJI } from '../constants/config';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function TrialModal({ visible, dogName, onCreateAccount, onDismiss }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{EMOJI.warning}</Text>
          </View>
          <Text style={styles.title}>Essai gratuit terminé</Text>
          <Text style={styles.description}>
            Créé un compte pour continuer à suivre les progrès de {dogName} {EMOJI.dog}
          </Text>
          <TouchableOpacity
            onPress={onCreateAccount}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Créer mon compte</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Plus tard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  modal: {
    backgroundColor: colors.card,
    padding: spacing.xxxl,
    borderRadius: borderRadius.xxxl,
    width: '100%',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text,
  },
  description: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  dismissButton: {
    marginTop: spacing.base,
    paddingVertical: spacing.md,
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
});

TrialModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  dogName: PropTypes.string,
  onCreateAccount: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

TrialModal.defaultProps = {
  dogName: 'ton chiot',
};
