// src/services/timerService.js
import { supabase } from '../../config/supabase';

/**
 * Normalise un datetime pour la comparaison
 * Convertit tout en UTC pour éviter les problèmes de timezone
 */
function normalizeDateTime(datetime) {
  if (!datetime) return null;
  
  try {
    // Si c'est déjà un objet Date, le convertir en ISO string UTC
    if (datetime instanceof Date) {
      return datetime.toISOString();
    }
    
    // Si c'est une string, s'assurer qu'elle est traitée comme UTC
    let dateString = datetime;
    
    // Si la string n'a pas de timezone, ajouter 'Z' pour la traiter comme UTC
    if (!dateString.includes('+') && !dateString.includes('Z')) {
      dateString += 'Z';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('❌ DateTime invalide:', datetime);
      return null;
    }
    
    return date.toISOString();
  } catch (error) {
    console.error('❌ Erreur normalisation datetime:', datetime, error);
    return null;
  }
}

/**
 * Récupère la dernière balade (activity uniquement)
 * Une balade = promenade enregistrée dans activities
 * IMPORTANT: Ignore les balades futures (datetime > maintenant)
 */
export const getLastOuting = async (dogId) => {
  try {
    // Créer maintenant en format local (pas UTC)
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('datetime')
      .eq('dog_id', dogId)
      .lt('datetime', nowLocal) // Uniquement les balades du passé
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
 * Récupère le dernier besoin (outings OU activities avec pipi/caca)
 * outings.datetime = UTC avec timezone
 * activities.datetime = LOCAL sans timezone
 */
export const getLastNeed = async (dogId) => {
  try {
    // 🔍 D'abord, compter combien d'entrées existent
    const { count: outingsCount } = await supabase
      .from('outings')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);
    
    const { count: activitiesCount } = await supabase
      .from('activities')
      .select('*', { count: 'exact', head: true })
      .eq('dog_id', dogId);
    
    console.log(`🔍 getLastNeed: ${outingsCount} outings, ${activitiesCount} activities pour dogId ${dogId}`);
    
    // 🔍 VOIR LES 3 DERNIÈRES OUTINGS (toutes)
    const { data: last3Outings } = await supabase
      .from('outings')
      .select('datetime, pee, poop')
      .eq('dog_id', dogId)
      .order('datetime', { ascending: false })
      .limit(3);
    
    console.log('📍 Dernières 3 outings:', last3Outings?.map(o => ({ 
      datetime: o.datetime, 
      pee: o.pee, 
      poop: o.poop 
    })));
    
    // Récupérer le dernier besoin dans outings (UTC avec timezone)
    const { data: outingData, error: outingError } = await supabase
      .from('outings')
      .select('datetime, pee, poop')
      .eq('dog_id', dogId)
      .or('pee.eq.true,poop.eq.true')
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    console.log('📍 getLastNeed outings (UTC):', { data: outingData, error: outingError?.message });

    // Récupérer la dernière activité avec pipi ou caca (LOCAL sans timezone)
    const { data: activityData, error: activityError } = await supabase
      .from('activities')
      .select('datetime, pee, poop')
      .eq('dog_id', dogId)
      .or('pee.eq.true,poop.eq.true')
      .order('datetime', { ascending: false })
      .limit(1)
      .single();

    console.log('📍 getLastNeed activities (LOCAL):', { data: activityData, error: activityError?.message });

    // Comparer les deux et retourner la plus récente
    let lastNeed = null;

    if (outingData && (!outingError || outingError.code === 'PGRST116')) {
      if (outingData.pee || outingData.poop) {
        lastNeed = {
          datetime: outingData.datetime,
          pee: outingData.pee,
          poop: outingData.poop,
          source: 'outings'  // LOCAL
        };
        console.log('✅ getLastNeed outing trouvé:', lastNeed);
      }
    }

    if (activityData && (!activityError || activityError.code === 'PGRST116')) {
      if (activityData.pee || activityData.poop) {
        const activity = {
          datetime: activityData.datetime,
          pee: activityData.pee,
          poop: activityData.poop,
          source: 'activities'  // LOCAL
        };

        // Comparer les deux si on a les deux
        if (!lastNeed) {
          lastNeed = activity;
          console.log('✅ getLastNeed activity trouvée (pas d\'outing):', lastNeed);
        } else {
          // Les deux existent, comparer par datetime
          // ✅ MAINTENANT LES DEUX SONT EN LOCAL!
          const outingDate = new Date(outingData.datetime);
          const activityDate = new Date(activityData.datetime);
          
          console.log('⏱️ getLastNeed Compare:', {
            outing: outingDate.toISOString(),
            activity: activityDate.toISOString()
          });
          
          if (activityDate > outingDate) {
            lastNeed = activity;
            console.log('🔄 getLastNeed: Activity plus récente que outing');
          } else {
            console.log('⏭️ getLastNeed: Outing plus récent que activity');
          }
        }
      }
    }

    console.log('📍 getLastNeed FINAL retourné:', lastNeed);
    return lastNeed;
  } catch (error) {
    console.error('❌ Erreur getLastNeed:', error);
    return null;
  }
};

/**
 * Récupère le dernier pipi (outings ET activities - prend le plus récent)
 */
export const getLastPee = async (dogId) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Récupérer en parallèle les données des deux tables
    const [outingResult, activityResult] = await Promise.all([
      // Chercher dans outings
      supabase
        .from('outings')
        .select('datetime, pee, pee_location')
        .eq('dog_id', dogId)
        .lt('datetime', nowLocal)
        .order('datetime', { ascending: false })
        .limit(10),
      // Chercher dans activities
      supabase
        .from('activities')
        .select('datetime, pee, pee_incident')
        .eq('dog_id', dogId)
        .lt('datetime', nowLocal)
        .order('datetime', { ascending: false })
        .limit(10)
    ]);

    if (outingResult.error) {
      console.error('❌ getLastPee - Erreur outings:', outingResult.error);
    }
    if (activityResult.error) {
      console.error('❌ getLastPee - Erreur activities:', activityResult.error);
    }

    // Filtrer les pee dans outings
    const peeOutings = outingResult.data?.filter(o => {
      const peeValue = o.pee;
      return peeValue === true || peeValue === 'true' || peeValue === 1 || peeValue === '1';
    }) || [];

    // Filtrer les pee dans activities
    const peeActivities = activityResult.data?.filter(a => {
      const peeValue = a.pee;
      return peeValue === true || peeValue === 'true' || peeValue === 1 || peeValue === '1';
    }) || [];

    console.log('📊 getLastPee - Outings avec pee filtrées:', peeOutings.length);
    console.log('📊 getLastPee - Activities avec pee filtrées:', peeActivities.length);

    // Trouver le plus récent entre les deux tables
    let lastPee = null;

    if (peeOutings.length > 0) {
      lastPee = {
        datetime: peeOutings[0].datetime,
        type: 'pee',
        location: peeOutings[0].pee_location,
        source: 'outings'
      };
    }

    if (peeActivities.length > 0) {
      const activityPee = {
        datetime: peeActivities[0].datetime,
        type: 'pee',
        incident: peeActivities[0].pee_incident,
        source: 'activities'
      };

      // Si on a les deux, comparer les dates (normalisées en UTC)
      if (lastPee) {
        const outingDateNormalized = normalizeDateTime(lastPee.datetime);
        const activityDateNormalized = normalizeDateTime(activityPee.datetime);
        
        if (activityDateNormalized > outingDateNormalized) {
          lastPee = activityPee;
        } else {
          // Si l'outing est plus récente, vérifier si l'écart est très petit (< 5 min)
          // Dans ce cas, prioriser l'activity car elle représente l'action la plus récente de l'utilisateur
          const timeDiff = new Date(outingDateNormalized) - new Date(activityDateNormalized);
          const fiveMinutes = 5 * 60 * 1000;
          
          if (timeDiff < fiveMinutes) {
            lastPee = activityPee;
          }
        }
      } else {
        lastPee = activityPee;
      }
    }

    console.log('✅ getLastPee - Dernier trouvé:', lastPee);
    return lastPee;
  } catch (error) {
    console.error('❌ Erreur getLastPee:', error);
    return null;
  }
};

