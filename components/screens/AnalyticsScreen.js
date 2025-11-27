import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { useNavigation } from '@react-navigation/native';
import { getAdvancedStats } from '../services/analyticsService';
import { WeekChart } from '../../components/charts/WeekChart';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export default function AnalyticsScreen() {
  const { currentDog, isGuestMode } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [currentDog]);

  const loadStats = async () => {
    if (!currentDog?.id) return;
    setLoading(true);
    const data = await getAdvancedStats(currentDog.id, isGuestMode);
    setStats(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop, styles.centerContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyse des données...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop, styles.centerContainer]}>
        <Text style={styles.emptyIcon}>📊</Text>
        <Text style={styles.emptyText}>Pas encore de données à analyser</Text>
      </View>
    );
  }

  return (
    <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Analytics 📊</Text>
        <Text style={styles.subtitle}>Analyse détaillée des progrès de {currentDog.name}</Text>

        {/* Graphique 7 jours */}
        <WeekChart dogId={currentDog.id} isGuestMode={isGuestMode} />

        {/* Stats grid */}
        <View style={styles.grid}>
          {/* Total */}
          <View style={[styles.statCard, styles.statCardFull]}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total enregistrements</Text>
          </View>

          {/* Pipi vs Caca */}
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={styles.statValue}>{stats.peeCount}</Text>
            <Text style={styles.statLabel}>Pipis</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💩</Text>
            <Text style={styles.statValue}>{stats.poopCount}</Text>
            <Text style={styles.statLabel}>Cacas</Text>
          </View>
        </View>

        {/* Taux de réussite par type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taux de réussite par type</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>💧 Pipi</Text>
              <Text style={styles.progressValue}>{stats.peeSuccessRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.peeSuccessRate}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.peeOutside} dehors • {stats.peeInside} dedans
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>💩 Caca</Text>
              <Text style={styles.progressValue}>{stats.poopSuccessRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.poopSuccessRate}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.poopOutside} dehors • {stats.poopInside} dedans
            </Text>
          </View>
        </View>

        {/* Friandises */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récompenses 🍬</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Text style={{ fontSize: 32 }}>🍬</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={styles.insightValue}>{stats.treatPercentage}%</Text>
              <Text style={styles.insightLabel}>des sorties récompensées</Text>
              <Text style={styles.insightSubtext}>
                {stats.treatGiven} friandises données
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights 💡</Text>

          {/* Tendance */}
          {stats.trend && (
            <View style={[
              styles.insightCard, 
              { backgroundColor: stats.trend === 'improving' ? '#f0fdf4' : stats.trend === 'declining' ? '#fef2f2' : '#f3f4f6' }
            ]}>
              <View style={[
                styles.insightIcon, 
                { backgroundColor: stats.trend === 'improving' ? '#d1fae5' : stats.trend === 'declining' ? '#fee2e2' : '#e5e7eb' }
              ]}>
                <Text style={{ fontSize: 32 }}>
                  {stats.trend === 'improving' ? '📈' : stats.trend === 'declining' ? '📉' : '➡️'}
                </Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Tendance 7 jours</Text>
                <Text style={styles.insightValue}>
                  {stats.trend === 'improving' ? 'En amélioration' : stats.trend === 'declining' ? 'En baisse' : 'Stable'}
                </Text>
                <Text style={styles.insightSubtext}>
                  {stats.trend === 'improving' ? 'Super ! Continue comme ça' : stats.trend === 'declining' ? 'Augmente la fréquence des sorties' : 'Maintiens le rythme'}
                </Text>
              </View>
            </View>
          )}

          {/* Heure à risque */}
          {stats.mostFrequentIncidentHour && (
            <View style={[styles.insightCard, { backgroundColor: '#fef2f2' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 32 }}>⏰</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Heure à risque</Text>
                <Text style={styles.insightValue}>Vers {stats.mostFrequentIncidentHour}h</Text>
                <Text style={styles.insightSubtext}>
                  Le plus d'incidents à cette heure
                </Text>
              </View>
            </View>
          )}

          {/* Meilleure heure */}
          {stats.mostFrequentSuccessHour && (
            <View style={[styles.insightCard, { backgroundColor: '#f0fdf4' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#d1fae5' }]}>
                <Text style={{ fontSize: 32 }}>⭐</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Meilleure heure</Text>
                <Text style={styles.insightValue}>Vers {stats.mostFrequentSuccessHour}h</Text>
                <Text style={styles.insightSubtext}>
                  Le plus de réussites à cette heure
                </Text>
              </View>
            </View>
          )}

          {/* Temps moyen entre sorties */}
          {stats.avgTimeBetweenOutings && (
            <View style={[styles.insightCard, { backgroundColor: '#eff6ff' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#dbeafe' }]}>
                <Text style={{ fontSize: 32 }}>⏱️</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Fréquence moyenne</Text>
                <Text style={styles.insightValue}>{stats.avgTimeBetweenOutings}h</Text>
                <Text style={styles.insightSubtext}>
                  Entre chaque sortie
                </Text>
              </View>
            </View>
          )}

          {/* Record de jours propres */}
          {stats.maxStreak > 0 && (
            <View style={[styles.insightCard, { backgroundColor: '#fef3c7' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#fde68a' }]}>
                <Text style={{ fontSize: 32 }}>🏅</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Record</Text>
                <Text style={styles.insightValue}>{stats.maxStreak} jour{stats.maxStreak > 1 ? 's' : ''}</Text>
                <Text style={styles.insightSubtext}>
                  Consécutifs sans incident
                </Text>
              </View>
            </View>
          )}

          {/* Ratio pipi/caca */}
          {stats.peeVsPoopRatio && (
            <View style={[styles.insightCard, { backgroundColor: '#faf5ff' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#e9d5ff' }]}>
                <Text style={{ fontSize: 32 }}>📊</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Ratio Pipi/Caca</Text>
                <Text style={styles.insightValue}>{stats.peeVsPoopRatio}:1</Text>
                <Text style={styles.insightSubtext}>
                  {stats.peeVsPoopRatio > 3 ? 'Beaucoup plus de pipis' : 'Équilibré'}
                </Text>
              </View>
            </View>
          )}

          {/* Meilleure journée */}
          {stats.bestDay && (
            <View style={[styles.insightCard, { backgroundColor: '#f0fdf4' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#d1fae5' }]}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Meilleure journée</Text>
                <Text style={styles.insightValue}>
                  {new Date(stats.bestDay).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
                <Text style={styles.insightSubtext}>
                  {stats.bestDayPercentage}% de réussite
                </Text>
              </View>
            </View>
          )}

          {/* Pire journée */}
          {stats.worstDay && stats.worstDayPercentage < 100 && (
            <View style={[styles.insightCard, { backgroundColor: '#fef2f2' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#fee2e2' }]}>
                <Text style={{ fontSize: 32 }}>📅</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Jour difficile</Text>
                <Text style={styles.insightValue}>
                  {new Date(stats.worstDay).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Text>
                <Text style={styles.insightSubtext}>
                  {stats.worstDayPercentage}% de réussite - Mais ça va s'améliorer !
                </Text>
              </View>
            </View>
          )}

          {/* Badge excellence */}
          {stats.peeSuccessRate >= 80 && stats.poopSuccessRate >= 80 && (
            <View style={[styles.insightCard, { backgroundColor: '#fef3c7' }]}>
              <View style={[styles.insightIcon, { backgroundColor: '#fde68a' }]}>
                <Text style={{ fontSize: 32 }}>🎉</Text>
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Bravo !</Text>
                <Text style={styles.insightValue}>Excellent progrès</Text>
                <Text style={styles.insightSubtext}>
                  Plus de 80% de réussite sur tout
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Recommandations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations 💪</Text>

          <View style={styles.recommendationCard}>
            {stats.treatPercentage < 50 && (
              <Text style={styles.recommendationText}>
                • Récompense davantage après les sorties réussies (actuellement {stats.treatPercentage}%)
              </Text>
            )}
            {stats.peeSuccessRate < 70 && (
              <Text style={styles.recommendationText}>
                • Augmente la fréquence des sorties pour réduire les accidents de pipi
              </Text>
            )}
            {stats.poopSuccessRate < 70 && stats.peeSuccessRate >= 70 && (
              <Text style={styles.recommendationText}>
                • Les pipis sont bien gérés ! Concentre-toi maintenant sur les cacas
              </Text>
            )}
            {stats.trend === 'declining' && (
              <Text style={styles.recommendationText}>
                • La tendance baisse : reviens à un rythme de sorties plus fréquent
              </Text>
            )}
            {stats.avgTimeBetweenOutings > 4 && stats.peeSuccessRate < 80 && (
              <Text style={styles.recommendationText}>
                • {stats.avgTimeBetweenOutings}h entre sorties, c'est peut-être trop long - essaie toutes les 3h
              </Text>
            )}
            {stats.mostFrequentIncidentHour && (
              <Text style={styles.recommendationText}>
                • Anticipe une sortie systématique vers {stats.mostFrequentIncidentHour}h (heure à risque)
              </Text>
            )}
            {stats.peeVsPoopRatio > 5 && (
              <Text style={styles.recommendationText}>
                • Beaucoup plus de pipis que de cacas : c'est normal pour un chiot !
              </Text>
            )}
            {stats.treatPercentage >= 50 && stats.peeSuccessRate >= 80 && stats.poopSuccessRate >= 80 && stats.trend !== 'declining' && (
              <Text style={[styles.recommendationText, { color: '#059669' }]}>
                ✅ Continue comme ça, tu fais un excellent travail ! Ton chiot progresse super bien 🎉
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 17,
    color: '#6b7280',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.base,
  },
  statCardFull: {
    width: '100%',
    minWidth: '100%',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10b981',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 6,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  insightCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.base,
  },
  insightIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  insightContent: {
    flex: 1,
  },
  insightLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  insightSubtext: {
    fontSize: 13,
    color: '#9ca3af',
  },
  recommendationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.primaryLighter,
  },
  recommendationText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
