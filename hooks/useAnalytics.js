/**
 * Hook personnalisé pour les données Analytics avec cache
 * Logique métier centralisée et réutilisable
 */

import { useCallback, useEffect, useState } from 'react';
import { getAdvancedStats, getDogCommunicationStats, getIncidentReasons } from '../components/services/analyticsService';
import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../components/services/cacheService';

export function useAnalytics(dogId) {
  const [stats, setStats] = useState(null);
  const [communicationStats, setCommunicationStats] = useState({
    activitiesAsked: 0,
    totalActivities: 0,
    successWithDemand: 0,
    outingsAsked: 0,
    totalSuccesses: 0,
  });
  const [incidentReasons, setIncidentReasons] = useState({
    pas_le_temps: 0,
    trop_tard: 0,
    flemme: 0,
    oublie: 0,
    autre: 0,
  });
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

      // Clé de cache
      const analyticsKey = CACHE_KEYS.ANALYTICS(dogId, '30d');
      const communicationKey = `analytics_communication_${dogId}`;
      const incidentReasonsKey = `analytics_incident_reasons_${dogId}`;

      // Vérifier le cache
      const cachedStats = cacheService.get(analyticsKey);
      const cachedCommunication = cacheService.get(communicationKey);
      const cachedIncidentReasons = cacheService.get(incidentReasonsKey);

      // Si tout est en cache → utiliser
      if (cachedStats && cachedCommunication && cachedIncidentReasons) {
        console.log('📦 Utilisation du cache Analytics complet');
        setStats(cachedStats);
        setCommunicationStats(cachedCommunication);
        setIncidentReasons(cachedIncidentReasons);
        setLoading(false);
        return;
      }

      // Charger les données non-cachées en parallèle (calculs coûteux)
      console.log('📊 Calcul analytics pour chien:', dogId);
      const [data, communication, reasons] = await Promise.all([
        cachedStats || getAdvancedStats(dogId),
        cachedCommunication || getDogCommunicationStats(dogId),
        cachedIncidentReasons || getIncidentReasons(dogId),
      ]);

      console.log('📡 Communication data reçue:', communication);

      const finalStats = cachedStats || data;
      const finalCommunication = cachedCommunication || communication;
      const finalReasons = cachedIncidentReasons || reasons;

      console.log('✅ Analytics chargées:', { finalStats: !!finalStats, finalCommunication: !!finalCommunication, finalReasons: finalReasons });

      setStats(finalStats);
      setCommunicationStats(finalCommunication);
      setIncidentReasons(finalReasons);

      // Cacher les données (10 min - calcul coûteux)
      if (!cachedStats) cacheService.set(analyticsKey, finalStats, CACHE_DURATION.ANALYTICS);
      if (!cachedCommunication) cacheService.set(communicationKey, finalCommunication, CACHE_DURATION.ANALYTICS);
      if (!cachedIncidentReasons) cacheService.set(incidentReasonsKey, finalReasons, CACHE_DURATION.ANALYTICS);

    } catch (err) {
      console.error('❌ Erreur chargement Analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [dogId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    stats,
    communicationStats,
    incidentReasons,
    loading,
    error,
    refreshData: loadData,
  };
}
