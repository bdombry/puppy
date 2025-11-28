import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { homeStyles } from '../../styles/homeStyles';
import { useNavigation } from '@react-navigation/native';
import { DogCardWithProgress } from '../DogCardWithProgress';
import { StatsCards } from '../StatsCards';
import { ActionButtons } from '../ActionButtons';
import { LastOutingTimer } from '../LastOutingTimer';
import { ActionModal } from '../ActionModal';
import { useHomeData } from '../../hooks/useHomeData';
import { useTimer } from '../../hooks/useTimer';
import { EMOJI } from '../../constants/config';

export default function HomeScreen() {
  const { currentDog, signOut } = useAuth();
  const navigation = useNavigation();

  // State local
  const [showActionModal, setShowActionModal] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1w');
  const [streakMode, setStreakMode] = useState('activity');

  // Hooks personnalisés
  const { stats, totalOutings, streakData, lastOuting, loading, refreshData } = useHomeData(
    currentDog?.id,
    selectedPeriod
  );
  const timeSince = useTimer(lastOuting);

  // Recharger les données quand l'écran reçoit le focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // Animer la barre de progrès
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stats.percentage,
      useNativeDriver: false,
      tension: 40,
      friction: 8,
    }).start();
  }, [stats.percentage, progressAnim]);

  // Gestionnaires d'événements
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleStreakClick = () => {
    const modes = ['activity', 'clean'];
    const currentIndex = modes.indexOf(streakMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setStreakMode(nextMode);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const getStreakDisplay = () => {
    switch (streakMode) {
      case 'activity':
        return {
          value: streakData.activity,
          label: streakData.activity <= 1 ? 'Jour actif' : 'Jours actifs',
          icon: EMOJI.fire,
        };
      case 'clean':
        return {
          value: streakData.clean,
          label: streakData.clean <= 1 ? 'Jour propre' : 'Jours propres',
          icon: EMOJI.sparkle,
        };
      default:
        return { value: 0, label: 'Streak', icon: EMOJI.fire };
    }
  };

  const streakDisplay = getStreakDisplay();

  const handleActionModalClose = () => {
    setShowActionModal(false);
  };

  const handleRecordWalk = () => {
    setShowActionModal(false);
    navigation.navigate('Walk', { type: 'walk' });
  };

  const handleRecordIncident = () => {
    setShowActionModal(false);
    navigation.navigate('Walk', { type: 'incident' });
  };

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
            <Text style={homeStyles.headerTitle}>{EMOJI.wave} Bonjour 👋</Text>
          </View>
          {currentDog && (
            <Text style={homeStyles.headerSubtitle}>
              Apprentissage de la propreté de {currentDog.name}
            </Text>
          )}

          <LastOutingTimer timeSince={timeSince} />
        </View>

        <View style={homeStyles.content}>
          {/* CHIEN + PROGRESSION */}
          {currentDog && (
            <DogCardWithProgress
              dog={currentDog}
              onSettingsPress={() => navigation.navigate('DogProfile')}
              stats={stats}
              loading={loading}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              progressAnim={progressAnim}
            />
          )}

          {/* STATS CARDS */}
          <StatsCards
            totalOutings={totalOutings}
            streakValue={streakDisplay.value}
            streakLabel={streakDisplay.label}
            streakIcon={streakDisplay.icon}
            onStreakPress={handleStreakClick}
          />

          {/* BOUTONS D'ACTION */}
          <ActionButtons
            onRecordPress={() => setShowActionModal(true)}
            onHistoryPress={() => navigation.navigate('WalkHistory')}
            onAnalyticsPress={() => navigation.navigate('Analytics')}
            onLogoutPress={signOut}
          />
        </View>
      </ScrollView>

      {/* MODALES */}
      <ActionModal
        visible={showActionModal}
        onClose={handleActionModalClose}
        onIncidentPress={handleRecordIncident}
        onWalkPress={handleRecordWalk}
      />
    </View>
  );
}