/**
 * Récupère le dernier caca (outings ET activities - prend le plus récent)
 */
export const getLastPoop = async (dogId) => {
  try {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const nowLocal = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    // Récupérer en parallèle les données des deux tables
    const [outingResult, activityResult] = await Promise.all([
      // Chercher dans outings
      supabase
        .from('outings')
        .select('datetime, poop, poop_location')
        .eq('dog_id', dogId)
        .lt('datetime', nowLocal)
        .order('datetime', { ascending: false })
        .limit(10),
      // Chercher dans activities
      supabase
        .from('activities')
        .select('datetime, poop, poop_incident')
        .eq('dog_id', dogId)
        .lt('datetime', nowLocal)
        .order('datetime', { ascending: false })
        .limit(10)
    ]);

    if (outingResult.error) {
      console.error('❌ getLastPoop - Erreur outings:', outingResult.error);
    }
    if (activityResult.error) {
      console.error('❌ getLastPoop - Erreur activities:', activityResult.error);
    }

    // Filtrer les poop dans outings
    const poopOutings = outingResult.data?.filter(o => {
      const poopValue = o.poop;
      return poopValue === true || poopValue === 'true' || poopValue === 1 || poopValue === '1';
    }) || [];

    // Filtrer les poop dans activities
    const poopActivities = activityResult.data?.filter(a => {
      const poopValue = a.poop;
      return poopValue === true || poopValue === 'true' || poopValue === 1 || poopValue === '1';
    }) || [];

    console.log('📊 getLastPoop - Outings avec poop filtrées:', poopOutings.length);
    console.log('📊 getLastPoop - Activities avec poop filtrées:', poopActivities.length);

    // Trouver le plus récent entre les deux tables
    let lastPoop = null;

    if (poopOutings.length > 0) {
      lastPoop = {
        datetime: poopOutings[0].datetime,
        type: 'poop',
        location: poopOutings[0].poop_location,
        source: 'outings'
      };
    }

    if (poopActivities.length > 0) {
      const activityPoop = {
        datetime: poopActivities[0].datetime,
        type: 'poop',
        incident: poopActivities[0].poop_incident,
        source: 'activities'
      };

      // Si on a les deux, comparer les dates (normalisées en UTC)
      if (lastPoop) {
        const outingDateNormalized = normalizeDateTime(lastPoop.datetime);
        const activityDateNormalized = normalizeDateTime(activityPoop.datetime);
        
        if (activityDateNormalized > outingDateNormalized) {
          lastPoop = activityPoop;
        } else {
          // Si l'outing est plus récente, vérifier si l'écart est très petit (< 5 min)
          // Dans ce cas, prioriser l'activity car elle représente l'action la plus récente de l'utilisateur
          const timeDiff = new Date(outingDateNormalized) - new Date(activityDateNormalized);
          const fiveMinutes = 5 * 60 * 1000;
          
          if (timeDiff < fiveMinutes) {
            lastPoop = activityPoop;
          }
        }
      } else {
        lastPoop = activityPoop;
      }
    }

    console.log('✅ getLastPoop - Dernier trouvé:', lastPoop);
    return lastPoop;
  } catch (error) {
    console.error('❌ Erreur getLastPoop:', error);
    return null;
  }
};

