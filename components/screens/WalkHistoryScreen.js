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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'success', 'incidents'
  const navigation = useNavigation();

  useEffect(() => {
    fetchWalks();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchWalks();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchWalks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('outings')
        .select('*')
        .eq('dog_id', currentDog?.id)
        .order('datetime', { ascending: false });
      if (error) throw error;
      setWalks(data || []);
    } catch (error) {
      console.error('Erreur récupération historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (walk) => {
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
              const { error } = await supabase
                .from('outings')
                .delete()
                .eq('id', walk.id);
              if (error) throw error;
              setWalks(walks.filter((w) => w.id !== walk.id));
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

  const incidentCount = walks.filter(isIncident).length;
  const successCount = walks.length - incidentCount;

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView contentContainerStyle={screenStyles.screenContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={screenStyles.screenTitle}>Historique</Text>

        <View style={styles.quickStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{successCount}</Text>
            <Text style={screenStyles.statLabel}>réussites</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: colors.errorLight }]}>
            <Text style={[styles.statNumber, { color: colors.error }]}>
              {incidentCount}
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
            Sorties
          </Text>
          {activeTab === 'success' && <View style={[styles.tabIndicator, { backgroundColor: colors.success }]} />}
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
        ) : filteredWalks.length === 0 ? (
          <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>
            {activeTab === 'all' ? '📝' : activeTab === 'incidents' ? '⚠️' : '✅'}
          </Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'all'
              ? 'Aucun enregistrement'
              : activeTab === 'incidents'
              ? 'Aucun incident'
              : 'Aucune sortie réussie'}
          </Text>
          <Text style={screenStyles.emptyText}>
            {activeTab === 'all'
              ? 'Commence à enregistrer les besoins de ton chiot'
              : activeTab === 'incidents'
              ? 'Bravo ! Pas d\'incident enregistré 🎉'
              : 'Commence par enregistrer des sorties réussies'}
          </Text>
        </View>
        ) : (
          <View>
          {filteredWalks.map((walk) => {
            const { date, time, day } = formatDate(walk.datetime);
            const incident = isIncident(walk);

            return (
              <View
                key={walk.id || walk.datetime}
                style={[
                  styles.card,
                  incident ? styles.cardIncident : styles.cardSuccess,
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardTitleRow}>
                      <Text style={styles.cardIcon}>
                        {incident ? '⚠️' : '✅'}
                      </Text>
                      <Text style={styles.cardTitle}>
                        {incident ? 'Incident' : 'Sortie réussie'}
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
                    onPress={() => handleDelete(walk)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.details}>
                  {walk.pee && (
                    <View style={styles.detailBadge}>
                      <Text style={styles.detailIcon}>💧</Text>
                      <Text style={styles.detailText}>Pipi</Text>
                    </View>
                  )}
                  {walk.poop && (
                    <View style={styles.detailBadge}>
                      <Text style={styles.detailIcon}>💩</Text>
                      <Text style={styles.detailText}>Caca</Text>
                    </View>
                  )}
                  {walk.treat && (
                    <View style={[styles.detailBadge, { backgroundColor: colors.primaryLight }]}>
                      <Text style={styles.detailIcon}>🍬</Text>
                      <Text style={styles.detailText}>Friandise</Text>
                    </View>
                  )}
                  {walk.location && (
                    <View style={[styles.detailBadge, { backgroundColor: '#dbeafe' }]}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>Position GPS</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
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
});