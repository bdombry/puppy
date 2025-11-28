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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlobalStyles } from '../../styles/global';
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
    <View style={[GlobalStyles.safeArea, GlobalStyles.pageMarginTop]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Historique</Text>

        {/* Stats rapides */}
        <View style={styles.quickStats}>
          <View style={styles.statBadge}>
            <Text style={styles.statNumber}>{successCount}</Text>
            <Text style={styles.statLabel}>réussites</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: '#fef2f2' }]}>
            <Text style={[styles.statNumber, { color: '#ef4444' }]}>
              {incidentCount}
            </Text>
            <Text style={styles.statLabel}>incidents</Text>
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
          {activeTab === 'success' && <View style={[styles.tabIndicator, { backgroundColor: '#10b981' }]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'incidents' && styles.tabActive]}
          onPress={() => setActiveTab('incidents')}
        >
          <Text style={[styles.tabText, activeTab === 'incidents' && styles.tabTextActive]}>
            Incidents
          </Text>
          {activeTab === 'incidents' && <View style={[styles.tabIndicator, { backgroundColor: '#ef4444' }]} />}
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : filteredWalks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>
            {activeTab === 'all' ? '📝' : activeTab === 'incidents' ? '⚠️' : '✅'}
          </Text>
          <Text style={styles.emptyTitle}>
            {activeTab === 'all'
              ? 'Aucun enregistrement'
              : activeTab === 'incidents'
              ? 'Aucun incident'
              : 'Aucune sortie réussie'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'all'
              ? 'Commence à enregistrer les besoins de ton chiot'
              : activeTab === 'incidents'
              ? 'Bravo ! Pas d\'incident enregistré 🎉'
              : 'Commence par enregistrer des sorties réussies'}
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
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
                {/* Header */}
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

                  {/* Bouton supprimer */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(walk)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                {/* Détails */}
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
                    <View style={[styles.detailBadge, { backgroundColor: '#faf5ff' }]}>
                      <Text style={styles.detailIcon}>🍬</Text>
                      <Text style={styles.detailText}>Friandise</Text>
                    </View>
                  )}
                  {walk.location && (
                    <View style={[styles.detailBadge, { backgroundColor: '#eff6ff' }]}>
                      <Text style={styles.detailIcon}>📍</Text>
                      <Text style={styles.detailText}>Position GPS</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.base,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backButtonText: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.extrabold,
    color: colors.text,
    marginBottom: spacing.base,
  },
  quickStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statBadge: {
    flex: 1,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: typography.weights.extrabold,
    color: colors.success,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Pas de background, juste l'indicateur
  },
  tabText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.textTertiary,
  },
  tabTextActive: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.huge,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  emptyIcon: {
    fontSize: typography.sizes.massive,
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scroll: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.card,
    padding: spacing.base,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    ...shadows.small,
  },
  cardSuccess: {
    borderColor: colors.successLight,
    backgroundColor: colors.successLight,
  },
  cardIncident: {
    borderColor: colors.errorLight,
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
    fontSize: 20,
    marginRight: spacing.md,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
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
    fontWeight: typography.weights.semibold,
  },
  timeBadge: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  timeText: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  detailText: {
    fontSize: typography.sizes.base,
    color: colors.text,
    fontWeight: typography.weights.semibold,
  },
});