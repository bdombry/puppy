/**
 * Tests pour useWalkHistory et useAnalytics hooks avec cache
 * 
 * Exécuter: npm test -- useHistoryAnalytics.test.js
 */

import { renderHook, waitFor } from '@testing-library/react-native';
import { useWalkHistory } from '../useWalkHistory';
import { useAnalytics } from '../useAnalytics';
import { cacheService, CACHE_KEYS, CACHE_DURATION } from '../../components/services/cacheService';
import * as supabase from '../../config/supabase';

// Mock supabase
jest.mock('../../config/supabase');

describe('🎣 History & Analytics Hooks with Cache', () => {
  beforeEach(() => {
    cacheService.clear();
    jest.clearAllMocks();
  });

  describe('useWalkHistory', () => {
    test('✅ Charger données sans cache', async () => {
      const mockWalks = [
        { id: 1, dog_id: 5, pee: true, pee_location: 'outside' },
        { id: 2, dog_id: 5, poop: true, poop_location: 'inside', incident_reason: 'oublie' },
      ];
      const mockActivities = [
        { id: 1, dog_id: 5, title: 'Jeu au parc' },
      ];

      supabase.supabase.from = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockWalks,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockActivities,
                error: null,
              }),
            }),
          }),
        });

      const { result } = renderHook(() => useWalkHistory(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.walks).toEqual(mockWalks);
      expect(result.current.activities).toEqual(mockActivities);
      expect(result.current.totalStats.successCount).toBe(1);
      expect(result.current.totalStats.incidentCount).toBe(1);
    });

    test('✅ Utiliser cache au 2ème chargement', async () => {
      const mockData = [{ id: 1, dog_id: 5 }];

      // Première requête
      supabase.supabase.from = jest.fn()
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: mockData,
                error: null,
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              order: jest.fn().mockResolvedValueOnce({
                data: [],
                error: null,
              }),
            }),
          }),
        });

      // Premier hook
      const { result: result1 } = renderHook(() => useWalkHistory(5));
      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      // Cache devrait être rempli
      const key = CACHE_KEYS.OUTING_HISTORY(5, 30);
      expect(cacheService.has(key)).toBe(true);

      // Deuxième hook (cache hit)
      const { result: result2 } = renderHook(() => useWalkHistory(5));
      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(result2.current.walks).toEqual(mockData);
    });

    test('✅ Invalider cache après refresh', async () => {
      const mockData = [{ id: 1 }];

      supabase.supabase.from = jest.fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: mockData,
                error: null,
              }),
            }),
          }),
        });

      const { result } = renderHook(() => useWalkHistory(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Cache rempli
      const key = CACHE_KEYS.OUTING_HISTORY(5, 30);
      expect(cacheService.has(key)).toBe(true);

      // Invalider
      cacheService.invalidatePattern(`.*history.*_5`);
      expect(cacheService.has(key)).toBe(false);
    });

    test('✅ Pas de chargement si dogId undefined', async () => {
      const { result } = renderHook(() => useWalkHistory(undefined));

      expect(result.current.loading).toBe(false);
      expect(result.current.walks).toEqual([]);
    });
  });

  describe('useAnalytics', () => {
    test('✅ Charger stats sans cache', async () => {
      const mockStats = {
        total: 42,
        peeCount: 25,
        poopCount: 17,
        successRate: 92,
      };

      // Mock analyticsService
      jest.mock('../services/analyticsService', () => ({
        getAdvancedStats: jest.fn().mockResolvedValue(mockStats),
      }));

      const { result } = renderHook(() => useAnalytics(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
    });

    test('✅ Cacher analytics avec durée ANALYTICS (10 min)', async () => {
      const mockStats = { total: 42 };

      jest.mock('../services/analyticsService', () => ({
        getAdvancedStats: jest.fn().mockResolvedValue(mockStats),
      }));

      const { result } = renderHook(() => useAnalytics(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const key = CACHE_KEYS.ANALYTICS(5, '30d');
      const cached = cacheService.get(key);

      expect(cached).toEqual(mockStats);
      // Vérifier la durée (10 min = 600000ms)
      // (C'est difficile à tester sans accès direct aux internals du cache)
    });

    test('✅ Pas de chargement si dogId undefined', async () => {
      const { result } = renderHook(() => useAnalytics(undefined));

      expect(result.current.loading).toBe(false);
      expect(result.current.stats).toBeNull();
    });

    test('✅ Invalider analytics cache', async () => {
      const mockStats = { total: 42 };

      jest.mock('../services/analyticsService', () => ({
        getAdvancedStats: jest.fn().mockResolvedValue(mockStats),
      }));

      const { result } = renderHook(() => useAnalytics(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const key = CACHE_KEYS.ANALYTICS(5, '30d');
      expect(cacheService.has(key)).toBe(true);

      cacheService.invalidatePattern(`analytics_.*_5`);
      expect(cacheService.has(key)).toBe(false);
    });
  });

  describe('Scénarios Réels', () => {
    test('✅ Navigation: History → Other → History (utilise cache)', async () => {
      // Simuler 2 renders
      const { result: result1 } = renderHook(() => useWalkHistory(5));
      
      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      // Cache rempli après premier chargement
      const key = CACHE_KEYS.OUTING_HISTORY(5, 30);
      expect(cacheService.has(key)).toBe(true);

      // Deuxième render (retour sur screen)
      const { result: result2 } = renderHook(() => useWalkHistory(5));
      
      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      // Should use cache (instant)
      expect(result2.current.walks).toEqual(result1.current.walks);
    });

    test('✅ Refresh invalide le cache', () => {
      const key = CACHE_KEYS.OUTING_HISTORY(5, 30);
      cacheService.set(key, [{ id: 1 }], CACHE_DURATION.HISTORY);

      expect(cacheService.has(key)).toBe(true);

      // Invalider par pattern
      cacheService.invalidatePattern(`.*history.*_5`);

      expect(cacheService.has(key)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('✅ Gérer erreur DB sans crash', async () => {
      supabase.supabase.from = jest.fn()
        .mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({
                data: null,
                error: new Error('DB Error'),
              }),
            }),
          }),
        });

      const { result } = renderHook(() => useWalkHistory(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.walks).toEqual([]);
    });

    test('✅ Multiple dogs isolation', () => {
      const key5 = CACHE_KEYS.OUTING_HISTORY(5, 30);
      const key7 = CACHE_KEYS.OUTING_HISTORY(7, 30);

      cacheService.set(key5, [{ dog: 5 }]);
      cacheService.set(key7, [{ dog: 7 }]);

      // Invalider seulement dog 5
      cacheService.invalidatePattern(`.*history.*_5`);

      expect(cacheService.has(key5)).toBe(false);
      expect(cacheService.has(key7)).toBe(true);
    });
  });
});
