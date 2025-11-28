// src/services/timerService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère le dernier outing d'un chien
 */
export const getLastOuting = async (dogId) => {
  try {
    // Mode connecté
    const { data, error } = await supabase
      .from('outings')
      .select('datetime, pee_location, poop_location')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = pas de résultat
    return data;
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