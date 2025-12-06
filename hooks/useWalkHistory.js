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
    // Réussites = (pee=true AND location='outside') + (poop=true AND location='outside') dans outings
    //           + (pee=true) + (poop=true) dans activities
    const outingsSuccessCount = allWalks.reduce((sum, o) => {
      let count = 0;
      if (o.pee && o.pee_location === 'outside') count++;
      if (o.poop && o.poop_location === 'outside') count++;
      return sum + count;
    }, 0);

    const activitiesSuccessCount = allActivities.reduce((sum, a) => {
      let count = 0;
      if (a.pee) count++;
      if (a.poop) count++;
      return sum + count;
    }, 0);

    const successCount = outingsSuccessCount + activitiesSuccessCount;
    
    // Incidents = (pee=true AND location='inside') + (poop=true AND location='inside') dans outings
    //           + pee_incident=true + poop_incident=true dans activities
    // Incidents = nombre d'outings qui ont (pee inside OU poop inside)
    const outingsWithIncidents = allWalks.filter(o => 
      (o.pee && o.pee_location === 'inside') || (o.poop && o.poop_location === 'inside')
    );
    const outingsIncidentsCount = outingsWithIncidents.length;
    
    console.log('🔍 Outings with incidents:', outingsIncidentsCount, {
      sample: outingsWithIncidents.slice(0, 3).map(o => ({
        datetime: o.datetime,
        pee: o.pee,
        pee_location: o.pee_location,
        poop: o.poop,
        poop_location: o.poop_location,
        incident_reason: o.incident_reason
      }))
    });

    // Incidents = nombre d'activities qui ont (pee_incident OU poop_incident)
    const activitiesWithIncidents = allActivities.filter(a => 
      a.pee_incident || a.poop_incident
    );
    const activitiesIncidentsCount = activitiesWithIncidents.length;
    
    console.log('🔍 Activities with incidents:', activitiesIncidentsCount, {
      sample: activitiesWithIncidents.slice(0, 3).map(a => ({
        datetime: a.datetime,
        pee_incident: a.pee_incident,
        poop_incident: a.poop_incident
      }))
    });

    const incidentCount = outingsIncidentsCount + activitiesIncidentsCount;
    
    console.log('📊 WalkHistory Stats:', {
      outingsSuccessCount,
      activitiesSuccessCount,
      successCountTotal: successCount,
      outingsIncidentsCount,
      activitiesIncidentsCount,
      incidentCountTotal: incidentCount,
    });
    
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
