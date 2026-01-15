/**
 * Hook personnalisé pour gérer les données du HomeScreen
 * Logique métier centralisée et réutilisable
 * Inclut système de cache pour éviter recharges inutiles
 */

import { useCallback, useEffect, useState } from 'react';
import { getPeeStats, getTotalOutings } from '../components/services/supabaseService';
import { getActivityStreak, getCleanStreak } from '../components/services/streakService';
import { getLastOuting, getLastPee, getLastPoop } from '../components/services/timerService';
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
  const [lastPee, setLastPee] = useState(null);
  const [lastPoop, setLastPoop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousDogId, setPreviousDogId] = useState(null);

  const loadData = useCallback(async () => {
    if (!dogId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ⏱️ Timeout pour éviter le blocage
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('HomeData loading timeout')), 8000)
      );

      const loadPromise = async () => {
        // Clés de cache
        const statsKey = CACHE_KEYS.HOME_STATS(dogId, selectedPeriod);
        const totalKey = CACHE_KEYS.HOME_TOTAL_OUTINGS(dogId);
        const streakKey = CACHE_KEYS.HOME_STREAK(dogId);

        // ✅ SI ON CHANGE DE CHIEN, ne pas utiliser le cache
        const isDogChanged = previousDogId && previousDogId !== dogId;
        console.log('🐕 Dog ID:', dogId, '| Previous:', previousDogId, '| Changed:', isDogChanged);

        // Vérifier le cache SEULEMENT si on n'a pas changé de chien
        let cachedStats = null;
        let cachedTotal = null;
        let cachedStreak = null;
        
        if (!isDogChanged) {
          cachedStats = cacheService.get(statsKey);
          cachedTotal = cacheService.get(totalKey);
          cachedStreak = cacheService.get(streakKey);
        } else {
          console.log('🔄 Changement de chien détecté - bypass du cache');
        }

        // Si TOUT est en cache, utiliser le cache (pas de recharge)
        // NOTE: last_outing, last_pee et last_poop ne sont PAS en cache (timers en temps réel)
        if (cachedStats && cachedTotal && cachedStreak && !isDogChanged) {
          console.log('📦 Utilisation du cache HomeScreen');
          setStats(cachedStats);
          setTotalOutings(cachedTotal);
          setStreakData(cachedStreak);
          setLoading(false);
          
          // Charger les timers IMMÉDIATEMENT (pas en arrière-plan)
          // Pour éviter que les composants affichent "aucun enregistrement" au premier rendu
          try {
            const [lastOut, lastP, lastPop] = await Promise.all([
              getLastOuting(dogId),
              getLastPee(dogId),
              getLastPoop(dogId),
            ]);
            setLastOuting(lastOut);
            setLastPee(lastP);
            setLastPoop(lastPop);
          } catch (err) {
            console.error('❌ Erreur chargement timers:', err);
          }
          
          return;
        }

        // Charger uniquement les données non-cachées
        const [peeStats, total, activityStreak, cleanStreak, lastOut, lastP, lastPop] = await Promise.all([
          cachedStats || getPeeStats(dogId, selectedPeriod),
          cachedTotal || getTotalOutings(dogId),
          cachedStreak?.activity ? Promise.resolve(cachedStreak.activity) : getActivityStreak(dogId),
          cachedStreak?.clean ? Promise.resolve(cachedStreak.clean) : getCleanStreak(dogId),
          getLastOuting(dogId),  // TOUJOURS appeler (pas de cache)
          getLastPee(dogId),     // TOUJOURS appeler (pas de cache)
          getLastPoop(dogId),    // TOUJOURS appeler (pas de cache)
        ]);

        // Mettre à jour le state avec données mise en cache ou nouvelles
        const finalStats = cachedStats || peeStats;
        const finalTotal = cachedTotal || total;
        const finalStreak = cachedStreak || { activity: activityStreak, clean: cleanStreak };

        setStats(finalStats);
        setTotalOutings(finalTotal);
        setStreakData(finalStreak);
        setLastOuting(lastOut);   // Toujours les données fraîches
        setLastPee(lastP);        // Toujours les données fraîches
        setLastPoop(lastPop);     // Toujours les données fraîches

        // Cacher les données si nouvelles (MAIS PAS les timers)
        if (!cachedStats) cacheService.set(statsKey, finalStats, CACHE_DURATION.STATIC);
        if (!cachedTotal) cacheService.set(totalKey, finalTotal, CACHE_DURATION.STATIC);
        if (!cachedStreak) cacheService.set(streakKey, finalStreak, CACHE_DURATION.STATIC);
        // NOTE: Les timers (lastOut, lastNeed) ne sont jamais cachés
      };

      // ⏱️ Exécuter avec timeout
      await Promise.race([loadPromise(), timeoutPromise]);

    } catch (err) {
      console.error('❌ Erreur chargement données HomeScreen:', err);
      setError(err.message);
      
      // En cas de timeout, définir des valeurs par défaut pour éviter le blocage
      if (err.message.includes('timeout')) {
        setStats({ outside: 0, inside: 0, total: 0, percentage: 0 });
        setTotalOutings(0);
        setStreakData({ activity: 0, clean: 0 });
        setLastOuting(null);
        setLastPee(null);
        setLastPoop(null);
      }
    } finally {
      setLoading(false);
    }
  }, [dogId, selectedPeriod]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ✅ Mettre à jour previousDogId après chaque chargement pour détecter le changement au prochain appel
  useEffect(() => {
    if (dogId) {
      setPreviousDogId(dogId);
    }
  }, [dogId]);

  return {
    stats,
    totalOutings,
    streakData,
    lastOuting,
    lastPee,
    lastPoop,
    loading,
    error,
    refreshData: loadData,
  };
}
