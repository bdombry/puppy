// src/services/analyticsService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère toutes les stats avancées
 */
export const getAdvancedStats = async (dogId, isGuestMode = false) => {
  try {
    let outings = [];

    if (isGuestMode) {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const data = await AsyncStorage.getItem('guestWalks');
      outings = data ? JSON.parse(data) : [];
    } else {
      const { data, error } = await supabase
        .from('outings')
        .select('*')
        .eq('dog_id', dogId);

      if (error) throw error;
      outings = data || [];
    }

    // Stats pipi vs caca
    const peeCount = outings.filter(o => o.pee).length;
    const poopCount = outings.filter(o => o.poop).length;

    // Stats friandises
    const treatGiven = outings.filter(o => o.treat).length;
    const totalOutside = outings.filter(o => 
      o.pee_location === 'outside' || o.poop_location === 'outside'
    ).length;
    const treatPercentage = totalOutside > 0 
      ? Math.round((treatGiven / totalOutside) * 100)
      : 0;

    // Stats par type (pipi/caca) inside vs outside
    const peeOutside = outings.filter(o => o.pee && o.pee_location === 'outside').length;
    const peeInside = outings.filter(o => o.pee && o.pee_location === 'inside').length;
    const poopOutside = outings.filter(o => o.poop && o.poop_location === 'outside').length;
    const poopInside = outings.filter(o => o.poop && o.poop_location === 'inside').length;

    const peeSuccessRate = peeCount > 0 
      ? Math.round((peeOutside / peeCount) * 100)
      : 0;
    const poopSuccessRate = poopCount > 0 
      ? Math.round((poopOutside / poopCount) * 100)
      : 0;

    // Heure la plus fréquente pour les incidents
    const incidentHours = outings
      .filter(o => o.pee_location === 'inside' || o.poop_location === 'inside')
      .map(o => new Date(o.datetime).getHours());

    const hourCounts = {};
    incidentHours.forEach(h => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const mostFrequentIncidentHour = Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b)
      : null;

    // Meilleure journée (plus haute % de réussite)
    const dayStats = {};
    outings.forEach(o => {
      const date = new Date(o.datetime).toISOString().split('T')[0];
      if (!dayStats[date]) {
        dayStats[date] = { outside: 0, inside: 0 };
      }
      const hasOutside = o.pee_location === 'outside' || o.poop_location === 'outside';
      const hasInside = o.pee_location === 'inside' || o.poop_location === 'inside';
      if (hasOutside) dayStats[date].outside++;
      if (hasInside) dayStats[date].inside++;
    });

    let bestDay = null;
    let bestDayPercentage = 0;
    Object.entries(dayStats).forEach(([date, stats]) => {
      const total = stats.outside + stats.inside;
      if (total > 0) {
        const percentage = Math.round((stats.outside / total) * 100);
        if (percentage > bestDayPercentage) {
          bestDayPercentage = percentage;
          bestDay = date;
        }
      }
    });

    return {
      total: outings.length,
      peeCount,
      poopCount,
      treatGiven,
      treatPercentage,
      peeSuccessRate,
      poopSuccessRate,
      peeOutside,
      peeInside,
      poopOutside,
      poopInside,
      mostFrequentIncidentHour,
      bestDay,
      bestDayPercentage,
    };
  } catch (error) {
    console.error('Erreur getAdvancedStats:', error);
    return null;
  }
};