/**
 * Formate le temps écoulé depuis un datetime
 */
export const formatTimeSince = (datetime) => {
  if (!datetime) return null;

  const now = new Date();
  
  // Parser la chaîne avec timezone: "2025-12-26T20:21:07+00:00"
  // Ou sans timezone: "2025-12-26T20:21:07"
  const [datePart, timePartWithTz] = datetime.split('T');
  
  if (!datePart || !timePartWithTz) {
    return null;
  }
  
  // Enlever le timezone s'il existe (+00:00 ou Z)
  const timePart = timePartWithTz.replace(/[+-]\d{2}:\d{2}$/, '').replace('Z', '');
  
  const [year, month, day] = datePart.split('-');
  const [hours, minutes, seconds] = timePart.split(':');
  
  // Créer une Date locale (pas UTC)
  const past = new Date(year, month - 1, day, hours, minutes, seconds);
  
  const diffMs = now - past;
  
  const secs = Math.floor(diffMs / 1000);
  const mins = Math.floor(secs / 60);
  const hrs = Math.floor(mins / 60);
  const dys = Math.floor(hrs / 24);

  if (dys > 0) {
    return `${dys}j ${hrs % 24}h`;
  } else if (hrs > 0) {
    return `${hrs}h ${mins % 60}m`;
  } else if (mins > 0) {
    return `${mins}m`;
  } else {
    return `${secs}s`;
  }
};