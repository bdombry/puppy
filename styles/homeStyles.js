// src/styles/homeStyles.js
import { StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, shadows, typography } from '../constants/theme';

export const homeStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  header: {
    paddingBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerAccountButtonRight: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.base,
  },
  headerAccountButtonLeft: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAccountButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAccountEmoji: {
    fontSize: 20,
  },
  headerSubtitle: {
    fontSize: typography.sizes.lg,
    color: colors.textSecondary,
    marginTop: spacing.md,
    fontWeight: typography.weights.medium,
  },
  trialBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  trialBadgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.warningDark,
  },
  content: {
  },
  dogCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    ...shadows.base,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  dogCardWithProgress: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxxl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.base,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  dogCardDivider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginVertical: spacing.sm,
  },
  progressSectionInCard: {
    marginTop: spacing.md,
  },
  dogHeaderContainer: {
    marginBottom: spacing.md,
  },
  dogHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dogAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  dogAvatarEmoji: {
    fontSize: 40,
  },
  dogInfo: {
    marginLeft: spacing.base,
    flex: 1,
  },
  dogName: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  dogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dogAge: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  dogMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.gray300,
    marginHorizontal: spacing.sm,
  },
  dogBreed: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  progressContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    ...shadows.small,
  },
  periodScroll: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  periodButton: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonInactive: {
    backgroundColor: colors.card,
    borderColor: colors.gray200,
  },
  periodText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  periodTextActive: {
    color: colors.white,
  },
  periodTextInactive: {
    color: colors.textSecondary,
  },
  loadingContainer: {
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statsPercentage: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.success,
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginTop: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
  },
  dividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: colors.gray200,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: borderRadius.base,
  },
  statsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  legendDotSuccess: {
    backgroundColor: colors.success,
  },
  legendDotIncident: {
    backgroundColor: colors.error,
  },
  legendText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  encouragementText: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.md,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsCardsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.base,
    ...shadows.small,
  },
  statCardLeft: {
    marginRight: spacing.sm,
  },
  statCardRight: {
    marginLeft: spacing.sm,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  statIconBlue: {
    backgroundColor: colors.primaryLight,
  },
  statIconYellow: {
    backgroundColor: colors.warningLight,
  },
  statIcon: {
    fontSize: typography.sizes.xxxl,
  },
  statValue: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  statHint: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  actionButton: {
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    ...shadows.base,
    paddingVertical: spacing.xl + spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 3,
    borderColor: colors.purpleDark,
    marginBottom: spacing.lg,
  },
  actionButtonSecondary: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.md,
  },
  actionButtonPrimaryIcon: {
    fontSize: typography.sizes.xxxl,
    marginRight: spacing.md,
  },
  actionButtonTextPrimary: {
    color: colors.white,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  actionButtonTextPrimaryBig: {
    color: colors.white,
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
  },
  actionButtonTextSecondary: {
    color: colors.text,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  logoutButton: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  logoutText: {
    color: colors.error,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.sm,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalOptionButton: {
    borderWidth: 2,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  modalOptionIncident: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  modalOptionSuccess: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  modalOptionFeeding: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  modalOptionIconIncident: {
    backgroundColor: colors.errorLight,
  },
  modalOptionIconSuccess: {
    backgroundColor: colors.successLight,
  },
  modalOptionIconFeeding: {
    backgroundColor: '#fef3c7',
  },
  modalOptionIcon: {
    fontSize: typography.sizes.xxxl,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  modalOptionDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  modalCancelButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
  },
  modalCancelText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
});