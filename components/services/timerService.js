// src/services/timerService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère le dernier outing ou activity d'un chien
 * Combine les données des tables outings et activities
 */
export const getLastOuting = async (dogId) => {
  try {
    // Récupérer le dernier outing
    const { data: outingData, error: outingError } = await supabase
      .from('outings')
      .select('datetime, pee_location, poop_location')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    // Récupérer la dernière activity
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    // Ignorer les erreurs "pas de résultat" (PGRST116)
    const hasOuting = outingData && (!outingError || outingError.code === 'PGRST116');
    const hasActivity = activityData && (!activityError || activityError.code === 'PGRST116');

    // Comparer les datetimes et retourner le plus récent
    if (hasOuting && hasActivity) {
      const outingDate = new Date(outingData.datetime);
      const activityDate = new Date(activityData.datetime);
      return outingDate > activityDate ? outingData : activityData;
    } else if (hasOuting) {
      return outingData;
    } else if (hasActivity) {
      return activityData;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur getLastOuting:', error);
    return null;
  }
};

/**
 * Formate le temps écoulé depuis un datetime
 */
export const formatTimeSince = (datetime) => {
  if (!datetime) return null;

  const now = new Date();
  const past = new Date(datetime);
  const diffMs = now - past;
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}j ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};