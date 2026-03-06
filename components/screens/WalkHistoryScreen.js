import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';
import { useWalkHistory } from '../../hooks/useWalkHistory';
import { cacheService } from '../services/cacheService';

export default function WalkHistoryScreen() {
  const { user, currentDog } = useAuth();
  const navigation = useNavigation();
  const { walks, activities, totalStats, loading, refreshData } = useWalkHistory(currentDog?.id);
  
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ITEMS_PER_PAGE = 15;

  // Le hook useWalkHistory gère automatiquement le chargement au montage avec cache

  // ✅ Réinitialiser la pagination quand on change d'onglet
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // ✅ Pull-to-refresh: invalider le cache ET recharger
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalider le cache pour forcer le rechargement
    cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
    // Recharger les données (skip cache)
    await refreshData();
    setPage(0); // Réinitialiser la pagination
    setRefreshing(false);
  }, [currentDog?.id, refreshData]);

  const handleDelete = async (item, isActivity = false) => {
    Alert.alert(
      'Supprimer',
      'Veux-tu vraiment supprimer cet enregistrement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const table = isActivity ? 'activities' : 'outings';
              const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', item.id);
              if (error) throw error;
              
              // 🗑️ Invalider le cache après suppression
              cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
              
              // Recharger les données
              await refreshData();
              Alert.alert('✅ Supprimé', 'L\'enregistrement a été supprimé');
            } catch (error) {
              Alert.alert('❌ Erreur', 'Impossible de supprimer');
            }
          },
        },
      ]
    );
  };

  // ✏️ Éditer un élément
  const handleEdit = (item, isActivity = false) => {
    if (isActivity) {
      // Les balades vont sur leur propre écran
      navigation.navigate('EditActivity', { 
        activity: item,
        onSave: refreshData,
      });
      return;
    }

    // Pour les outings (incidents vs réussite)
    const isIncident = (item.pee && item.pee_location === 'inside') || (item.poop && item.poop_location === 'inside');
    
    if (isIncident) {
      navigation.navigate('EditIncident', { 
        incident: item,
        onSave: refreshData,
      });
    } else {
      navigation.navigate('EditSuccess', { 
        success: item,
        onSave: refreshData,
      });
    }
  };

  const formatDate = (iso) => {
    // iso format: "2025-12-05T22:29:00" (LOCAL, pas UTC)
    // On extrait directement sans passer par new Date() qui convertirait en UTC
    const [datePart, timePart] = iso.split('T');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    // Format court jour/mois
    const dayMonth = `${day}/${month}`;
    
    // Jour de la semaine (créer une date locale correctement)
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

    const timeStr = `${hours}:${minutes}`;

    return { date: dayMonth, time: timeStr, day: dayName };
  };

  // ✅ Normaliser le datetime pour le tri (handle both UTC+00:00 and LOCAL formats)
  const normalizeDatetime = (iso) => {
    // Remove timezone info if present (e.g., "+00:00")
    const cleanIso = iso.split('+')[0].split('Z')[0];
    // Return as ISO string for proper comparison
    return new Date(cleanIso).getTime();
  };

  const isIncident = (walk) => {
    return (
      (walk.pee && walk.pee_location === 'inside') ||
      (walk.poop && walk.poop_location === 'inside')
    );
  };

  // ✅ Fonction pour rendre les details sans problème de rendering
  const renderDetails = (item, isActivity) => {
    const badges = [];

    if (isActivity) {
      if (item.pee) {
        badges.push(
          <View key="pee" style={[styles.detailBadge, item.pee_incident && { backgroundColor: colors.errorLight }]}>
            <Text style={styles.detailIcon}>{item.pee_incident ? '⚠️' : '💧'}</Text>
            <Text style={styles.detailText}>Pipi</Text>
          </View>
        );
      }
      if (item.poop) {
        badges.push(
          <View key="poop" style={[styles.detailBadge, item.poop_incident && { backgroundColor: colors.errorLight }]}>
            <Text style={styles.detailIcon}>{item.poop_incident ? '⚠️' : '💩'}</Text>
            <Text style={styles.detailText}>Caca</Text>
          </View>
        );
      }
      if (item.location) {
        badges.push(
          <View key="location" style={[styles.detailBadge, { backgroundColor: colors.primaryLighter }]}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{item.location}</Text>
          </View>
        );
      }
      if (item.duration_minutes) {
        badges.push(
          <View key="duration" style={[styles.detailBadge, { backgroundColor: colors.warningLight }]}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <Text style={styles.detailText}>{item.duration_minutes}m</Text>
          </View>
        );
      }
    } else {
      if (item.pee) {
        badges.push(
          <View key="pee" style={styles.detailBadge}>
            <Text style={styles.detailIcon}>💧</Text>
            <Text style={styles.detailText}>Pipi</Text>
          </View>
        );
      }
      if (item.poop) {
        badges.push(
          <View key="poop" style={styles.detailBadge}>
            <Text style={styles.detailIcon}>💩</Text>
            <Text style={styles.detailText}>Caca</Text>
          </View>
        );
      }
      if (item.treat) {
        badges.push(
          <View key="treat" style={[styles.detailBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.detailIcon}>🍬</Text>
            <Text style={styles.detailText}>Friandise</Text>
          </View>
        );
      }
    }

    return badges.length > 0 ? (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
        {badges}
      </View>
    ) : null;
  };

  const filteredWalks = walks.filter((walk) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'incidents') return isIncident(walk);
    if (activeTab === 'success') return !isIncident(walk);
    return true;
  });

  const filteredActivities = activities.filter((activity) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'activities') return true;
    if (activeTab === 'success') {
      // Balades avec AU MOINS 1 réussite (pipi/caca sans incident)
      const hasPeeSuccess = activity.pee && !activity.pee_incident;
      const hasPoopSuccess = activity.poop && !activity.poop_incident;
      return hasPeeSuccess || hasPoopSuccess;
    }
    if (activeTab === 'incidents') {
      // Balades avec AU MOINS 1 incident
      return activity.pee_incident || activity.poop_incident;
    }
    return false;
  });

  // Combiner et trier tous les éléments par date
  const allItems = [
    ...(activeTab === 'activities' ? [] : filteredWalks.map((w) => ({ ...w, type: 'walk' }))),
    ...filteredActivities.map((a) => ({ ...a, type: 'activity' })),
  ].sort((a, b) => {
    // Normaliser les datetimes et comparer (plus récent en premier)
    const timeA = normalizeDatetime(a.datetime);
    const timeB = normalizeDatetime(b.datetime);
    return timeB - timeA; // Décroissant (plus récent d'abord)
  });

  // Paginer les éléments (15 par page)
  const paginatedItems = allItems.slice(0, (page + 1) * ITEMS_PER_PAGE);
  const hasMoreItems = allItems.length > (page + 1) * ITEMS_PER_PAGE;

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView 
        contentContainerStyle={screenStyles.screenContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={screenStyles.screenTitle}>Historique</Text>

        <View style={styles.quickStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{totalStats.successCount}</Text>
            <Text style={screenStyles.statLabel}>réussites</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.purpleLight }]}>
            <Text style={[styles.statNumber, { color: colors.purple }]}>
              {totalStats.activitiesCount}
            </Text>
            <Text style={screenStyles.statLabel}>balades</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {totalStats.incidentCount}
            </Text>
            <Text style={screenStyles.statLabel}>incidents</Text>
          </View>
        </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            Tous
          </Text>
          {activeTab === 'all' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'success' && styles.tabActive]}
          onPress={() => setActiveTab('success')}
        >
          <Text style={[styles.tabText, activeTab === 'success' && styles.tabTextActive]}>
            Réussites
          </Text>
          {activeTab === 'success' && <View style={[styles.tabIndicator, { backgroundColor: colors.success }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'activities' && styles.tabActive]}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
            Balades
          </Text>
          {activeTab === 'activities' && <View style={[styles.tabIndicator, { backgroundColor: colors.purple }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'incidents' && styles.tabActive]}
          onPress={() => setActiveTab('incidents')}
        >
          <Text style={[styles.tabText, activeTab === 'incidents' && styles.tabTextActive]}>
            Incidents
          </Text>
          {activeTab === 'incidents' && <View style={[styles.tabIndicator, { backgroundColor: colors.error }]} />}
        </TouchableOpacity>
        </View>

        {/* Liste */}
        {loading ? (
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
        ) : allItems.length === 0 ? (
          <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>
            {activeTab === 'all' ? '📝' : activeTab === 'incidents' ? '⚠️' : activeTab === 'activities' ? '🚶' : '✅'}
          </Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'all'
              ? 'Aucun enregistrement'
              : activeTab === 'incidents'
              ? 'Aucun incident'
              : activeTab === 'activities'
              ? 'Aucune balade enregistrée'
              : 'Aucune réussite enregistrée'}
          </Text>
          <Text style={screenStyles.emptyText}>
            {activeTab === 'all'
              ? 'Commence à enregistrer les besoins de ton chiot'
              : activeTab === 'incidents'
              ? 'Bravo ! Pas d\'incident enregistré 🎉'
              : activeTab === 'activities'
              ? 'Commence à enregistrer tes balades'
              : 'Aucune sortie réussie ni balade avec besoins enregistrée'}
          </Text>
        </View>
        ) : (
          <View>
            {paginatedItems.map((item) => {
              const { date, time, day } = formatDate(item.datetime);
              const isActivity = item.type === 'activity';
              const incident = !isActivity && isIncident(item);

              return (
                <View key={`${item.type}-${item.id}`}
                  style={[
                    styles.card,
                    incident ? styles.cardIncident : isActivity ? styles.cardActivity : styles.cardSuccess,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <View style={styles.cardTitleRow}>
                        <Text style={styles.cardIcon}>
                          {isActivity ? '🚶' : incident ? '⚠️' : '✅'}
                        </Text>
                        <Text style={styles.cardTitle}>
                          {isActivity ? (item.title ? item.title : 'Balade') : incident ? 'Incident' : 'Réussite'}
                        </Text>
                      </View>
                      <View style={styles.dateRow}>
                        <Text style={styles.dayText}>{day}</Text>
                        <Text style={styles.dateText}>{date}</Text>
                        <View style={styles.timeBadge}>
                          <Text style={styles.timeText}>{time}</Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => handleEdit(item, isActivity)}
                    >
                      <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDelete(item, isActivity)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.details}>
                    {renderDetails(item, isActivity)}
                  </View>
                </View>
              );
            })}
            
            {hasMoreItems && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={() => setPage(page + 1)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>📥 Voir plus</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.extrabold,
    color: colors.success,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: typography.weights.extrabold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: spacing.huge,
  },
  card: {
    backgroundColor: colors.successLight,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    ...shadows.small,
  },
  cardSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.successLightest,
  },
  cardIncident: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  cardActivity: {
    borderColor: colors.purple,
    backgroundColor: colors.purpleLight,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardIcon: {
    fontSize: typography.sizes.xl,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  timeBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  deleteButtonText: {
    fontSize: typography.sizes.lg,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  detailIcon: {
    fontSize: typography.sizes.base,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  loadMoreButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: typography.sizes.base,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
    marginLeft: spacing.sm,
  },
  deleteButtonText: {
    fontSize: typography.sizes.lg,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  editButtonText: {
    fontSize: typography.sizes.lg,
  },
});