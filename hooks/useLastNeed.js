/**
 * Hook pour gérer le timer du dernier besoin (pipi/caca)
 * Retourne: "il y a 2h 15m 💧" ou null si pas de besoin
 * Met à jour synchronisé avec les autres timers
 */

import { useEffect, useState } from 'react';
import { getLastNeed } from '../components/services/timerService';
import { timerSyncService } from '../components/services/timerSyncService';
import { REFRESH_INTERVALS } from '../constants/config';

export function useLastNeed(dogId) {
  const [timeSince, setTimeSince] = useState(null);
  const [lastNeed, setLastNeed] = useState(null);

  // Charger le dernier besoin au démarrage ET régulièrement
  useEffect(() => {
    if (!dogId) {
      console.log('❌ useLastNeed: dogId non défini');
      setTimeSince(null);
      setLastNeed(null);
      return;
    }

    console.log('🔄 useLastNeed: Chargement pour dogId:', dogId);
    let isMounted = true;

    const loadLastNeed = async () => {
      try {
        const need = await getLastNeed(dogId);
        console.log('✅ useLastNeed - getLastNeed retourné:', need);
        if (isMounted && need) {
          console.log('📝 useLastNeed: Mise à jour avec:', need);
          setLastNeed(need);
        } else {
          console.log('⚠️ useLastNeed: Pas de need trouvé');
          setLastNeed(null);
        }
      } catch (err) {
        console.error('❌ Erreur useLastNeed - loadLastNeed:', err);
      }
    };

    // Charger immédiatement
    loadLastNeed();

    // Puis recharger toutes les 10 secondes pour avoir les données fraîches
    const reloadInterval = setInterval(() => {
      loadLastNeed();
    }, REFRESH_INTERVALS.timer);

    return () => {
      isMounted = false;
      clearInterval(reloadInterval);
    };
  }, [dogId]);

  // Mettre à jour l'affichage du temps
  useEffect(() => {
    console.log('⏱️ useLastNeed useEffect triggered, lastNeed:', lastNeed);
    
    if (!lastNeed || !lastNeed.datetime) {
      console.log('⏱️ useLastNeed: Pas de lastNeed ou datetime');
      setTimeSince(null);
      return;
    }

    try {
      console.log('🔧 useLastNeed: Source:', lastNeed.source);
      console.log('🔧 useLastNeed: DateTime:', lastNeed.datetime);
      
      // ✅ TOUT EST EN LOCAL (outings ET activities)
      // Parse LOCAL: "2025-12-05T22:29:00" (sans Z)
      const datetimeStr = lastNeed.datetime;
      const [datePart, timePart] = datetimeStr.split('T');
      const [year, month, day] = datePart.split('-');
      const [hourStr, minStr, secStr] = timePart.split(':');
      
      const pastDate = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hourStr),
        parseInt(minStr),
        parseInt(secStr)
      );
      console.log('📊 useLastNeed (LOCAL):', pastDate.toLocaleString());
      
      const updateDisplay = () => {
        console.log('🎬 useLastNeed updateDisplay appelé');
        const now = new Date();
        const diffMs = now.getTime() - pastDate.getTime();
        
        console.log('⏱️ Now:', now.toISOString(), 'Past:', pastDate.toISOString(), 'Diff:', diffMs, 'ms');
        
        const secs = Math.floor(Math.abs(diffMs) / 1000);
        const mins = Math.floor(secs / 60);
        const hrs = Math.floor(mins / 60);
        const dys = Math.floor(hrs / 24);

        let formatted;
        if (diffMs < 0) {
          formatted = `dans ${mins}m`;
        } else if (dys > 0) {
          formatted = `il y a ${dys}j ${hrs % 24}h`;
        } else if (hrs > 0) {
          formatted = `il y a ${hrs}h ${mins % 60}m`;
        } else if (mins > 0) {
          formatted = `il y a ${mins}m`;
        } else {
          formatted = `il y a ${secs}s`;
        }

        // Gérer les emojis: si les deux sont vrais, afficher les deux
        let emoji = '';
        if (lastNeed.pee && lastNeed.poop) {
          emoji = '💧💩';
        } else if (lastNeed.poop) {
          emoji = '💩';
        } else {
          emoji = '💧';
        }
        console.log('✨ useLastNeed Display:', `${formatted} ${emoji}`);
        setTimeSince(`${formatted} ${emoji}`);
      };

      console.log('🎬 useLastNeed: Calling updateDisplay immédiatement');
      updateDisplay();
      console.log('🎬 useLastNeed: Subscribing to timerSync');
      // S'abonner aux updates synchronisées
      const unsubscribe = timerSyncService.subscribe(updateDisplay);
      console.log('🎬 useLastNeed: Subscribed successfully');

      return unsubscribe;
    } catch (err) {
      console.error('❌ Erreur useLastNeed:', err);
      console.error('❌ Stack:', err.stack);
      setTimeSince(null);
    }
  }, [lastNeed]);

  return timeSince;
}
