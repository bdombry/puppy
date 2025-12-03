// src/services/streakService.js
import { supabase } from '../../config/supabase';

/**
 * Calcule le nombre de jours consécutifs avec au moins 1 enregistrement
 * Combine les sorties normales + balades
 */
export const getActivityStreak = async (dogId) => {
  try {
    // Récupérer les sorties normales
    const { data: outings, error: outingsError } = await supabase
      .from('outings')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false });

    if (outingsError) throw outingsError;

    // Récupérer les balades
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false });

    if (activitiesError) throw activitiesError;

    const allRecords = [...(outings || []), ...(activities || [])];

    if (allRecords.length === 0) return 0;

    // Groupe par jour
    const daySet = new Set();
    allRecords.forEach(record => {
      const date = new Date(record.datetime);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      daySet.add(dayKey);
    });

    const uniqueDays = Array.from(daySet).sort().reverse();
    
    // Calcule le streak
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDays.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

      if (uniqueDays.includes(checkKey)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Erreur getActivityStreak:', error);
    return 0;
  }
};

/**
 * Calcule le nombre de jours consécutifs sans incident
 * Combine les sorties normales + balades
 */
export const getCleanStreak = async (dogId) => {
  try {
    // Récupérer les sorties normales
    const { data: outings, error: outingsError } = await supabase
      .from('outings')
      .select('datetime, pee_location, poop_location')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false });

    if (outingsError) throw outingsError;

    // Récupérer les balades
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('datetime, pee_incident, poop_incident')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false });

    if (activitiesError) throw activitiesError;

    const allOutings = outings || [];
    const allActivities = activities || [];

    if (allOutings.length === 0 && allActivities.length === 0) return 0;

    // Groupe par jour et vérifie s'il y a eu un incident
    const dayMap = {};

    // Ajouter les sorties
    allOutings.forEach(o => {
      const date = new Date(o.datetime);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const hasIncident = 
        o.pee_location === 'inside' || 
        o.poop_location === 'inside';

      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { hasIncident: false };
      }

      if (hasIncident) {
        dayMap[dayKey].hasIncident = true;
      }
    });

    // Ajouter les balades avec incidents
    allActivities.forEach(a => {
      const date = new Date(a.datetime);
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      const hasIncident = a.pee_incident || a.poop_incident;

      if (!dayMap[dayKey]) {
        dayMap[dayKey] = { hasIncident: false };
      }

      if (hasIncident) {
        dayMap[dayKey].hasIncident = true;
      }
    });

    const days = Object.keys(dayMap).sort().reverse();
    
    // Calcule le streak sans incident
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < days.length; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const checkKey = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;

      if (dayMap[checkKey] && !dayMap[checkKey].hasIncident) {
        streak++;
      } else if (dayMap[checkKey]) {
        // Il y a eu un incident ce jour
        break;
      }
      // Si pas de données ce jour, on continue (pas d'incident = ok)
    }

    return streak;
  } catch (error) {
    console.error('Erreur getCleanStreak:', error);
    return 0;
  }
};

/**
 * Récupère le nombre total d'enregistrements
 */
export const getTotalRecords = async (dogId) => {
  try {
    const { count, error } = await supabase
      .from('outings')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erreur getTotalRecords:', error);
    return 0;
  }
};