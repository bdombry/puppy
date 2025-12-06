// src/services/timerService.js
import { supabase } from '../../config/supabase';

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
 * Formate le temps écoulé depuis un datetime
 */
export const formatTimeSince = (datetime) => {
  if (!datetime) return null;

  const now = new Date();
  
  // Parser la chaîne locale correctement: "2025-12-05T01:54:00"
  const [datePart, timePart] = datetime.split('T');
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