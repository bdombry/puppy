// src/services/analyticsService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère toutes les stats avancées
 * Combine les données des tables outings et activities
 */
export const getAdvancedStats = async (dogId) => {
  try {
    console.log('📊 getAdvancedStats appelé avec dogId:', dogId);
    
    // Récupérer les outings
    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .select('*')
      .eq('dog_id', dogId);

    if (outingsError) throw outingsError;
    const outings = outingsData || [];
    console.log('📋 Outings récupérés:', outings.length);

    // Récupérer les activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('id, dog_id, pee, pee_incident, poop, poop_incident, datetime, treat')
      .eq('dog_id', dogId);

    let activities = [];
    if (activitiesError) {
      console.error('⚠️ Erreur Supabase activities:', activitiesError);
      // Retry sans treat si erreur
      const { data: activitiesDataRetry, error: activitiesErrorRetry } = await supabase
        .from('activities')
        .select('id, dog_id, pee, pee_incident, poop, poop_incident, datetime')
        .eq('dog_id', dogId);
      
      if (activitiesErrorRetry) {
        console.error('❌ Erreur Supabase activities retry:', activitiesErrorRetry);
        // Ne pas throw, continuer sans activities
      } else {
        activities = activitiesDataRetry || [];
        console.log('🚶 Activities récupérées (sans treat):', activities.length);
      }
    } else {
      activities = activitiesData || [];
      console.log('🚶 Activities récupérées:', activities.length);
    }

    // ===== STATS PIPI VS CACA =====
    const peeCount = outings.filter(o => o.pee).length + 
                     activities.filter(a => a.pee).length;
    const poopCount = outings.filter(o => o.poop).length + 
                      activities.filter(a => a.poop).length;

    // ===== STATS FRIANDISES (outings + activities) =====
    const treatGiven = outings.filter(o => o.treat).length + activities.filter(a => a.treat).length;
    console.log('🍬 Treats:', treatGiven);
    
    // ===== STATS PAR TYPE (PIPI/CACA) INSIDE VS OUTSIDE =====
    // Outings
    const peeOutside = outings.filter(o => o.pee && o.pee_location === 'outside').length;
    const peeInside = outings.filter(o => o.pee && o.pee_location === 'inside').length;
    const poopOutside = outings.filter(o => o.poop && o.poop_location === 'outside').length;
    const poopInside = outings.filter(o => o.poop && o.poop_location === 'inside').length;

    // Activities (succès = sans incident, incidents = avec incident)
    const activitiesPeeOutside = activities.filter(a => a.pee && !a.pee_incident).length;
    const activitiesPeeInside = activities.filter(a => a.pee && a.pee_incident).length; // Incidents
    const activitiesPoopOutside = activities.filter(a => a.poop && !a.poop_incident).length;
    const activitiesPoopInside = activities.filter(a => a.poop && a.poop_incident).length; // Incidents

    // Total combiné
    const totalPeeOutside = peeOutside + activitiesPeeOutside;
    const totalPeeInside = peeInside + activitiesPeeInside; // Ajouter les incidents des activities
    const totalPoopOutside = poopOutside + activitiesPoopOutside;
    const totalPoopInside = poopInside + activitiesPoopInside; // Ajouter les incidents des activities

    // Taux de réussite
    const peeSuccessRate = peeCount > 0 
      ? Math.round((totalPeeOutside / peeCount) * 100)
      : 0;
    const poopSuccessRate = poopCount > 0 
      ? Math.round((totalPoopOutside / poopCount) * 100)
      : 0;

    // ===== STATS FRIANDISES PAR SORTIE RÉUSSIE =====
    const successfulOutings = outings.filter(o => 
      o.pee_location === 'outside' || o.poop_location === 'outside'
    ).length;
    const successfulActivities = activities.filter(a => 
      (a.pee && !a.pee_incident) || (a.poop && !a.poop_incident)
    ).length;
    const totalOutside = successfulOutings + successfulActivities;
    const treatPercentage = totalOutside > 0 
      ? Math.round((treatGiven / totalOutside) * 100)
      : 0;

    // ===== HEURE LA PLUS FRÉQUENTE POUR LES INCIDENTS =====
    const incidentHours = [
      ...outings
        .filter(o => o.pee_location === 'inside' || o.poop_location === 'inside')
        .map(o => new Date(o.datetime).getHours()),
      ...activities
        .filter(a => a.pee_incident || a.poop_incident)
        .map(a => new Date(a.datetime).getHours()),
    ];

    const hourCounts = {};
    incidentHours.forEach(h => {
      hourCounts[h] = (hourCounts[h] || 0) + 1;
    });

    const mostFrequentIncidentHour = Object.keys(hourCounts).length > 0
      ? Object.keys(hourCounts).reduce((a, b) => hourCounts[a] > hourCounts[b] ? a : b)
      : null;

    // ===== MEILLEURE JOURNÉE (PLUS HAUTE % DE RÉUSSITE) =====
    const dayStats = {};
    
    // Traiter les outings
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

    // Traiter les activities (succès ET incidents)
    activities.forEach(a => {
      const date = new Date(a.datetime).toISOString().split('T')[0];
      if (!dayStats[date]) {
        dayStats[date] = { outside: 0, inside: 0 };
      }
      // Compter les succès
      const hasSuccess = (a.pee && !a.pee_incident) || (a.poop && !a.poop_incident);
      // Compter les incidents
      const hasIncident = (a.pee && a.pee_incident) || (a.poop && a.poop_incident);
      
      if (hasSuccess) dayStats[date].outside++;
      if (hasIncident) dayStats[date].inside++;
    });

    let bestDay = null;
    let bestDayPercentage = 0;
    let worstDay = null;
    let worstDayPercentage = 100;
    
    Object.entries(dayStats).forEach(([date, stats]) => {
      const total = stats.outside + stats.inside;
      if (total > 0) {
        const percentage = Math.round((stats.outside / total) * 100);
        if (percentage > bestDayPercentage) {
          bestDayPercentage = percentage;
          bestDay = date;
        }
        if (percentage < worstDayPercentage) {
          worstDayPercentage = percentage;
          worstDay = date;
        }
      }
    });

    // ===== RATIO PIPI/CACA =====
    const peeVsPoopRatio = poopCount > 0 ? Math.round((peeCount / poopCount) * 10) / 10 : 0;

    // ===== HEURE MEILLEURE (PLUS DE RÉUSSITES) =====
    const successHours = [
      ...outings
        .filter(o => o.pee_location === 'outside' || o.poop_location === 'outside')
        .map(o => new Date(o.datetime).getHours()),
      ...activities.map(a => new Date(a.datetime).getHours()),
    ];

    const successHourCounts = {};
    successHours.forEach(h => {
      successHourCounts[h] = (successHourCounts[h] || 0) + 1;
    });

    const mostFrequentSuccessHour = Object.keys(successHourCounts).length > 0
      ? Object.keys(successHourCounts).reduce((a, b) => successHourCounts[a] > successHourCounts[b] ? a : b)
      : null;

    // ===== TENDANCE 7 JOURS =====
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentOutings = outings.filter(o => new Date(o.datetime) >= sevenDaysAgo);
    const recentActivities = activities.filter(a => new Date(a.datetime) >= sevenDaysAgo);
    
    const recentSuccess = recentOutings.filter(o => 
      o.pee_location === 'outside' || o.poop_location === 'outside'
    ).length + recentActivities.length;
    const recentTotal = recentOutings.length + recentActivities.length;
    const recentSuccessRate = recentTotal > 0 ? Math.round((recentSuccess / recentTotal) * 100) : 0;
    
    const overallSuccessRate = (totalPeeOutside + totalPoopOutside) / (peeCount + poopCount) * 100 || 0;
    let trend = null;
    if (recentSuccessRate > overallSuccessRate + 10) {
      trend = 'improving';
    } else if (recentSuccessRate < overallSuccessRate - 10) {
      trend = 'declining';
    } else {
      trend = 'stable';
    }

    // ===== STREAKS =====
    // Calcul du streak maximum (jours consécutifs sans incident)
    const allDates = [
      ...outings.map(o => new Date(o.datetime).toISOString().split('T')[0]),
      ...activities.map(a => new Date(a.datetime).toISOString().split('T')[0]),
    ];
    const uniqueDates = [...new Set(allDates)].sort();
    
    const streakInfo = {};
    uniqueDates.forEach(date => {
      const dayOutings = outings.filter(o => new Date(o.datetime).toISOString().split('T')[0] === date);
      const dayActivities = activities.filter(a => new Date(a.datetime).toISOString().split('T')[0] === date);
      
      const hasIncident = dayOutings.some(o => o.pee_location === 'inside' || o.poop_location === 'inside');
      streakInfo[date] = !hasIncident; // true = pas d'incident
    });

    let maxStreak = 0;
    let currentStreak = 0;
    Object.values(streakInfo).forEach(noIncident => {
      if (noIncident) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    // ===== TEMPS MOYEN ENTRE SORTIES =====
    const allEventDates = [
      ...outings.map(o => new Date(o.datetime).getTime()),
      ...activities.map(a => new Date(a.datetime).getTime()),
    ].sort((a, b) => a - b);

    let totalTimeDiff = 0;
    let timeDiffCount = 0;
    for (let i = 1; i < allEventDates.length; i++) {
      const diff = allEventDates[i] - allEventDates[i - 1];
      totalTimeDiff += diff;
      timeDiffCount++;
    }

    const avgTimeBetweenOutingsMs = timeDiffCount > 0 ? totalTimeDiff / timeDiffCount : 0;
    const avgTimeBetweenOutings = Math.round((avgTimeBetweenOutingsMs / (1000 * 60 * 60)) * 10) / 10;

    return {
      total: outings.length + activities.length,
      peeCount,
      poopCount,
      treatGiven,
      treatPercentage,
      peeSuccessRate,
      poopSuccessRate,
      peeOutside: totalPeeOutside,
      peeInside: totalPeeInside,
      poopOutside: totalPoopOutside,
      poopInside: totalPoopInside,
      mostFrequentIncidentHour,
      mostFrequentSuccessHour,
      bestDay,
      bestDayPercentage,
      worstDay,
      worstDayPercentage,
      maxStreak,
      peeVsPoopRatio,
      trend,
      avgTimeBetweenOutings,
    };
  } catch (error) {
    console.error('❌ Erreur getAdvancedStats:', error);
    
    // Si erreur de colonne manquante (treat), retry sans treat
    if (error?.message?.includes('treat') || error?.code === '42703') {
      console.log('⚠️ Colonne treat manquante, tentative sans...');
      try {
        const { data: outingsData } = await supabase
          .from('outings')
          .select('id, dog_id, pee, pee_location, poop, poop_location, datetime, is_incident')
          .eq('dog_id', dogId);
        
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('id, dog_id, pee, pee_incident, poop, poop_incident, datetime')
          .eq('dog_id', dogId);
        
        // Retourner des stats minimales
        const outings = outingsData || [];
        const activities = activitiesData || [];
        
        console.log('📊 Stats minimales retournées');
        return {
          total: outings.length + activities.length,
          peeCount: outings.filter(o => o.pee).length + activities.filter(a => a.pee).length,
          poopCount: outings.filter(o => o.poop).length + activities.filter(a => a.poop).length,
          treatGiven: 0,
          treatPercentage: 0,
          peeSuccessRate: 0,
          poopSuccessRate: 0,
          peeOutside: 0,
          peeInside: 0,
          poopOutside: 0,
          poopInside: 0,
          mostFrequentIncidentHour: null,
          mostFrequentSuccessHour: null,
          bestDay: null,
          bestDayPercentage: 0,
          worstDay: null,
          worstDayPercentage: 0,
          maxStreak: 0,
          peeVsPoopRatio: 0,
          trend: null,
          avgTimeBetweenOutings: 0,
        };
      } catch (retryError) {
        console.error('❌ Erreur retry:', retryError);
      }
    }
    
    return null;
  }
};

/**
 * Récupère le % de demandes de sortie du chien - DONNÉES SÉPARÉES
 * Activities = vraies balades (communication du chien pour demander sortir)
 * Outings réussites = pipi/caca dehors (incident_reason = null)
 * @param {string} dogId - ID du chien
 * @returns {object} { activitiesAsked, totalActivities, successWithDemand }
 */
export const getDogCommunicationStats = async (dogId) => {
  try {
    console.log('🗣️ getDogCommunicationStats appelé avec dogId:', dogId);

    // Récupérer les ACTIVITIES (vraies balades dehors = réussites)
    // C'est là qu'on enregistre si le chien a demandé
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('dog_asked_for_walk')
      .eq('dog_id', dogId);

    if (activitiesError) {
      console.warn('⚠️ Erreur Supabase activities (getDogCommunicationStats):', activitiesError);
    }

    const activities = activitiesData || [];
    const activitiesAsked = activities.filter(a => a.dog_asked_for_walk).length;
    const totalActivities = activities.length;

    // Récupérer TOUS les OUTINGS (pour compter totalSuccesses)
    // Mais seulement les REUSSITES (incident_reason IS NULL)
    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .select('dog_asked_for_walk, incident_reason')
      .eq('dog_id', dogId)
      .is('incident_reason', null); // Seulement les réussites

    if (outingsError) {
      console.warn('⚠️ Erreur Supabase outings (getDogCommunicationStats):', outingsError);
    }

    const outings = outingsData || [];
    const outingsAsked = outings.filter(o => o.dog_asked_for_walk).length;
    const totalSuccesses = outings.length;

    // Calculer le % de demandes parmi les réussites
    const successWithDemand = totalSuccesses > 0 ? Math.round((outingsAsked / totalSuccesses) * 100) : 0;

    console.log('🗣️ Stats communication outings:', { 
      outingsAsked,
      totalSuccesses,
      successWithDemand,
      outings: outings.slice(0, 3) // Log les 3 premiers pour debug
    });

    return {
      activitiesAsked,
      totalActivities,
      successWithDemand,
      outingsAsked,
      totalSuccesses,
    };
  } catch (err) {
    console.error('❌ Erreur getDogCommunicationStats:', err);
    return {
      activitiesAsked: 0,
      totalActivities: 0,
      successWithDemand: 0,
      outingsAsked: 0,
      totalSuccesses: 0,
    };
  }
};

/**
 * Récupère le % de demandes de sortie du chien
 * Activities = vraies balades (communication du chien)
 * Outings incidents = besoins urgents
 * @param {string} dogId - ID du chien
 * @returns {object} { totalWalks, askedToGoOut }
 */
export const getAskToGoOutStats = async (dogId) => {
  try {
    console.log('🚪 getAskToGoOutStats appelé avec dogId:', dogId);

    // Récupérer les outings
    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .select('dog_asked_for_walk')
      .eq('dog_id', dogId);

    if (outingsError) throw outingsError;

    const outings = outingsData || [];
    const outingsAsked = outings.filter(o => o.dog_asked_for_walk).length;

    // Récupérer les activities
    const { data: activitiesData, error: activitiesError } = await supabase
      .from('activities')
      .select('dog_asked_for_walk')
      .eq('dog_id', dogId);

    if (activitiesError) {
      console.warn('⚠️ Erreur Supabase activities (getAskToGoOutStats):', activitiesError);
      // Continue with outings data only
    }

    const activities = activitiesData || [];
    const activitiesAsked = activities.filter(a => a.dog_asked_for_walk).length;

    const totalWalks = outings.length + activities.length;
    const totalAsked = outingsAsked + activitiesAsked;

    console.log('🚪 Stats demande sortie:', { totalWalks, totalAsked });

    return {
      totalWalks,
      askedToGoOut: totalAsked,
    };
  } catch (err) {
    console.error('❌ Erreur getAskToGoOutStats:', err);
    return {
      totalWalks: 0,
      askedToGoOut: 0,
    };
  }
};

/**
 * Récupère le breakdown des raisons d'incident
 * @param {string} dogId - ID du chien
 * @returns {object} { pas_le_temps: X, trop_tard: X, ... }
 */
export const getIncidentReasons = async (dogId) => {
  try {
    console.log('⚠️ getIncidentReasons appelé avec dogId:', dogId);

    // Récupérer les outings avec incident_reason
    const { data: outingsData, error: outingsError } = await supabase
      .from('outings')
      .select('incident_reason')
      .eq('dog_id', dogId)
      .not('incident_reason', 'is', null);

    if (outingsError) throw outingsError;

    const outings = outingsData || [];
    console.log('📋 Outings avec incident_reason:', outings.length);

    // Compter par raison
    const reasonCounts = {
      pas_le_temps: 0,
      trop_tard: 0,
      flemme: 0,
      oublie: 0,
      autre: 0,
    };

    outings.forEach(outing => {
      if (outing.incident_reason && reasonCounts.hasOwnProperty(outing.incident_reason)) {
        reasonCounts[outing.incident_reason]++;
      }
    });

    console.log('⚠️ Raisons d\'incident:', reasonCounts);

    return reasonCounts;
  } catch (err) {
    console.error('❌ Erreur getIncidentReasons:', err);
    return {
      pas_le_temps: 0,
      trop_tard: 0,
      flemme: 0,
      oublie: 0,
      autre: 0,
    };
  }
};
