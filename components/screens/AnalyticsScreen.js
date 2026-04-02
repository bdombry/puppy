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
import { useUser } from '../../context/UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { WeekChart } from '../../components/charts/WeekChart';
import { DogCommunicationStats } from '../charts/AskToGoOutStats';
import { IncidentReasonChart } from '../charts/IncidentReasonChart';
import { BlurredPremiumSection } from '../../components';
import { TextHidden } from '../../components';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { useAnalytics } from '../../hooks/useAnalytics';
import { presentSoftPaywall } from '../../services/revenueCatService';
import { cacheService } from '../services/cacheService';

export default function AnalyticsScreen() {
  const { currentDog } = useAuth();
  const { isPremium } = useUser();
  const { stats, communicationStats, loading, refreshData } = useAnalytics(currentDog?.id);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Invalider cache avant rechargement
    cacheService.invalidatePattern(`analytics_.*_${currentDog?.id}`);
    await refreshData();
    setRefreshing(false);
  }, [currentDog?.id, refreshData]);

  // Recharger au retour sur l'écran
  useFocusEffect(
    React.useCallback(() => {
      refreshData();
    }, [refreshData])
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
        <Text style={screenStyles.screenTitle}>Suivi 📊</Text>
        <Text style={screenStyles.screenSubtitle}>Analyse détaillée des besoins de {currentDog.name}</Text>

        <WeekChart dogId={currentDog.id} />
        <Text style={styles.explanationNote}>* Affiche les pipi/caca réussis par jour</Text>

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

        <Text style={styles.explanationNote}>* Inclut toutes les sorties et balades enregistrées</Text>

        {/* Taux de réussite des besoins */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Taux de réussite</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>💧 Pipis</Text>
              <Text style={styles.progressValue}>{stats.peeSuccessRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.peeSuccessRate}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.peeOutside} réussis • {stats.peeInside} échoués
            </Text>
          </View>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>💩 Cacas</Text>
              <Text style={styles.progressValue}>{stats.poopSuccessRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${stats.poopSuccessRate}%` }]} />
            </View>
            <Text style={styles.progressSubtext}>
              {stats.poopOutside} réussis • {stats.poopInside} échoués
            </Text>
          </View>
        </View>

        {/* Friandises */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Friandises 🍬</Text>

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

        {/* Demandes de sortie */}
        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>Communication 🗣️</Text>

          <DogCommunicationStats 
            activitiesAsked={communicationStats.activitiesAsked}
            totalActivities={communicationStats.totalActivities}
            successWithDemand={communicationStats.successWithDemand}
            outingsAsked={communicationStats.outingsAsked}
            totalSuccesses={communicationStats.totalSuccesses}
            dogName={currentDog?.name}
          />
          <Text style={styles.explanationNote}>* Montre à quel % ton chien te demande avant de faire ses besoins ou de sortir</Text>
        </View>

        {/* Raisons des incidents */}
        <View style={screenStyles.section}>
          <IncidentReasonChart dogId={currentDog.id} />
          <Text style={styles.explanationNote}>* Montre les raisons des incidents quand tu les as enregistrées</Text>
        </View>


        {/* Insights */}
        <BlurredPremiumSection
          title="Insights 💡"
          message="Statistiques avancées 📊"
          onPress={() => presentSoftPaywall()}
          isPremium={isPremium}
        >
          {/* Tendance */}
          {stats.trend && (
            <View style={[
              styles.insightCard, 
              { backgroundColor: stats.trend === 'improving' ? colors.successLightest : stats.trend === 'declining' ? colors.errorLight : colors.gray100 }
            ]}>
              <View style={[
                styles.insightIcon, 
                { backgroundColor: stats.trend === 'improving' ? colors.successLight : stats.trend === 'declining' ? colors.errorLighter : colors.gray200 }
              ]}>
                <Text style={{ fontSize: 32 }}>
                  {stats.trend === 'improving' ? '📈' : stats.trend === 'declining' ? '📉' : '➡️'}
                </Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Tendance 7 jours</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>
                  {stats.trend === 'improving' ? 'En amélioration' : stats.trend === 'declining' ? 'En baisse' : 'Stable'}
                </TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  {stats.trend === 'improving' ? 'Super ! Continue comme ça' : stats.trend === 'declining' ? 'Augmente la fréquence des sorties' : 'Maintiens le rythme'}
                </TextHidden>
              </View>
            </View>
          )}

          {/* Heure à risque */}
          {stats.mostFrequentIncidentHour && (
            <View style={[styles.insightCard, { backgroundColor: colors.errorLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.errorLighter }]}>
                <Text style={{ fontSize: 32 }}>⏰</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Heure à risque</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>Vers {stats.mostFrequentIncidentHour}h</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  Le plus d'incidents à cette heure
                </TextHidden>
              </View>
            </View>
          )}

          {/* Meilleure heure */}
          {stats.mostFrequentSuccessHour && (
            <View style={[styles.insightCard, { backgroundColor: colors.successLightest }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.successLight }]}>
                <Text style={{ fontSize: 32 }}>⭐</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Meilleure heure</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>Vers {stats.mostFrequentSuccessHour}h</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  Le plus de réussites à cette heure
                </TextHidden>
              </View>
            </View>
          )}

          {/* Temps moyen entre sorties */}
          {stats.avgTimeBetweenOutings && (
            <View style={[styles.insightCard, { backgroundColor: colors.primaryLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.primaryLighter }]}>
                <Text style={{ fontSize: 32 }}>⏱️</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Fréquence moyenne</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>{stats.avgTimeBetweenOutings}h</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  Entre chaque sortie
                </TextHidden>
              </View>
            </View>
          )}

          {/* Record de jours propres */}
          {stats.maxStreak > 0 && (
            <View style={[styles.insightCard, { backgroundColor: colors.warningLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.warningLighter }]}>
                <Text style={{ fontSize: 32 }}>🏅</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Record</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>{stats.maxStreak} jour{stats.maxStreak > 1 ? 's' : ''}</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  Consécutifs sans incident
                </TextHidden>
              </View>
            </View>
          )}

          {/* Ratio pipi/caca */}
          {stats.peeVsPoopRatio && (
            <View style={[styles.insightCard, { backgroundColor: colors.purpleLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.purpleLighter }]}>
                <Text style={{ fontSize: 32 }}>📊</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Ratio Pipi/Caca</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>{stats.peeVsPoopRatio}:1</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  {stats.peeVsPoopRatio > 3 ? 'Beaucoup plus de pipis' : 'Équilibré'}
                </TextHidden>
              </View>
            </View>
          )}

          {/* Meilleure journée */}
          {stats.bestDay && (
            <View style={[styles.insightCard, { backgroundColor: colors.successLightest }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.successLight }]}>
                <Text style={{ fontSize: 32 }}>🏆</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Meilleure journée</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>
                  {new Date(stats.bestDay).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  {stats.bestDayPercentage}% de réussite
                </TextHidden>
              </View>
            </View>
          )}

          {/* Pire journée */}
          {stats.worstDay && stats.worstDayPercentage < 100 && (
            <View style={[styles.insightCard, { backgroundColor: colors.errorLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.errorLighter }]}>
                <Text style={{ fontSize: 32 }}>📅</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Jour difficile</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>
                  {new Date(stats.worstDay).toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  {stats.worstDayPercentage}% de réussite - Mais ça va s'améliorer !
                </TextHidden>
              </View>
            </View>
          )}

          {/* Badge excellence */}
          {stats.peeSuccessRate >= 80 && stats.poopSuccessRate >= 80 && (
            <View style={[styles.insightCard, { backgroundColor: colors.warningLight }]}>
              <View style={[styles.insightIcon, { backgroundColor: colors.warningLighter }]}>
                <Text style={{ fontSize: 32 }}>🎉</Text>
              </View>
              <View style={styles.insightContent}>
                <TextHidden isPremium={isPremium} style={styles.insightLabel}>Bravo !</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightValue}>Excellent progrès</TextHidden>
                <TextHidden isPremium={isPremium} style={styles.insightSubtext}>
                  Plus de 80% de réussite sur tout
                </TextHidden>
              </View>
            </View>
          )}
        </BlurredPremiumSection>

      {/* Recommandations */}
      <BlurredPremiumSection
        title="Recommandations 💪"
        message="Conseils personnalisés �"
        onPress={() => presentSoftPaywall()}
        isPremium={isPremium}
      >
        <View style={styles.recommendationCard}>
            {stats.treatPercentage < 50 && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • Récompense davantage après les sorties réussies (actuellement {stats.treatPercentage}%)
              </TextHidden>
            )}
            {stats.peeSuccessRate < 70 && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • Augmente la fréquence des sorties pour plus de pipis réussis
              </TextHidden>
            )}
            {stats.poopSuccessRate < 70 && stats.peeSuccessRate >= 70 && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • Les pipis sont bien gérés ! Concentre-toi maintenant sur les cacas réussis
              </TextHidden>
            )}
            {stats.trend === 'declining' && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • La tendance baisse : reviens à un rythme de sorties plus fréquent
              </TextHidden>
            )}
            {stats.avgTimeBetweenOutings > 4 && stats.peeSuccessRate < 80 && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • {stats.avgTimeBetweenOutings}h entre sorties, c'est peut-être trop long - essaie toutes les 3h
              </TextHidden>
            )}
            {stats.mostFrequentIncidentHour && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • Anticipe une sortie systématique vers {stats.mostFrequentIncidentHour}h (heure à risque)
              </TextHidden>
            )}
            {stats.peeVsPoopRatio > 5 && (
              <TextHidden isPremium={isPremium} style={styles.recommendationText}>
                • Beaucoup plus de pipis que de cacas : c'est normal pour un chiot !
              </TextHidden>
            )}
            {stats.treatPercentage >= 50 && stats.peeSuccessRate >= 80 && stats.poopSuccessRate >= 80 && stats.trend !== 'declining' && (
              <TextHidden isPremium={isPremium} style={[styles.recommendationText, { color: colors.successDark }]}>
                ✅ Continue comme ça, tu fais un excellent travail ! Ton chiot progresse super bien 🎉
              </TextHidden>
            )}
          </View>
      </BlurredPremiumSection>
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
    marginBottom: spacing.sm,
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
    backgroundColor: colors.card,
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
    borderColor: colors.primaryLighter,
  },
  recommendationText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  explanationNote: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginTop: 0,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
});