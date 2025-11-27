import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/theme';

export const onboardingStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl + 16, // Plus d'espace en haut
    paddingBottom: spacing.md,
    alignItems: 'center',
    minHeight: '100%',
  },

  // Header styles
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 75,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 23,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },

  // Features list
  features: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 22,
    color: colors.success,
    marginRight: spacing.md,
    fontWeight: '700',
  },
  featureText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    flex: 1,
    fontWeight: '500',
  },

  // Form styles
  form: {
    width: '100%',
    marginBottom: spacing.md,
  },
  formGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    fontSize: 16,
    color: colors.text,
    minHeight: 52,
  },
  inputPlaceholder: {
    color: colors.textTertiary,
  },
  dateInput: {
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.base,
    justifyContent: 'center',
    minHeight: 52,
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },

  // Button styles
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: borderRadius.base,
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDark: {
    color: colors.text,
  },
  buttonTextOutline: {
    color: colors.primary,
  },

  // Link/Helper button styles
  linkButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  linkButtonText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  skipButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  skipButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Back button - Toujours en haut, bien visible
  backButton: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },

  // Splash screen specific
  splashContainer: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    fontSize: 100,
    marginBottom: spacing.md,
  },
  splashTitle: {
    fontSize: 40,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.sm,
    lineHeight: 46,
    textAlign: 'center',
  },
  splashSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: colors.background,
    opacity: 0.9,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
  },
});
