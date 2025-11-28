// src/services/supabaseService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère les stats de propreté pour un chien avec filtre de période
 * @param {string} dogId - ID du chien
 * @param {string} period - '1w' | '1m' | '3m' | '6m' | 'all'
 */
export const getPeeStats = async (dogId, period = '1w') => {
  try {
    console.log('🔍 getPeeStats appelé avec:', { dogId, period });
    
    // Calcul de la date de début selon la période
    let startDate = null;
    const now = new Date();
    
    if (period !== 'all') {
      startDate = new Date();
      
      switch (period) {
        case '1w':
          startDate.setDate(now.getDate() - 7);
          break;
        case '1m':
          startDate.setDate(now.getDate() - 30);
          break;
        case '3m':
          startDate.setDate(now.getDate() - 90);
          break;
        case '6m':
          startDate.setDate(now.getDate() - 180);
          break;
      }
      
      console.log('📅 Date de début:', startDate.toISOString());
    } else {
      console.log('📅 Période: ALL TIME');
    }

    // Mode connecté - Supabase
    let query = supabase
      .from('outings')
      .select('pee, pee_location, poop, poop_location, datetime')
      .eq('dog_id', dogId);

    // Ajouter le filtre de date si nécessaire
    if (startDate) {
      query = query.gte('datetime', startDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }

    const events = data || [];
    console.log('📊 Events récupérés:', events.length);
    
    let outside = 0;
    let inside = 0;
    
    events.forEach(event => {
      const hasOutside = 
        (event.pee && event.pee_location === 'outside') || 
        (event.poop && event.poop_location === 'outside');
      
      const hasInside = 
        (event.pee && event.pee_location === 'inside') || 
        (event.poop && event.poop_location === 'inside');
      
      if (hasOutside) outside++;
      if (hasInside) inside++;
    });
    
    const total = outside + inside;
    const percentage = total === 0 ? 0 : Math.round((outside / total) * 100);

    console.log('✅ Résultats:', { outside, inside, total, percentage });
    return { outside, inside, total, percentage };
  } catch (error) {
    console.error('❌ Erreur getPeeStats:', error);
    return { outside: 0, inside: 0, total: 0, percentage: 0 };
  }
};

/**
 * Récupère le nombre total d'enregistrements (toujours ALL TIME)
 */
export const getTotalOutings = async (dogId) => {
  try {
    const { count, error } = await supabase
      .from('outings')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Erreur getTotalOutings:', error);
    return 0;
  }
};