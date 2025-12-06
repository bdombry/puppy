/**
 * Tests pour le système de cache
 * 
 * Exécuter: npm test -- cacheService.test.js
 */

import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../cacheService';

describe('🗂️ Cache Service', () => {
  beforeEach(() => {
    cacheService.clear();
  });

  describe('Basic Operations', () => {
    test('✅ Stocker et récupérer une valeur', () => {
      const data = { id: 1, name: 'Luna' };
      cacheService.set('dog_1', data);
      
      expect(cacheService.get('dog_1')).toEqual(data);
    });

    test('✅ Retourner null pour clé inexistante', () => {
      expect(cacheService.get('nonexistent')).toBeNull();
    });

    test('✅ Vérifier existence avec has()', () => {
      cacheService.set('key', 'value');
      
      expect(cacheService.has('key')).toBe(true);
      expect(cacheService.has('missing')).toBe(false);
    });
  });

  describe('Expiration', () => {
    test('✅ Expirer après temps spécifié', (done) => {
      cacheService.set('temp', 'value', 100); // 100ms
      
      expect(cacheService.get('temp')).toBe('value');
      
      setTimeout(() => {
        expect(cacheService.get('temp')).toBeNull();
        done();
      }, 150);
    });

    test('✅ Expiration défaut 5 min', (done) => {
      cacheService.set('default', 'value'); // 5 min par défaut
      
      expect(cacheService.get('default')).toBe('value');
      
      // Vérifier que c'est valide après 1 sec
      setTimeout(() => {
        expect(cacheService.get('default')).toBe('value');
        done();
      }, 1000);
    });
  });

  describe('Invalidation', () => {
    test('✅ Invalider une clé spécifique', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.invalidate('key1');
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBe('value2');
    });

    test('✅ Invalider par pattern regex', () => {
      cacheService.set('home_stats_5_1w', 'stats');
      cacheService.set('home_total_5', 'total');
      cacheService.set('home_streak_5', 'streak');
      cacheService.set('last_outing_5', 'outing');
      
      cacheService.invalidatePattern(`home_.*_5`);
      
      expect(cacheService.get('home_stats_5_1w')).toBeNull();
      expect(cacheService.get('home_total_5')).toBeNull();
      expect(cacheService.get('home_streak_5')).toBeNull();
      expect(cacheService.get('last_outing_5')).toBe('outing'); // Ne match pas le pattern
    });

    test('✅ Vider tout le cache', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      
      cacheService.clear();
      
      expect(cacheService.get('key1')).toBeNull();
      expect(cacheService.get('key2')).toBeNull();
    });
  });

  describe('Clés Pré-définies', () => {
    test('✅ Générer clés HomeScreen correctement', () => {
      const key1 = CACHE_KEYS.HOME_STATS(5, '1w');
      const key2 = CACHE_KEYS.HOME_TOTAL_OUTINGS(5);
      
      expect(key1).toBe('home_stats_5_1w');
      expect(key2).toBe('home_total_outings_5');
    });

    test('✅ Générer clés Timer', () => {
      const key = CACHE_KEYS.LAST_OUTING(5);
      
      expect(key).toBe('last_outing_5');
    });

    test('✅ Stocker avec clés générées', () => {
      const key = CACHE_KEYS.HOME_STATS(5, '7d');
      const stats = { outside: 10, inside: 2 };
      
      cacheService.set(key, stats);
      
      expect(cacheService.get(key)).toEqual(stats);
    });
  });

  describe('Durations', () => {
    test('✅ Constants de durée existent', () => {
      expect(CACHE_DURATION.STATIC).toBe(5 * 60 * 1000);       // 5 min
      expect(CACHE_DURATION.REALTIME).toBe(30 * 1000);         // 30 sec
      expect(CACHE_DURATION.HISTORY).toBe(2 * 60 * 1000);      // 2 min
      expect(CACHE_DURATION.ANALYTICS).toBe(10 * 60 * 1000);   // 10 min
    });

    test('✅ Utiliser STATIC pour stats', (done) => {
      const key = CACHE_KEYS.HOME_STATS(5, '1w');
      cacheService.set(key, { data: 'stats' }, CACHE_DURATION.STATIC);
      
      expect(cacheService.get(key)).not.toBeNull();
      
      // Vérifier que c'est valide après 1 sec
      setTimeout(() => {
        expect(cacheService.get(key)).not.toBeNull();
        done();
      }, 1000);
    });

    test('✅ Utiliser REALTIME pour timers', (done) => {
      const key = CACHE_KEYS.LAST_OUTING(5);
      cacheService.set(key, new Date(), CACHE_DURATION.REALTIME);
      
      expect(cacheService.get(key)).not.toBeNull();
      
      // Vérifier expiration après 35 sec
      setTimeout(() => {
        expect(cacheService.get(key)).toBeNull();
        done();
      }, 35000);
    }, 40000); // Timeout long test
  });

  describe('Scénario Réel', () => {
    test('✅ Scénario: HomeScreen → Cache → Revenir', (done) => {
      const statsKey = CACHE_KEYS.HOME_STATS(5, '1w');
      const stats1 = { outside: 10, inside: 2 };
      
      // Premier chargement
      cacheService.set(statsKey, stats1, CACHE_DURATION.STATIC);
      expect(cacheService.get(statsKey)).toEqual(stats1);
      
      // Utilisateur quitte et revient rapidement
      setTimeout(() => {
        expect(cacheService.get(statsKey)).toEqual(stats1); // Cache hit!
        done();
      }, 500);
    });

    test('✅ Scénario: Enregistrer sortie → Invalider cache', () => {
      // Initial load
      const statsKey = CACHE_KEYS.HOME_STATS(5, '1w');
      cacheService.set(statsKey, { outside: 10 });
      
      expect(cacheService.has(statsKey)).toBe(true);
      
      // Après enregistrement → invalider
      cacheService.invalidatePattern(`home_.*_5`);
      
      expect(cacheService.has(statsKey)).toBe(false);
    });

    test('✅ Scénario: Multi-chiens', () => {
      // Dog 5
      cacheService.set(CACHE_KEYS.HOME_STATS(5, '1w'), { dog: 5 });
      // Dog 7
      cacheService.set(CACHE_KEYS.HOME_STATS(7, '1w'), { dog: 7 });
      
      // Invalider seulement dog 5
      cacheService.invalidatePattern(`home_.*_5`);
      
      expect(cacheService.has(CACHE_KEYS.HOME_STATS(5, '1w'))).toBe(false);
      expect(cacheService.has(CACHE_KEYS.HOME_STATS(7, '1w'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    test('✅ Stocker null comme valeur', () => {
      cacheService.set('key', null);
      
      expect(cacheService.has('key')).toBe(true); // Stocké!
      expect(cacheService.get('key')).toBeNull(); // Retourne null
    });

    test('✅ Stocker undefined', () => {
      cacheService.set('key', undefined);
      
      expect(cacheService.has('key')).toBe(true);
      expect(cacheService.get('key')).toBeUndefined();
    });

    test('✅ Invalider pattern qui ne match rien', () => {
      cacheService.set('key1', 'value1');
      
      cacheService.invalidatePattern(`nomatch_.*`);
      
      expect(cacheService.get('key1')).toBe('value1'); // Non affecté
    });

    test('✅ Effacer avant expiration', (done) => {
      cacheService.set('temp', 'value', 5000);
      
      // Invalider avant expiration
      cacheService.invalidate('temp');
      expect(cacheService.get('temp')).toBeNull();
      
      // Vérifier que timer est bien supprimé (pas d'erreur)
      setTimeout(() => {
        expect(cacheService.get('temp')).toBeNull();
        done();
      }, 6000);
    }, 7000);
  });

  describe('Performance', () => {
    test('✅ Accès au cache < 1ms', () => {
      cacheService.set('key', { data: 'test' });
      
      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        cacheService.get('key');
      }
      const end = performance.now();
      
      const avgTime = (end - start) / 1000;
      expect(avgTime).toBeLessThan(1); // < 1ms en moyenne
    });

    test('✅ Gérer 1000 clés sans problème', () => {
      for (let i = 0; i < 1000; i++) {
        cacheService.set(`key_${i}`, { index: i });
      }
      
      expect(cacheService.get('key_500')).toEqual({ index: 500 });
      expect(cacheService.get('key_999')).toEqual({ index: 999 });
    });
  });
});
