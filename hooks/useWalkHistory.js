/**
 * Hook personnalisé pour les données WalkHistory avec cache
 * 
 * Stratégie de cache:
 * - Au montage: charger depuis cache s'il existe, sinon depuis DB
 * - Changement de page: utiliser le cache (pas de rechargement)
 * - refreshData(): force le rechargement depuis DB (skip cache)
 * - Après enregistrement: cache invalidé, recharge à la prochaine visite
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '../config/supabase';
import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../components/services/cacheService';

export function useWalkHistory(dogId) {
  const [walks, setWalks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [totalStats, setTotalStats] = useState({ 
    successCount: 0, 
    incidentCount: 0, 
    activitiesCount: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Ref pour éviter les rechargements multiples simultanés
  const isLoadingRef = useRef(false);
  const cachedDogIdRef = useRef(null);

  /**
   * Charge les données depuis Supabase
   */
  const fetchFromDB = useCallback(async () => {
    const [walksRes, activitiesRes] = await Promise.all([
      supabase
        .from('outings')
        .select('*', { count: 'exact' })
        .eq('dog_id', dogId)
        .order('datetime', { ascending: false }),
      supabase
        .from('activities')
        .select('*', { count: 'exact' })
        .eq('dog_id', dogId)
        .order('datetime', { ascending: false }),
    ]);

    if (walksRes.error) throw walksRes.error;
    if (activitiesRes.error) throw activitiesRes.error;

    const allWalks = walksRes.data || [];
    const allActivities = activitiesRes.data || [];

    // Calculer les stats
    const incidentCount = allWalks.filter(w => w.incident_reason).length;
    const successCount = allWalks.length - incidentCount;
    const stats = {
      successCount,
      incidentCount,
      activitiesCount: allActivities.length,
    };

    return { allWalks, allActivities, stats };
  }, [dogId]);

  /**
   * Charge les données: depuis cache si valide, sinon depuis DB
   * @param {boolean} skipCache - Si true, force le rechargement depuis DB
   */
  const performLoad = useCallback(
    async (skipCache = false) => {
      // Éviter les rechargements multiples simultanés
      if (isLoadingRef.current) {
        console.log('⏳ WalkHistory: Chargement déjà en cours');
        return;
      }

      if (!dogId) {
        setLoading(false);
        return;
      }

      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        // Clés de cache
        const walksKey = CACHE_KEYS.OUTING_HISTORY(dogId, 30);
        const activitiesKey = CACHE_KEYS.ACTIVITY_HISTORY(dogId, 30);
        const statsKey = `walk_history_stats_${dogId}`;

        // Essayer le cache en premier (sauf si skipCache)
        if (!skipCache) {
          const cachedWalks = cacheService.get(walksKey);
          const cachedActivities = cacheService.get(activitiesKey);
          const cachedStats = cacheService.get(statsKey);

          if (cachedWalks && cachedActivities && cachedStats) {
            console.log('📦 WalkHistory: Utilisation du cache');
            setWalks(cachedWalks);
            setActivities(cachedActivities);
            setTotalStats(cachedStats);
            setLoading(false);
            isLoadingRef.current = false;
            return;
          }
        }

        // Charger depuis DB
        console.log('🔄 WalkHistory: Rechargement depuis DB');
        const { allWalks, allActivities, stats } = await fetchFromDB();

        // Mettre à jour le state
        setWalks(allWalks);
        setActivities(allActivities);
        setTotalStats(stats);

        // Cacher les données
        cacheService.set(walksKey, allWalks, CACHE_DURATION.HISTORY);
        cacheService.set(activitiesKey, allActivities, CACHE_DURATION.HISTORY);
        cacheService.set(statsKey, stats, CACHE_DURATION.HISTORY);

      } catch (err) {
        console.error('❌ Erreur WalkHistory:', err);
        setError(err.message);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    },
    [dogId, fetchFromDB]
  );

  // ✅ Charger au montage (avec cache)
  // Uniquement si dogId change
  useEffect(() => {
    // Si dogId a changé, on recharge
    if (cachedDogIdRef.current !== dogId) {
      cachedDogIdRef.current = dogId;
      performLoad(false); // false = utiliser le cache
    }
  }, [dogId, performLoad]);

  // ✅ refreshData force le rechargement (sans cache)
  const refreshData = useCallback(() => {
    performLoad(true); // true = skip cache, recharger depuis DB
  }, [performLoad]);

  return {
    walks,
    activities,
    totalStats,
    loading,
    error,
    refreshData,
  };
}
