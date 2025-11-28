// src/services/chartService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère les stats des 7 derniers jours pour le graphique
 */
export const getLast7DaysStats = async (dogId) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Créer les 7 derniers jours
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        date: date,
        dayKey: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        outside: 0,
        inside: 0,
        total: 0,
        percentage: 0,
      });
    }

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 6);

    const { data, error } = await supabase
      .from('outings')
      .select('datetime, pee, pee_location, poop, poop_location')
      .eq('dog_id', dogId)
      .gte('datetime', startDate.toISOString());

    if (error) throw error;
    const outings = data || [];

    // Remplir les stats par jour
    outings.forEach(outing => {
      const outingDate = new Date(outing.datetime);
      const dayKey = outingDate.toISOString().split('T')[0];
      
      const dayData = days.find(d => d.dayKey === dayKey);
      if (!dayData) return;

      const hasOutside = 
        (outing.pee && outing.pee_location === 'outside') || 
        (outing.poop && outing.poop_location === 'outside');
      
      const hasInside = 
        (outing.pee && outing.pee_location === 'inside') || 
        (outing.poop && outing.poop_location === 'inside');

      if (hasOutside) dayData.outside++;
      if (hasInside) dayData.inside++;
    });

    // Calculer les totaux et pourcentages
    days.forEach(day => {
      day.total = day.outside + day.inside;
      day.percentage = day.total > 0 
        ? Math.round((day.outside / day.total) * 100)
        : 0;
    });

    return days;
  } catch (error) {
    console.error('Erreur getLast7DaysStats:', error);
    return [];
  }
};