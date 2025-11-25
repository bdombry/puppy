import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { homeStyles } from '../../styles/homeStyles';
import { useNavigation } from '@react-navigation/native';
import { getPeeStats, getTotalOutings } from '../services/supabaseService';
import { getActivityStreak, getCleanStreak } from '../services/streakService';
import { getLastOuting, formatTimeSince } from '../services/timerService';
import { WeekChart } from '../../components/charts/WeekChart';

const getDogAge = (birthDate) => {
  if (!birthDate) return null;
  const diff = Date.now() - new Date(birthDate).getTime();
  const ageDate = new Date(diff);
  const months = ageDate.getUTCMonth() + ageDate.getUTCFullYear() * 12 - 12 * 1970;
  if (months < 1) return "moins d'un mois";
  if (months === 1) return "1 mois";
  return `${months} mois`;
};

const PERIODS = [
  { id: '1w', label: '7 jours' },
  { id: '1m', label: '1 mois' },
  { id: '3m', label: '3 mois' },
  { id: '6m', label: '6 mois' },
  { id: 'all', label: 'Total' },
];

export default function HomeScreen() {
  const { currentDog, isGuestMode, getDaysInGuestMode, signOut } = useAuth();
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1w');
  const [streakMode, setStreakMode] = useState('activity');
  const navigation = useNavigation();

  const [stats, setStats] = useState({
    outside: 0,
    inside: 0,
    total: 0,
    percentage: 0,
  });
  const [totalOutings, setTotalOutings] = useState(0);
  const [streakData, setStreakData] = useState({
    activity: 0,
    clean: 0,
  });
  const [lastOuting, setLastOuting] = useState(null);
  const [timeSince, setTimeSince] = useState(null);

  const daysInTrial = getDaysInGuestMode();

  const loadData = useCallback(async () => {
    if (!currentDog?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [peeStats, total, activityStreak, cleanStreak, lastOut] = await Promise.all([
        getPeeStats(currentDog.id, isGuestMode, selectedPeriod),
        getTotalOutings(currentDog.id, isGuestMode),
        getActivityStreak(currentDog.id, isGuestMode),
        getCleanStreak(currentDog.id, isGuestMode),
        getLastOuting(currentDog.id, isGuestMode),
      ]);

      setStats(peeStats);
      setTotalOutings(total);
      setStreakData({
        activity: activityStreak,
        clean: cleanStreak,
      });
      setLastOuting(lastOut);
      if (lastOut) {
        setTimeSince(formatTimeSince(lastOut.datetime));
      }
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDog?.id, isGuestMode, selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation, loadData]);

  useEffect(() => {
    if (isGuestMode && daysInTrial >= 3) {
      setShowTrialModal(true);
    }
  }, [daysInTrial, isGuestMode]);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stats.percentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [stats.percentage, progressAnim]);

  // Timer qui se met à jour toutes les 10 secondes
  useEffect(() => {
    if (!lastOuting) return;

    const interval = setInterval(() => {
      setTimeSince(formatTimeSince(lastOuting.datetime));
    }, 10000); // Update toutes les 10 secondes

    return () => clearInterval(interval);
  }, [lastOuting]);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStreakClick = () => {
    const modes = ['activity', 'clean'];
    const currentIndex = modes.indexOf(streakMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setStreakMode(nextMode);
  };

  const getStreakDisplay = () => {
    switch (streakMode) {
      case 'activity':
        return {
          value: streakData.activity,
          label: streakData.activity <= 1 ? 'Jour actif' : 'Jours actifs',
          icon: '🔥',
        };
      case 'clean':
        return {
          value: streakData.clean,
          label: streakData.clean <= 1 ? 'Jour propre' : 'Jours propres',
          icon: '✨',
        };
      default:
        return { value: 0, label: 'Streak', icon: '🔥' };
    }
  };

  const streakDisplay = getStreakDisplay();

  return (
    <View style={[GlobalStyles.safeArea, homeStyles.container]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
        }
      >
        {/* HEADER */}
        <View style={[homeStyles.header, { paddingTop: GlobalStyles.pageMarginTop.marginTop }]}>
          <View style={homeStyles.headerRow}>
            <Text style={homeStyles.headerTitle}>Bonjour 👋</Text>
            {isGuestMode && (
              <View style={homeStyles.trialBadge}>
                <Text style={homeStyles.trialBadgeText}>Essai J{daysInTrial}/3</Text>
              </View>
            )}
          </View>
          {currentDog && (
            <Text style={homeStyles.headerSubtitle}>
              Apprentissage de la propreté de {currentDog.name}
            </Text>
          )}

          {/* Timer dernière sortie */}
          {lastOuting && timeSince && (
            <View style={{ 
              marginTop: 12, 
              backgroundColor: '#eef2ff', 
              paddingHorizontal: 12, 
              paddingVertical: 8, 
              borderRadius: 12,
              alignSelf: 'flex-start',
            }}>
              <Text style={{ fontSize: 13, color: '#6366f1', fontWeight: '700' }}>
                ⏱️ Dernière sortie : il y a {timeSince}
              </Text>
            </View>
          )}
        </View>

        <View style={homeStyles.content}>
          {/* CARTE CHIEN */}
          {currentDog && (
            <View style={homeStyles.dogCard}>
              {/* Header */}
              <View style={homeStyles.dogHeaderContainer}>
                <View style={homeStyles.dogHeaderRow}>
                  <View style={homeStyles.dogAvatar}>
                    <Text style={homeStyles.dogAvatarEmoji}>🐶</Text>
                  </View>
                  <View style={homeStyles.dogInfo}>
                    <Text style={homeStyles.dogName}>{currentDog.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={homeStyles.settingsButton}
                    onPress={() => navigation.navigate('DogProfile')}
                  >
                    <Text style={homeStyles.settingsIcon}>⚙️</Text>
                  </TouchableOpacity>
                </View>

                <View style={homeStyles.dogMetaRow}>
                  <Text style={homeStyles.dogAge}>
                    {getDogAge(currentDog.birth_date) || 'Âge inconnu'}
                  </Text>
                  {currentDog.breed && (
                    <>
                      <View style={homeStyles.dogMetaDot} />
                      <Text style={homeStyles.dogBreed}>{currentDog.breed}</Text>
                    </>
                  )}
                </View>
              </View>

              {/* PROGRESSION */}
              <View style={homeStyles.progressContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.periodScroll}>
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period.id}
                      style={[
                        homeStyles.periodButton,
                        selectedPeriod === period.id ? homeStyles.periodButtonActive : homeStyles.periodButtonInactive,
                      ]}
                      onPress={() => handlePeriodChange(period.id)}
                    >
                      <Text
                        style={[
                          homeStyles.periodText,
                          selectedPeriod === period.id ? homeStyles.periodTextActive : homeStyles.periodTextInactive,
                        ]}
                      >
                        {period.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {loading ? (
                  <View style={homeStyles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={homeStyles.loadingText}>Chargement...</Text>
                  </View>
                ) : (
                  <>
                    <View style={homeStyles.statsHeader}>
                      <Text style={homeStyles.statsTitle}>Propreté</Text>
                      <Text style={homeStyles.statsPercentage}>{stats.percentage}%</Text>
                    </View>

                    <View style={homeStyles.progressBar}>
                      <Animated.View
                        style={[
                          homeStyles.progressFill,
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 100],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    </View>

                    <View style={homeStyles.statsLegend}>
                      <View style={homeStyles.legendItem}>
                        <View style={[homeStyles.legendDot, homeStyles.legendDotSuccess]} />
                        <Text style={homeStyles.legendText}>{stats.outside} réussites</Text>
                      </View>
                      <View style={homeStyles.legendItem}>
                        <View style={[homeStyles.legendDot, homeStyles.legendDotIncident]} />
                        <Text style={homeStyles.legendText}>{stats.inside} incidents</Text>
                      </View>
                    </View>

                    {stats.total > 0 ? (
                      <Text style={homeStyles.encouragementText}>
                        {stats.percentage >= 80
                          ? '🎉 Excellent progrès !'
                          : stats.percentage >= 50
                          ? '💪 Bon travail, continue !'
                          : '🌱 Patience, ça va venir !'}
                      </Text>
                    ) : (
                      <Text style={homeStyles.encouragementText}>
                        {selectedPeriod === 'all'
                          ? 'Enregistre les besoins de ton chiot 🚀'
                          : 'Aucune donnée sur cette période'}
                      </Text>
                    )}
                  </>
                )}
              </View>
            </View>
          )}

          {/* GRAPHIQUE 7 JOURS */}
          {currentDog && <WeekChart dogId={currentDog.id} isGuestMode={isGuestMode} />}

          {/* STATS CARDS */}
          <View style={homeStyles.statsCardsRow}>
            <View style={[homeStyles.statCard, homeStyles.statCardLeft]}>
              <View style={[homeStyles.statIconContainer, homeStyles.statIconBlue]}>
                <Text style={homeStyles.statIcon}>📝</Text>
              </View>
              <Text style={homeStyles.statValue}>{totalOutings}</Text>
              <Text style={homeStyles.statLabel}>Total</Text>
            </View>

            <View style={[homeStyles.statCard, homeStyles.statCardRight]}>
              <TouchableOpacity onPress={handleStreakClick}>
                <View style={[homeStyles.statIconContainer, homeStyles.statIconYellow]}>
                  <Text style={homeStyles.statIcon}>{streakDisplay.icon}</Text>
                </View>
                <Text style={homeStyles.statValue}>
                  {isGuestMode && streakMode === 'activity'
                    ? Math.max(0, 3 - daysInTrial)
                    : streakDisplay.value}
                </Text>
                <Text style={homeStyles.statLabel}>
                  {isGuestMode && streakMode === 'activity' ? 'Jours restants' : streakDisplay.label}
                </Text>
                <Text style={homeStyles.statHint}>Tap pour changer</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BOUTONS */}
          <TouchableOpacity
            style={[homeStyles.actionButton, homeStyles.actionButtonPrimary]}
            onPress={() => setShowActionModal(true)}
            activeOpacity={0.8}
          >
            <View style={homeStyles.actionButtonRow}>
              <Text style={homeStyles.actionButtonIcon}>📝</Text>
              <Text style={homeStyles.actionButtonTextPrimary}>Enregistrer</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[homeStyles.actionButton, homeStyles.actionButtonSecondary]}
            onPress={() => navigation.navigate('WalkHistory')}
            activeOpacity={0.7}
          >
            <View style={homeStyles.actionButtonRow}>
              <Text style={homeStyles.actionButtonIcon}>📊</Text>
              <Text style={homeStyles.actionButtonTextSecondary}>Voir l'historique</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[homeStyles.actionButton, homeStyles.actionButtonSecondary]}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.7}
          >
            <View style={homeStyles.actionButtonRow}>
              <Text style={homeStyles.actionButtonIcon}>📈</Text>
              <Text style={homeStyles.actionButtonTextSecondary}>Analytics</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={signOut} style={homeStyles.logoutButton}>
            <Text style={homeStyles.logoutText}>
              {isGuestMode ? '← Recommencer' : '← Se déconnecter'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CHOIX ACTION */}
      <Modal visible={showActionModal} transparent animationType="slide">
        <View style={homeStyles.modalOverlay}>
          <View style={homeStyles.modalContent}>
            <View style={homeStyles.modalHandle} />
            <Text style={homeStyles.modalTitle}>Que veux-tu noter ?</Text>
            <Text style={homeStyles.modalSubtitle}>Choisis le type d'événement</Text>

            <TouchableOpacity
              style={[homeStyles.modalOptionButton, homeStyles.modalOptionIncident]}
              onPress={() => {
                setShowActionModal(false);
                navigation.navigate('Walk', { type: 'incident' });
              }}
              activeOpacity={0.8}
            >
              <View style={homeStyles.modalOptionRow}>
                <View style={[homeStyles.modalOptionIconContainer, homeStyles.modalOptionIconIncident]}>
                  <Text style={homeStyles.modalOptionIcon}>⚠️</Text>
                </View>
                <View style={homeStyles.modalOptionInfo}>
                  <Text style={homeStyles.modalOptionTitle}>Incident à la maison</Text>
                  <Text style={homeStyles.modalOptionDescription}>Pipi ou caca à l'intérieur</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[homeStyles.modalOptionButton, homeStyles.modalOptionSuccess]}
              onPress={() => {
                setShowActionModal(false);
                navigation.navigate('Walk', { type: 'walk' });
              }}
              activeOpacity={0.8}
            >
              <View style={homeStyles.modalOptionRow}>
                <View style={[homeStyles.modalOptionIconContainer, homeStyles.modalOptionIconSuccess]}>
                  <Text style={homeStyles.modalOptionIcon}>🌳</Text>
                </View>
                <View style={homeStyles.modalOptionInfo}>
                  <Text style={homeStyles.modalOptionTitle}>Sortie dehors</Text>
                  <Text style={homeStyles.modalOptionDescription}>Balade réussie à l'extérieur</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowActionModal(false)} style={homeStyles.modalCancelButton}>
              <Text style={homeStyles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL TRIAL */}
      <Modal visible={showTrialModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#fff', padding: 32, borderRadius: 32, width: '100%', alignItems: 'center' }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#fef3c7', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 48 }}>⚠️</Text>
            </View>
            <Text style={{ fontSize: 24, fontWeight: '800', marginBottom: 8, textAlign: 'center' }}>
              Essai gratuit terminé
            </Text>
            <Text style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 24 }}>
              Créé un compte pour continuer à suivre les progrès de {currentDog?.name || 'ton chiot'} 🐶
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowTrialModal(false);
                signOut();
              }}
              style={{ backgroundColor: '#6366f1', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 16, width: '100%', alignItems: 'center' }}
            >
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>Créer mon compte</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowTrialModal(false)} style={{ marginTop: 16, paddingVertical: 8 }}>
              <Text style={{ color: '#6b7280', fontSize: 15, fontWeight: '600' }}>Plus tard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}