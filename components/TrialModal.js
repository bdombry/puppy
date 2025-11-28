/**
 * Composant TrialModal
 * Modal affichée quand l'essai gratuit est terminé
 * Permet de créer un compte et migrer les données locales
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { EMOJI } from '../constants/config';
import { colors, spacing, borderRadius, typography } from '../constants/theme';

export function TrialModal({ 
  visible, 
  dogName, 
  onEmailSignUp,
  onAppleSignUp,
  onGoogleSignUp,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.modal}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{EMOJI.warning}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>Essai gratuit terminé</Text>

            {/* Description */}
            <Text style={styles.description}>
              Créé un compte pour continuer à suivre les progrès de {dogName} {EMOJI.dog}
            </Text>

            {/* Warning message */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ Toutes vos données (chien et promenades) seront migrées automatiquement
              </Text>
            </View>

            {/* Sign up buttons */}
            <View style={styles.buttonsContainer}>
              {/* Email */}
              <TouchableOpacity
                onPress={onEmailSignUp}
                style={[styles.button, styles.emailButton]}
              >
                <Text style={styles.emailIcon}>{EMOJI.email}</Text>
                <Text style={styles.buttonText}>Créer avec email</Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                onPress={onAppleSignUp}
                style={[styles.button, styles.appleButton]}
              >
                <Text style={styles.socialIcon}>{EMOJI.apple}</Text>
                <Text style={styles.socialButtonText}>Continuer avec Apple</Text>
              </TouchableOpacity>

              {/* Google */}
              <TouchableOpacity
                onPress={onGoogleSignUp}
                style={[styles.button, styles.googleButton]}
              >
                <Text style={styles.socialIcon}>{EMOJI.google}</Text>
                <Text style={styles.socialButtonText}>Continuer avec Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
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
  },
  scrollContent: {
    padding: spacing.xxl,
    justifyContent: 'center',
    minHeight: '100%',
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
    backgroundColor: colors.errorLight,
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
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: colors.warningLight,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    padding: spacing.lg,
    borderRadius: borderRadius.base,
    marginBottom: spacing.xl,
  },
  warningText: {
    fontSize: typography.sizes.sm,
    color: colors.warningDark,
    fontWeight: typography.weights.semibold,
    lineHeight: 18,
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emailButton: {
    backgroundColor: colors.primary,
  },
  appleButton: {
    backgroundColor: colors.gray900,
  },
  googleButton: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  emailIcon: {
    fontSize: 18,
    marginRight: spacing.base,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: spacing.base,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  socialButtonText: {
    color: colors.gray900,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
});

TrialModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  dogName: PropTypes.string,
  onEmailSignUp: PropTypes.func.isRequired,
  onAppleSignUp: PropTypes.func.isRequired,
  onGoogleSignUp: PropTypes.func.isRequired,
};

TrialModal.defaultProps = {
  dogName: 'ton chiot',
};
