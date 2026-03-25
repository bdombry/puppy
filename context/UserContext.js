/**
 * UserContext
 * 
 * Source unique de vérité pour le statut premium de l'utilisateur.
 * - Initialise RevenueCat avec le Supabase user ID
 * - Écoute les changements de customerInfo en temps réel
 * - Synchronise le statut premium dans Supabase (analytics)
 * - Fournit useUser() pour accéder au statut premium partout
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, Platform } from 'react-native';
import { useAuth } from './AuthContext';
import {
  initializeRevenueCat,
  loginRevenueCat,
  logoutRevenueCat,
  checkPremiumStatus,
  syncPremiumToSupabase,
  addCustomerInfoListener,
  showCustomerCenter,
  restorePurchases,
  getOfferings,
  ENTITLEMENTS,
} from '../services/revenueCatService';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user } = useAuth();


  // ── Premium state ──
  const [isPremium, setIsPremium] = useState(false);
  const [hasMadeTransaction, setHasMadeTransaction] = useState(false);
  // Sur le web, premiumLoading est toujours false pour ne jamais bloquer l'app
  const [premiumLoading, setPremiumLoading] = useState(Platform.OS === 'web' ? false : true);
  const [expiresAt, setExpiresAt] = useState(null);
  const [offerings, setOfferings] = useState(null);
  const [revenueCatReady, setRevenueCatReady] = useState(false);
  const [paywallShownThisSession, setPaywallShownThisSession] = useState(false);

  // Track si on a déjà initialisé pour cet userId
  const initializedForUser = useRef(null);
  const listenerRef = useRef(null);

  // ✅ Synchronous premiumLoading reset quand user?.id change
  // Pattern React recommandé : setState pendant render pour état dérivé
  // Empêche un render avec premiumLoading=false périmé (de l'init anonyme)
  const [prevUserId, setPrevUserId] = useState(undefined);
  if (user?.id !== prevUserId) {
    setPrevUserId(user?.id);
    if (user?.id && !premiumLoading) {
      setPremiumLoading(true);
    }
  }

  // ── Refresh premium status ──
  const refreshPremiumStatus = useCallback(async () => {
    try {
      const status = await checkPremiumStatus();
      setIsPremium(status.isPremium);
      setHasMadeTransaction(status.hasMadeTransaction);
      setExpiresAt(status.expiresAt);

      // Sync vers Supabase si un user est connecté
      if (user?.id) {
        syncPremiumToSupabase(user.id, status).catch(() => {});
      }

      return status.isPremium;
    } catch (error) {
      console.error('❌ refreshPremiumStatus error:', error.message);
      return false;
    }
  }, [user?.id]);

  // ── Init RevenueCat quand le user change ──
  // Délai de 2s pour laisser l'app se charger avant de toucher au SDK natif
  useEffect(() => {
    let isMounted = true;
    let delayTimer = null;

    const init = async () => {
      const userId = user?.id || null;

      // Ne ré-initialise que si le userId a changé
      if (initializedForUser.current === userId && revenueCatReady) {
        return;
      }

      setPremiumLoading(true);

      try {
        // 1. Configure/logIn RevenueCat
        try {
          if (userId) {
            if (!revenueCatReady) {
              await initializeRevenueCat(userId);
            } else {
              await loginRevenueCat(userId);
            }
          } else {
            if (!revenueCatReady) {
              await initializeRevenueCat(null);
            } else {
              await logoutRevenueCat();
            }
          }
        } catch (rcError) {
          console.error('❌ RevenueCat configure/login error:', rcError);
          // Ne pas bloquer l'app si RevenueCat plante
          if (isMounted) {
            setRevenueCatReady(true);
            initializedForUser.current = userId;
            setPremiumLoading(false);
          }
          return;
        }

        if (!isMounted) return;

        setRevenueCatReady(true);
        initializedForUser.current = userId;

        // 2. Check premium
        let status = { isPremium: false, expiresAt: null };
        try {
          status = await checkPremiumStatus();
        } catch (premErr) {
          console.error('❌ checkPremiumStatus error:', premErr);
        }
        if (!isMounted) return;

        setIsPremium(status.isPremium);
        setExpiresAt(status.expiresAt);

        // 3. Sync to Supabase
        if (userId) {
          syncPremiumToSupabase(userId, status).catch(() => {});
        }

        // 4. Fetch offerings
        try {
          const currentOffering = await getOfferings();
          if (!isMounted) return;
          setOfferings(currentOffering);
        } catch (offErr) {
          console.error('❌ getOfferings error:', offErr);
        }
      } catch (error) {
        console.error('❌ UserContext init error:', error.message);
        if (isMounted) {
          setRevenueCatReady(true); // Don't block the app
        }
      } finally {
        if (isMounted) {
          setPremiumLoading(false);
        }
      }
    };

    // Délai pour éviter crash natif pendant le montage initial
    delayTimer = setTimeout(() => {
      init();
    }, 1500);

    return () => {
      isMounted = false;
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [user?.id]);

  // ── Listener temps réel pour changements (ex: annulation via Customer Center) ──
  useEffect(() => {
    if (!revenueCatReady) return;

    // Nettoyer l'ancien listener
    if (listenerRef.current?.remove) {
      listenerRef.current.remove();
    }

    listenerRef.current = addCustomerInfoListener(async (customerInfo) => {
      try {
        console.log('📡 CustomerInfo update received');
        const entitlement = customerInfo?.entitlements?.active?.[ENTITLEMENTS.PRO];
        const newIsPremium = entitlement != null;
        const newExpiresAt = entitlement?.expirationDate
          ? new Date(entitlement.expirationDate)
          : null;

      setIsPremium(newIsPremium);
      setExpiresAt(newExpiresAt);

        // Sync Supabase
        if (user?.id) {
          syncPremiumToSupabase(user.id, {
            isPremium: newIsPremium,
            expiresAt: newExpiresAt,
          }).catch(() => {});
        }
      } catch (listenerErr) {
        console.error('❌ CustomerInfo listener error:', listenerErr);
      }
    });

    return () => {
      if (listenerRef.current?.remove) {
        listenerRef.current.remove();
      }
    };
  }, [revenueCatReady, user?.id]);

  // ── Re-check quand l'app revient au foreground ──
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && revenueCatReady) {
        await refreshPremiumStatus();
      }
    });

    return () => subscription.remove();
  }, [revenueCatReady, refreshPremiumStatus]);

  // ── Gérer l'abonnement (Customer Center) ──
  const manageSubscription = useCallback(async () => {
    try {
      await showCustomerCenter();
      // Re-check après fermeture (l'utilisateur a pu annuler)
      await refreshPremiumStatus();
    } catch (error) {
      console.error('❌ manageSubscription error:', error.message);
    }
  }, [refreshPremiumStatus]);

  // ── Restore purchases ──
  const handleRestorePurchases = useCallback(async () => {
    try {
      setPremiumLoading(true);
      const { success } = await restorePurchases();
      await refreshPremiumStatus();
      return success;
    } catch (error) {
      console.error('❌ handleRestorePurchases error:', error.message);
      return false;
    } finally {
      setPremiumLoading(false);
    }
  }, [refreshPremiumStatus]);

  // ── Marquer le paywall comme montré cette session ──
  const markPaywallShown = useCallback(() => {
    setPaywallShownThisSession(true);
  }, []);

  // ── Reset le flag de session (utile après logout) ──
  useEffect(() => {
    if (!user) {
      setPaywallShownThisSession(false);
    }
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        // État premium
        isPremium,
        hasMadeTransaction,
        premiumLoading,
        expiresAt,
        revenueCatReady,
        offerings,

        // Session paywall (une seule fois par session)
        paywallShownThisSession,
        markPaywallShown,

        // Actions
        refreshPremiumStatus,
        manageSubscription,
        handleRestorePurchases,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook pour accéder au statut premium partout dans l'app.
 * 
 * Usage:
 *   const { isPremium, manageSubscription } = useUser();
 */
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
