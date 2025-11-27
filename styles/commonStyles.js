/**
 * Styles réutilisables dans toute l'app
 * Cards, boutons, loaders, etc.
 */

import { StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export const commonStyles = StyleSheet.create({
  // ===== CARDS =====
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSmall: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ===== BOUTONS =====
  buttonPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimaryLarge: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.gray100,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  buttonTextSecondary: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },

  // ===== TEXTES =====
  h1: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
  },
  h2: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  h3: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  h4: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  bodyLarge: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.normal,
    color: colors.text,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.normal,
    color: colors.text,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.normal,
    color: colors.textSecondary,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  hint: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.normal,
    color: colors.textTertiary,
  },

  // ===== LOADERS =====
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // ===== MODAL =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHandle: {
    width: 48,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray300,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  // ===== SÉPARATEURS =====
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.base,
  },
  dividerLarge: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // ===== CONTAINERS =====
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== INPUTS =====
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },

  // ===== BADGES =====
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },

  // ===== PROGRESS BAR =====
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginVertical: spacing.base,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.sm,
  },
});
