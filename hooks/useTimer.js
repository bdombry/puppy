/**
 * Hook pour gérer le timer de la dernière sortie
 * Met à jour le texte "il y a X temps" toutes les 10 secondes
 */

import { useEffect, useState } from 'react';
import { formatTimeSince } from '../components/services/timerService';
import { REFRESH_INTERVALS } from '../constants/config';

export function useTimer(lastOuting) {
  const [timeSince, setTimeSince] = useState(null);

  useEffect(() => {
    if (!lastOuting) {
      setTimeSince(null);
      return;
    }

    // Mettre à jour immédiatement
    setTimeSince(formatTimeSince(lastOuting.datetime));

    // Puis mettre à jour régulièrement
    const interval = setInterval(() => {
      setTimeSince(formatTimeSince(lastOuting.datetime));
    }, REFRESH_INTERVALS.timer);

    return () => clearInterval(interval);
  }, [lastOuting]);

  return timeSince;
}
