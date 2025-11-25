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

export default function WalkHistoryScreen() {
  const { user, isGuestMode, currentDog } = useAuth();
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
      if (isGuestMode) {
        const data = await AsyncStorage.getItem('guestWalks');
        const allWalks = data ? JSON.parse(data) : [];
        setWalks(allWalks);
      } else {
        const { data, error } = await supabase
          .from('outings')
          .select('*')
          .eq('dog_id', currentDog?.id)
          .order('datetime', { ascending: false });
        if (error) throw error;
        setWalks(data || []);
      }
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
              if (isGuestMode) {
                const data = await AsyncStorage.getItem('guestWalks');
                const allWalks = data ? JSON.parse(data) : [];
                const filtered = allWalks.filter((w) => w.id !== walk.id);
                await AsyncStorage.setItem('guestWalks', JSON.stringify(filtered));
                setWalks(filtered);
              } else {
                const { error } = await supabase
                  .from('outings')
                  .delete()
                  .eq('id', walk.id);
                if (error) throw error;
                setWalks(walks.filter((w) => w.id !== walk.id));
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
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    let dateStr = '';
    if (diffDays === 0) dateStr = "Aujourd'hui";
    else if (diffDays === 1) dateStr = 'Hier';
    else if (diffDays < 7) dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    else dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

    const timeStr = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return { date: dateStr, time: timeStr };
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
            const { date, time } = formatDate(walk.datetime);
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
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#10b981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabActive: {
    // Pas de background, juste l'indicateur
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#111827',
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#6366f1',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
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
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSuccess: {
    borderColor: '#d1fae5',
    backgroundColor: '#f0fdf4',
  },
  cardIncident: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  timeBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '700',
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
});