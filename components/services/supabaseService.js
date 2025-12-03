// src/services/supabaseService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère les stats de propreté pour un chien avec filtre de période
 * Combine les données des tables outings et activities
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

    // Requête table outings
    let outingsQuery = supabase
      .from('outings')
      .select('pee, pee_location, poop, poop_location, datetime')
      .eq('dog_id', dogId);

    if (startDate) {
      outingsQuery = outingsQuery.gte('datetime', startDate.toISOString());
    }

    const { data: outingsData, error: outingsError } = await outingsQuery;

    if (outingsError) {
      console.error('❌ Erreur Supabase outings:', outingsError);
      throw outingsError;
    }

    // Requête table activities
    let activitiesQuery = supabase
      .from('activities')
      .select('pee, pee_incident, poop, poop_incident, datetime')
      .eq('dog_id', dogId);

    if (startDate) {
      activitiesQuery = activitiesQuery.gte('datetime', startDate.toISOString());
    }

    const { data: activitiesData, error: activitiesError } = await activitiesQuery;

    if (activitiesError) {
      console.error('❌ Erreur Supabase activities:', activitiesError);
      throw activitiesError;
    }

    const outingsEvents = outingsData || [];
    const activitiesEvents = activitiesData || [];
    console.log('📊 Outings récupérés:', outingsEvents.length, 'Activities récupérées:', activitiesEvents.length);
    
    let outside = 0;
    let inside = 0;
    
    // Compter pipi et caca depuis outings
    outingsEvents.forEach(event => {
      // Compte pipi
      if (event.pee) {
        if (event.pee_location === 'outside') {
          outside++;
        } else if (event.pee_location === 'inside') {
          inside++;
        }
      }
      
      // Compte caca
      if (event.poop) {
        if (event.poop_location === 'outside') {
          outside++;
        } else if (event.poop_location === 'inside') {
          inside++;
        }
      }
    });

    // Compter pipi et caca depuis activities (succès = sans incident, incidents = avec incident)
    activitiesEvents.forEach(event => {
      // Compte pipi réussi (pee=true et pee_incident=false)
      if (event.pee && !event.pee_incident) {
        outside++; // Activities = succès = dehors par défaut
      } else if (event.pee && event.pee_incident) {
        inside++; // Activities = incident = dedans
      }
      
      // Compte caca réussi (poop=true et poop_incident=false)
      if (event.poop && !event.poop_incident) {
        outside++; // Activities = succès = dehors par défaut
      } else if (event.poop && event.poop_incident) {
        inside++; // Activities = incident = dedans
      }
    });
    
    const total = outside + inside;
    const percentage = total === 0 ? 0 : Math.round((outside / total) * 100);

    console.log('✅ Résultats combinés:', { outside, inside, total, percentage });
    return { outside, inside, total, percentage };
  } catch (error) {
    console.error('❌ Erreur getPeeStats:', error);
    return { outside: 0, inside: 0, total: 0, percentage: 0 };
  }
};

/**
 * Récupère le nombre total d'enregistrements (toujours ALL TIME)
 * Combine les données des tables outings et activities
 */
export const getTotalOutings = async (dogId) => {
  try {
    // Compter outings
    const { count: outingsCount, error: outingsError } = await supabase
      .from('outings')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);

    if (outingsError) throw outingsError;

    // Compter activities
    const { count: activitiesCount, error: activitiesError } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);

    if (activitiesError) throw activitiesError;

    const total = (outingsCount || 0) + (activitiesCount || 0);
    console.log('📊 Total Outings:', outingsCount, 'Activities:', activitiesCount, 'Total:', total);
    return total;
  } catch (error) {
    console.error('Erreur getTotalOutings:', error);
    return 0;
  }
};