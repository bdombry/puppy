/**
 * Screen Styles - Styles centralisés pour tous les écrans
 * Assure une cohérence visuelle uniforme sur toute l'app
 */

import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';

export const screenStyles = StyleSheet.create({
  // ===== CONTAINERS =====
  screenContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 60,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
  },
  screenContent: {
    flex: 1,
  },
  
  // ===== HEADERS =====
  screenHeader: {
    marginBottom: spacing.xl,
  },
  screenTitle: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.sm,
  },
  screenSubtitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
  },

  // ===== CARDS & CONTAINERS =====
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionContent: {
    gap: spacing.md,
  },

  // ===== FORM ELEMENTS =====
  formGroup: {
    paddingVertical: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  valueBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
  },
  value: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.normal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray200,
    marginVertical: spacing.sm,
  },

  // ===== TABS =====
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },

  // ===== EMPTY/LOADING STATES =====
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===== BADGES & STATS =====
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // ===== BUTTONS =====
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  buttonPrimary: {
    flex: 1,
    backgroundColor: colors.primary,
    ...shadows.base,
  },
  buttonPrimaryText: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  buttonSecondaryText: {
    color: colors.gray600,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  buttonDanger: {
    backgroundColor: colors.errorLight,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.lg,
  },
  buttonDangerText: {
    color: colors.error,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },

  // ===== ICONS & AVATARS =====
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.base,
  },
  avatarEmoji: {
    fontSize: 56,
  },
  iconSmall: {
    fontSize: 18,
  },
  iconMedium: {
    fontSize: 24,
  },
  iconLarge: {
    fontSize: 32,
  },
});
