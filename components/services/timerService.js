// src/services/timerService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère la dernière balade (activity uniquement)
 * Une balade = promenade enregistrée dans activities
 */
export const getLastOuting = async (dogId) => {
  try {
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    if (activityData && (!activityError || activityError.code === 'PGRST116')) {
      return activityData;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur getLastOuting:', error);
    return null;
  }
};

/**
 * Récupère le dernier besoin (outing OU activity avec pipi/caca)
 * Un besoin = pipi/caca enregistré dans outings OU activity
 */
export const getLastNeed = async (dogId) => {
  try {
    // Récupérer le dernier besoin dans outings
    const { data: outingData, error: outingError } = await supabase
      .from('outings')
      .select('datetime')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    // Récupérer la dernière activité avec pipi ou caca
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('datetime')
      .eq('dog_id', dogId)
      .or('pee.eq.true,poop.eq.true')
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    // Comparer les deux et retourner la plus récente
    let lastNeed = null;
    
    if (outingData && (!outingError || outingError.code === 'PGRST116')) {
      lastNeed = outingData;
    }
    
    if (activityData && (!activityError || activityError.code === 'PGRST116')) {
      if (!lastNeed || new Date(activityData.datetime) > new Date(lastNeed.datetime)) {
        lastNeed = activityData;
      }
    }
    
    return lastNeed;
  } catch (error) {
    console.error('Erreur getLastNeed:', error);
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