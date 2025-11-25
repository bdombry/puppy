// src/styles/homeStyles.js
import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fe',
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  trialBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#d97706',
  },
  content: {
    paddingHorizontal: 24,
  },
  dogCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  dogHeaderContainer: {
    marginBottom: 20,
  },
  dogHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dogAvatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dogAvatarEmoji: {
    fontSize: 40,
  },
  dogInfo: {
    marginLeft: 16,
    flex: 1,
  },
  dogName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111827',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  dogMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 88,
  },
  dogAge: {
    fontSize: 15,
    color: '#6366f1',
    fontWeight: '600',
  },
  dogMetaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  dogBreed: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  progressContainer: {
    backgroundColor: '#f8f9fe',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  periodScroll: {
    gap: 8,
    marginBottom: 16,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  periodButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  periodButtonInactive: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  periodText: {
    fontSize: 13,
    fontWeight: '700',
  },
  periodTextActive: {
    color: '#fff',
  },
  periodTextInactive: {
    color: '#6b7280',
  },
  loadingContainer: {
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  statsPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  statsLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendDotSuccess: {
    backgroundColor: '#10b981',
  },
  legendDotIncident: {
    backgroundColor: '#ef4444',
  },
  legendText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  encouragementText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsCardsRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statCardLeft: {
    marginRight: 6,
  },
  statCardRight: {
    marginLeft: 6,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconBlue: {
    backgroundColor: '#eef2ff',
  },
  statIconYellow: {
    backgroundColor: '#fef3c7',
  },
  statIcon: {
    fontSize: 24,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  statHint: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  actionButton: {
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonPrimary: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionButtonTextPrimary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonTextSecondary: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
  logoutButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOptionButton: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
  },
  modalOptionIncident: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  modalOptionSuccess: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  modalOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOptionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalOptionIconIncident: {
    backgroundColor: '#fee2e2',
  },
  modalOptionIconSuccess: {
    backgroundColor: '#d1fae5',
  },
  modalOptionIcon: {
    fontSize: 28,
  },
  modalOptionInfo: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  modalOptionDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalCancelButton: {
    marginTop: 12,
    paddingVertical: 12,
  },
  modalCancelText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});