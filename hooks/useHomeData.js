/**
 * Hook personnalisé pour gérer les données du HomeScreen
 * Logique métier centralisée et réutilisable
 */

import { useCallback, useEffect, useState } from 'react';
import { getPeeStats, getTotalOutings } from '../components/services/supabaseService';
import { getActivityStreak, getCleanStreak } from '../components/services/streakService';
import { getLastOuting } from '../components/services/timerService';

export function useHomeData(dogId, selectedPeriod) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [peeStats, total, activityStreak, cleanStreak, lastOut] = await Promise.all([
        getPeeStats(dogId, selectedPeriod),
        getTotalOutings(dogId),
        getActivityStreak(dogId),
        getCleanStreak(dogId),
        getLastOuting(dogId),
      ]);

      setStats(peeStats);
      setTotalOutings(total);
      setStreakData({
        activity: activityStreak,
        clean: cleanStreak,
      });
      setLastOuting(lastOut);
    } catch (err) {
      console.error('❌ Erreur chargement données HomeScreen:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dogId, selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    totalOutings,
    streakData,
    lastOuting,
    loading,
    error,
    refreshData: loadData,
  };
}
