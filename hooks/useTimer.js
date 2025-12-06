/**
 * Hook pour gérer le timer de la dernière sortie
 * Met à jour synchronisé avec les autres timers
 */

import { useEffect, useState } from 'react';
import { formatTimeSince } from '../components/services/timerService';
import { timerSyncService } from '../components/services/timerSyncService';

export function useTimer(lastOuting) {
  const [timeSince, setTimeSince] = useState(null);

  useEffect(() => {
    if (!lastOuting || !lastOuting.datetime) {
      setTimeSince(null);
      return;
    }

    try {
      // Mettre à jour immédiatement
      const formatted = formatTimeSince(lastOuting.datetime);
      setTimeSince(formatted);

      // S'abonner aux updates synchronisées
      const unsubscribe = timerSyncService.subscribe(() => {
        try {
          const formatted = formatTimeSince(lastOuting.datetime);
          setTimeSince(formatted);
        } catch (err) {
          console.error('Erreur formatage timer:', err);
        }
      });

      return unsubscribe;
    } catch (err) {
      console.error('Erreur useTimer:', err);
      setTimeSince(null);
    }
  }, [lastOuting]);

  return timeSince;
}
