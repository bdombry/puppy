/**
 * Hook personnalisé pour gérer les données du HomeScreen
 * Logique métier centralisée et réutilisable
 * Inclut système de cache pour éviter recharges inutiles
 */

import { useCallback, useEffect, useState } from 'react';
import { getPeeStats, getTotalOutings } from '../components/services/supabaseService';
import { getActivityStreak, getCleanStreak } from '../components/services/streakService';
import { getLastOuting, getLastNeed } from '../components/services/timerService';
import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../components/services/cacheService';

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
  const [lastNeed, setLastNeed] = useState(null);
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

      // Clés de cache
      const statsKey = CACHE_KEYS.HOME_STATS(dogId, selectedPeriod);
      const totalKey = CACHE_KEYS.HOME_TOTAL_OUTINGS(dogId);
      const streakKey = CACHE_KEYS.HOME_STREAK(dogId);

      // Vérifier le cache d'abord
      const cachedStats = cacheService.get(statsKey);
      const cachedTotal = cacheService.get(totalKey);
      const cachedStreak = cacheService.get(streakKey);

      // Si TOUT est en cache, utiliser le cache (pas de recharge)
      // NOTE: last_outing et last_need ne sont PAS en cache (timers en temps réel)
      if (cachedStats && cachedTotal && cachedStreak) {
        console.log('📦 Utilisation du cache HomeScreen');
        setStats(cachedStats);
        setTotalOutings(cachedTotal);
        setStreakData(cachedStreak);
        setLoading(false);
        
        // Charger les timers EN ARRIERE-PLAN (sans bloquer, sans retrigger l'animation)
        // Utilise setTimeout pour éviter de retrigger l'effet useEffect
        setTimeout(async () => {
          try {
            const [lastOut, lastN] = await Promise.all([
              getLastOuting(dogId),
              getLastNeed(dogId),
            ]);
            setLastOuting(lastOut);
            setLastNeed(lastN);
          } catch (err) {
            console.error('❌ Erreur chargement timers:', err);
          }
        }, 100);
        
        return;
      }

      // Charger uniquement les données non-cachées
      const [peeStats, total, activityStreak, cleanStreak, lastOut, lastN] = await Promise.all([
        cachedStats || getPeeStats(dogId, selectedPeriod),
        cachedTotal || getTotalOutings(dogId),
        cachedStreak?.activity ? Promise.resolve(cachedStreak.activity) : getActivityStreak(dogId),
        cachedStreak?.clean ? Promise.resolve(cachedStreak.clean) : getCleanStreak(dogId),
        getLastOuting(dogId),  // TOUJOURS appeler (pas de cache)
        getLastNeed(dogId),    // TOUJOURS appeler (pas de cache)
      ]);

      // Mettre à jour le state avec données mise en cache ou nouvelles
      const finalStats = cachedStats || peeStats;
      const finalTotal = cachedTotal || total;
      const finalStreak = cachedStreak || { activity: activityStreak, clean: cleanStreak };

      setStats(finalStats);
      setTotalOutings(finalTotal);
      setStreakData(finalStreak);
      setLastOuting(lastOut);   // Toujours les données fraîches
      setLastNeed(lastN);       // Toujours les données fraîches

      // Cacher les données si nouvelles (MAIS PAS les timers)
      if (!cachedStats) cacheService.set(statsKey, finalStats, CACHE_DURATION.STATIC);
      if (!cachedTotal) cacheService.set(totalKey, finalTotal, CACHE_DURATION.STATIC);
      if (!cachedStreak) cacheService.set(streakKey, finalStreak, CACHE_DURATION.STATIC);
      // NOTE: Les timers (lastOut, lastNeed) ne sont jamais cachés

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
    lastNeed,
    loading,
    error,
    refreshData: loadData,
  };
}
