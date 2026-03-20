import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

/**
 * Hook pour savoir si l'utilisateur a déjà payé au moins une fois (via RevenueCat)
 * Renvoie true si latest_purchase_date est non null dans user_subscriptions
 */
export default function useHasEverPaid(userId) {
  const [hasEverPaid, setHasEverPaid] = useState(undefined); // undefined = loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setHasEverPaid(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    supabase
      .from('user_subscriptions')
      .select('latest_purchase_date')
      .eq('user_id', userId)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          setError(error);
          setHasEverPaid(false);
        } else if (data && data.latest_purchase_date) {
          setHasEverPaid(true);
        } else {
          setHasEverPaid(false);
        }
        setLoading(false);
      });
  }, [userId]);

  return { hasEverPaid, loading, error };
}
