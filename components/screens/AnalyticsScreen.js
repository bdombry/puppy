import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { getAdvancedStats } from '../services/analyticsService';
import { WeekChart } from '../../components/charts/WeekChart';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export default function AnalyticsScreen() {
  const { currentDog } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = React.useCallback(async () => {
    if (!currentDog?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log('📊 Chargement analytics pour chien:', currentDog.id);
      const data = await getAdvancedStats(currentDog.id);
      console.log('📊 Stats reçues:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Erreur chargement analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [currentDog?.id]);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  // Charger les stats quand on arrive sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  if (loading) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop, screenStyles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyse des données...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
        <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>📊</Text>
          <Text style={screenStyles.emptyText}>Pas encore de données à analyser</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView 
        contentContainerStyle={screenStyles.screenContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={screenStyles.screenTitle}>Analytics 📊</Text>
        <Text style={screenStyles.screenSubtitle}>Analyse détaillée des progrès de {currentDog.name}</Text>

        <WeekChart dogId={currentDog.id} />

        {/* Stats grid */}
        <View style={styles.grid}>
          <View style={[screenStyles.statCard, styles.statCardFull]}>
            <Text style={[screenStyles.statValue, { fontSize: typography.sizes.xxxl }]}>{stats.total}</Text>
            <Text style={[screenStyles.statLabel, styles.statCardLabel]}>Total enregistrements</Text>
          </View>

          <View style={[screenStyles.statCard, { flex: 1 }]}>
            <Text style={styles.statIcon}>💧</Text>
            <Text style={screenStyles.statValue}>{stats.peeCount}</Text>
            <Text style={[screenStyles.statLabel, styles.statCardLabel]}>Pipis</Text>
          </View>

          <View style={[screenStyles.statCard, { flex: 1 }]}>
            <Text style={styles.statIcon}>💩</Text>
            <Text style={screenStyles.statValue}>{stats.poopCount}</Text>
            <Text style={[screenStyles.statLabel, styles.statCardLabel]}>Cacas</Text>
          </View>
        </View>

        {/* Taux de réussite par type */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Taux de réussite par type</Text>

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
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Récompenses 🍬</Text>

          <View style={styles.insightCard}>
            <View style={styles.insightIcon}>
              <Text style={{ fontSize: 32 }}>🍬</Text>
            </View>
            <View style={styles.insightContent}>
              <Text style={screenStyles.statValue}>{stats.treatPercentage}%</Text>
              <Text style={styles.insightLabel}>des sorties récompensées</Text>
              <Text style={styles.insightSubtext}>
                {stats.treatGiven} friandises données
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Insights 💡</Text>

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
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Recommandations 💪</Text>

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
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCardFull: {
    width: '100%',
    minWidth: '100%',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  statCardLabel: {
    fontSize: typography.sizes.base,
    color: colors.text,
  },
  progressCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  progressValue: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.success,
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.gray200,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  insightCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
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
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  insightSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  recommendationCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  recommendationText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
});
