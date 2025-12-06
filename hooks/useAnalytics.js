/**
 * Hook personnalisé pour les données Analytics avec cache
 * Logique métier centralisée et réutilisable
 */

import { useCallback, useEffect, useState } from 'react';
import { getAdvancedStats } from '../components/services/analyticsService';
import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../components/services/cacheService';

export function useAnalytics(dogId) {
  const [stats, setStats] = useState(null);
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

      // Vérifier le cache
      const cachedStats = cacheService.get(analyticsKey);

      // Si en cache → utiliser
      if (cachedStats) {
        console.log('📦 Utilisation du cache Analytics');
        setStats(cachedStats);
        setLoading(false);
        return;
      }

      // Charger depuis DB (calcul coûteux)
      console.log('📊 Calcul analytics pour chien:', dogId);
      const data = await getAdvancedStats(dogId);

      setStats(data);

      // Cacher les données (10 min - calcul coûteux)
      cacheService.set(analyticsKey, data, CACHE_DURATION.ANALYTICS);

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
    loading,
    error,
    refreshData: loadData,
  };
}
