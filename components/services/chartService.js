// src/services/chartService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère les stats des 7 derniers jours pour le graphique
 * Combine les données des tables outings et activities
 */
export const getLast7DaysStats = async (dogId) => {
  try {
    // Utiliser UTC pour comparer avec les données en UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Créer les 7 derniers jours en UTC
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
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
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    // Récupérer outings
    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .select('datetime, pee, pee_location, poop, poop_location')
      .eq('dog_id', dogId)
      .gte('datetime', startDate.toISOString());

    if (outingsError) throw outingsError;
    const outings = outingsData || [];

    // Récupérer activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('datetime, pee, pee_incident, poop, poop_incident')
      .eq('dog_id', dogId)
      .gte('datetime', startDate.toISOString());

    if (activitiesError) throw activitiesError;
    const activities = activitiesData || [];

    // Remplir les stats par jour depuis outings
    outings.forEach(outing => {
      const outingDate = new Date(outing.datetime);
      const dayKey = outingDate.toISOString().split('T')[0];
      
      const dayData = days.find(d => d.dayKey === dayKey);
      if (!dayData) return;

      // Compter pipi et caca indépendamment
      if (outing.pee) {
        if (outing.pee_location === 'outside') {
          dayData.outside++;
        } else if (outing.pee_location === 'inside') {
          dayData.inside++;
        }
      }
      
      if (outing.poop) {
        if (outing.poop_location === 'outside') {
          dayData.outside++;
        } else if (outing.poop_location === 'inside') {
          dayData.inside++;
        }
      }
    });

    // Remplir les stats par jour depuis activities (succès ET incidents)
    activities.forEach(activity => {
      const activityDate = new Date(activity.datetime);
      const dayKey = activityDate.toISOString().split('T')[0];
      
      const dayData = days.find(d => d.dayKey === dayKey);
      if (!dayData) return;

      // Compter les succès et incidents séparément
      if (activity.pee) {
        if (activity.pee_incident) {
          dayData.inside++;
        } else {
          dayData.outside++;
        }
      }
      
      if (activity.poop) {
        if (activity.poop_incident) {
          dayData.inside++;
        } else {
          dayData.outside++;
        }
      }
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