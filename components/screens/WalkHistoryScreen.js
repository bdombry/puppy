import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../config/supabase';
import { GlobalStyles } from '../../styles/global';
import { screenStyles } from '../../styles/screenStyles';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, borderRadius, shadows, typography } from '../../constants/theme';

export default function WalkHistoryScreen() {
  const { user, currentDog } = useAuth();
  const [walks, setWalks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalStats, setTotalStats] = useState({ successCount: 0, incidentCount: 0, activitiesCount: 0 }); // Stats globales
  const navigation = useNavigation();
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInitialData();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    setWalks([]);
    setActivities([]);
    fetchData(0, true); // Réinitialiser et charger la page 0
  }, [activeTab]);

  useEffect(() => {
    if (page > 0) {
      fetchData(page, false); // Charger la page suivante
    }
  }, [page]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Récupérer TOUS les walks une seule fois pour les stats
      const { data: allWalks, error: walksError } = await supabase
        .from('outings')
        .select('*', { count: 'exact' })
        .eq('dog_id', currentDog?.id);
      if (walksError) throw walksError;

      // Récupérer le nombre total de balades
      const { count: activitiesCount, error: activitiesError } = await supabase
        .from('activities')
        .select('*', { count: 'exact' })
        .eq('dog_id', currentDog?.id);
      if (activitiesError) throw activitiesError;

      // Calculer les stats globales
      const incidentCount = allWalks?.filter(isIncident).length || 0;
      const successCount = (allWalks?.length || 0) - incidentCount;
      setTotalStats({ successCount, incidentCount, activitiesCount: activitiesCount || 0 });

      // Charger la première page de pagination
      setPage(0);
      setWalks([]);
      setActivities([]);
    } catch (error) {
      console.error('Erreur récupération stats:', error);
    } finally {
      setLoading(false);
      fetchData(0, true); // Lancer le chargement de la première page
    }
  };

  const fetchData = async (pageNum = 0, reset = false) => {
    if (reset || pageNum === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let walksQuery = supabase
        .from('outings')
        .select('*', { count: 'exact' })
        .eq('dog_id', currentDog?.id)
        .order('datetime', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      let activitiesQuery = supabase
        .from('activities')
        .select('*', { count: 'exact' })
        .eq('dog_id', currentDog?.id)
        .order('datetime', { ascending: false })
        .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

      const { data: walksData, count: walksCount } = await walksQuery;
      const { data: activitiesData, count: activitiesCount } = await activitiesQuery;

      if (reset || pageNum === 0) {
        setWalks(walksData || []);
        setActivities(activitiesData || []);
      } else {
        setWalks((prev) => [...prev, ...(walksData || [])]);
        setActivities((prev) => [...prev, ...(activitiesData || [])]);
      }

      const totalWalks = walksCount || 0;
      const totalActivities = activitiesCount || 0;
      const loaded = (pageNum + 1) * ITEMS_PER_PAGE;
      const hasMoreWalks = loaded < totalWalks;
      const hasMoreActivities = loaded < totalActivities;

      setHasMore(hasMoreWalks || hasMoreActivities);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
              if (isActivity) {
                setActivities(activities.filter((a) => a.id !== item.id));
              } else {
                setWalks(walks.filter((w) => w.id !== item.id));
              }
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer');
            }
          },
        },
      ]
    );
  };

  const formatDate = (iso) => {
    const date = new Date(iso);
    
    // Format court jour/mois
    const dayMonth = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    // Jour de la semaine
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date: dayMonth, time: timeStr, day: dayName };
  };

  const isIncident = (walk) => {
    return (
      (walk.pee && walk.pee_location === 'inside') ||
      (walk.poop && walk.poop_location === 'inside')
    );
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
  ].sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={screenStyles.screenTitle}>Historique</Text>

        <View style={styles.quickStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{totalStats.successCount}</Text>
            <Text style={screenStyles.statLabel}>réussites</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: '#faf5ff' }]}>
            <Text style={[styles.statNumber, { color: '#8b5cf6' }]}>
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
          {activeTab === 'activities' && <View style={[styles.tabIndicator, { backgroundColor: '#8b5cf6' }]} />}
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
          {allItems.map((item) => {
            const { date, time, day } = formatDate(item.datetime);
            const isActivity = item.type === 'activity';
            const incident = !isActivity && isIncident(item);
            const hasNeeds = isActivity && (item.pee || item.poop);

            return (
              <View
                key={item.id || item.datetime}
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
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item, isActivity)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.details}>
                  {isActivity ? (
                    <>
                      {item.pee && (
                        <View style={[styles.detailBadge, item.pee_incident && { backgroundColor: colors.errorLight }]}>
                          <Text style={styles.detailIcon}>{item.pee_incident ? '⚠️' : '💧'}</Text>
                          <Text style={styles.detailText}>Pipi</Text>
                        </View>
                      )}
                      {item.poop && (
                        <View style={[styles.detailBadge, item.poop_incident && { backgroundColor: colors.errorLight }]}>
                          <Text style={styles.detailIcon}>{item.poop_incident ? '⚠️' : '💩'}</Text>
                          <Text style={styles.detailText}>Caca</Text>
                        </View>
                      )}
                      {item.location && (
                        <View style={[styles.detailBadge, { backgroundColor: '#dbeafe' }]}>
                          <Text style={styles.detailIcon}>📍</Text>
                          <Text style={styles.detailText}>{item.location}</Text>
                        </View>
                      )}
                      {item.duration_minutes && (
                        <View style={[styles.detailBadge, { backgroundColor: '#fef3c7' }]}>
                          <Text style={styles.detailIcon}>⏱️</Text>
                          <Text style={styles.detailText}>{item.duration_minutes}m</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      {item.pee && (
                        <View style={styles.detailBadge}>
                          <Text style={styles.detailIcon}>💧</Text>
                          <Text style={styles.detailText}>Pipi</Text>
                        </View>
                      )}
                      {item.poop && (
                        <View style={styles.detailBadge}>
                          <Text style={styles.detailIcon}>💩</Text>
                          <Text style={styles.detailText}>Caca</Text>
                        </View>
                      )}
                      {item.treat && (
                        <View style={[styles.detailBadge, { backgroundColor: colors.primaryLight }]}>
                          <Text style={styles.detailIcon}>🍬</Text>
                          <Text style={styles.detailText}>Friandise</Text>
                        </View>
                      )}
                    </>
                  )}
                </View>
              </View>
            );
          })}
          
          {hasMore && (
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
    backgroundColor: '#f0fdf4',
  },
  cardIncident: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  cardActivity: {
    borderColor: '#8b5cf6',
    backgroundColor: '#faf5ff',
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
});