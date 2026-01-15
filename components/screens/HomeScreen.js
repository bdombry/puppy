import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  RefreshControl,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { GlobalStyles } from '../../styles/global';
import { homeStyles } from '../../styles/homeStyles';
import { useNavigation } from '@react-navigation/native';
import { DogCardWithProgress } from '../DogCardWithProgress';
import { StatsCards } from '../charts/StatsCards';
import { RecordButton } from '../buttons/RecordButton';
import { HistoryButton } from '../buttons/HistoryButton';
import { AnalyticsButton } from '../buttons/AnalyticsButton';
import { AccountButton } from '../buttons/AccountButton';
import { LogoutButton } from '../buttons/LogoutButton';
import { LastWalkTimer } from '../LastWalkTimer';
import { LastPeeTimer } from '../LastPeeTimer';
import { LastPoopTimer } from '../LastPoopTimer';
import { TimersSection } from '../TimersSection';
import { ActionModal } from '../ActionModal';
import { useHomeData } from '../../hooks/useHomeData';
import { useTimer } from '../../hooks/useTimer';
import { EMOJI } from '../../constants/config';
import { screenStyles } from '../../styles/screenStyles';

export default function HomeScreen() {
  const { currentDog, dogs, setCurrentDog, signOut } = useAuth();
  const navigation = useNavigation();

  // State local
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDogSelector, setShowDogSelector] = useState(false);
  const [progressAnim] = useState(new Animated.Value(0));
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1w');
  const [streakMode, setStreakMode] = useState('activity');

  // Hooks personnalisés
  const { stats, totalOutings, streakData, lastOuting, lastPee, lastPoop, loading, refreshData, activities, outings } = useHomeData(
    currentDog?.id,
    selectedPeriod
  );
  const timeSince = useTimer(lastOuting);
  const timeSincePee = useTimer(lastPee);
  const timeSincePoop = useTimer(lastPoop);

  // Recharger les données quand l'écran reçoit le focus
  // MAIS: seulement recharger si le dogId a changé, pas à chaque retour
  useFocusEffect(
    useCallback(() => {
      // Forcer le refresh des timers après enregistrement d'une balade
      // Ajouter un petit délai pour laisser le temps à Supabase de synchroniser
      setTimeout(() => {
        refreshData();
      }, 1000);
    }, [refreshData])
  );

  // Animer la barre de progrès
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: stats?.percentage || 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [stats?.percentage, progressAnim]);

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
    try {
      switch (streakMode) {
        case 'activity':
          return {
            value: streakData?.activity || 0,
            label: (streakData?.activity || 0) <= 1 ? 'Jour actif' : 'Jours actifs',
            icon: EMOJI.fire,
          };
        case 'clean':
          return {
            value: streakData?.clean || 0,
            label: (streakData?.clean || 0) <= 1 ? 'Jour sans incident' : 'Jours sans incident',
            icon: EMOJI.sparkle,
          };
        default:
          return { value: 0, label: 'Streak', icon: EMOJI.fire };
      }
    } catch (error) {
      console.error('Erreur getStreakDisplay:', error);
      return { value: 0, label: 'Streak', icon: EMOJI.fire };
    }
  };

  const streakDisplay = getStreakDisplay();

  const handleActionModalClose = () => {
    setShowActionModal(false);
  };

  const handleDogSelectorOpen = () => {
    setShowDogSelector(true);
  };

  const handleDogSelectorClose = () => {
    setShowDogSelector(false);
  };

  const handleDogSelect = (dog) => {
    console.log('🐕 Changement vers chien:', dog?.name, dog?.id);
    setCurrentDog(dog);
    setShowDogSelector(false);
  };

  const handleRecordWalk = () => {
    setShowActionModal(false);
    navigation.navigate('Walk', { type: 'walk' });
  };

  const handleRecordIncident = () => {
    setShowActionModal(false);
    navigation.navigate('Walk', { type: 'incident' });
  };

  const handleRecordFeeding = () => {
    setShowActionModal(false);
    navigation.navigate('Feeding');
  };

  const handleRecordActivity = () => {
    setShowActionModal(false);
    navigation.navigate('Activity');
  };

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView
        contentContainerStyle={screenStyles.screenContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6366f1" />
        }
      >
        {/* HEADER */}
        <View style={homeStyles.header}>
          <View style={homeStyles.headerRow}>
            <TouchableOpacity onPress={handleDogSelectorOpen} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={homeStyles.headerTitle}>{currentDog?.name || 'Sélectionner un chien'}</Text>
              <Text style={{ fontSize: 16, marginLeft: 5 }}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={homeStyles.headerAccountButtonRight}
              onPress={() => navigation.navigate('Account')}
            >
              <Text style={homeStyles.headerAccountEmoji}>🧑</Text>
            </TouchableOpacity>
          </View>
          {currentDog && (
            <Text style={homeStyles.headerSubtitle}>
              Suivi des besoins de {currentDog.name}
            </Text>
          )}

          <TimersSection lastOuting={timeSince || null} />
          <LastPeeTimer lastPeeTime={timeSincePee || null} />
          <LastPoopTimer lastPoopTime={timeSincePoop || null} />
        </View>

        <View style={homeStyles.content}>
          {/* CHIEN + PROGRESSION */}
          {currentDog && (
            <DogCardWithProgress
              dog={currentDog}
              onSettingsPress={() => navigation.navigate('DogProfile')}
              stats={stats || { outside: 0, inside: 0, total: 0, percentage: 0 }}
              loading={loading}
              selectedPeriod={selectedPeriod}
              onPeriodChange={handlePeriodChange}
              progressAnim={progressAnim}
            />
          )}

          {/* BOUTONS Enregistrement sorties incidents */}
          <RecordButton onPress={() => setShowActionModal(true)} />
          
          {/* STATS CARDS */}
          <StatsCards
            totalOutings={totalOutings || 0}
            streakValue={streakDisplay.value || 0}
            streakLabel={streakDisplay.label || 'Streak'}
            streakIcon={streakDisplay.icon || '🔥'}
            onStreakPress={handleStreakClick}
          />

          {/* BOUTONS D'ACTION */}

          <LogoutButton onPress={signOut} />
        </View>
      </ScrollView>

      {/* MODALES */}
      <ActionModal
        visible={showActionModal}
        onClose={handleActionModalClose}
        onIncidentPress={handleRecordIncident}
        onWalkPress={handleRecordWalk}
        onActivityPress={handleRecordActivity}
        onFeedingPress={handleRecordFeeding}
      />

      {/* MODAL SÉLECTEUR DE CHIEN */}
      <Modal
        visible={showDogSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDogSelectorClose}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end',
          }}
          activeOpacity={1}
          onPress={handleDogSelectorClose}
        >
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              padding: 20,
              paddingBottom: 40,
            }}
            activeOpacity={1}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
              Sélectionner un chien
            </Text>
            <FlatList
              data={dogs}
              keyExtractor={(item) => item.id?.toString() || 'unknown'}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={{
                    padding: 15,
                    borderBottomWidth: 1,
                    borderBottomColor: '#eee',
                    backgroundColor: currentDog?.id === item.id ? '#f0f8ff' : 'transparent',
                  }}
                  onPress={() => handleDogSelect(item)}
                >
                  <Text style={{ fontSize: 16 }}>{item.name || 'Chien sans nom'}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
