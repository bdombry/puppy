/**
 * WalkHistoryScreen - Affiche l'historique des balades
 * 
 * Utilise le cache intelligemment:
 * - 1ère visite: charge depuis cache si exists, sinon DB
 * - Changement de page: utilise le cache
 * - Après enregistrement: cache invalidé, recharge à la visite suivante
 * - Pull-to-refresh: force rechargement
 */

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

  // ✅ Au montage: charger les données (utilise le cache du hook)
  useEffect(() => {
    // Le hook s'en charge automatiquement au montage
  }, []);

  // ✅ Quand on REVIENT sur le screen: vérifier si cache invalidé
  useFocusEffect(
    useCallback(() => {
      // Cette fonction s'exécute à CHAQUE FOIS qu'on revient sur le screen
      // Mais le hook gérera le cache intelligemment
      console.log('🔄 WalkHistoryScreen: Focus détecté');
      // Pas besoin d'appeler refreshData() ici - le cache se gère tout seul
    }, [])
  );

  // Gestion du Delete
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

  // ✅ Pull-to-refresh: invalider le cache ET recharger
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Invalider le cache pour forcer le rechargement
    cacheService.invalidatePattern(`.*history.*_${currentDog?.id}`);
    // Recharger les données (skip cache)
    await refreshData();
    setRefreshing(false);
  }, [currentDog?.id, refreshData]);

  return (
    <View style={GlobalStyles.safeArea}>
      <ScrollView 
        contentContainerStyle={screenStyles.screenContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Les onglets et la liste vont ici... */}
        {loading && <ActivityIndicator size="large" color={colors.primary} />}
        
        {error && (
          <Text style={{ color: colors.error, textAlign: 'center' }}>
            ❌ Erreur: {error}
          </Text>
        )}

        {!loading && allItems.length === 0 && (
          <Text style={{ color: colors.gray500, textAlign: 'center' }}>
            Pas d'enregistrements
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Styles...
});
