/**
 * Hook: useRevenueCat
 * Gère l'état des abonnements et l'accès aux fonctionnalités premium
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCustomerInfo,
  hasEntitlement,
  getOfferings,
  ENTITLEMENTS,
  restorePurchases,
  getEntitlementExpiration,
} from '../services/revenueCatService';

export const useRevenueCat = () => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [proExpiresAt, setProExpiresAt] = useState(null);
  const [error, setError] = useState(null);

  // Vérifie le statut Pro de l'utilisateur
  const checkProStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupère les infos du client
      const info = await getCustomerInfo();
      setCustomerInfo(info);

      // Vérifie si l'utilisateur a l'entitlement Pro
      const hasProAccess = await hasEntitlement(ENTITLEMENTS.PRO);
      setIsPro(hasProAccess);

      // Récupère la date d'expiration si Pro
      if (hasProAccess) {
        const expiresAt = await getEntitlementExpiration(ENTITLEMENTS.PRO);
        setProExpiresAt(expiresAt);
      }

      return hasProAccess;
    } catch (err) {
      console.error('❌ Error checking pro status:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupère les offerings (produits d'abonnement)
  const fetchOfferings = useCallback(async () => {
    try {
      const currentOffering = await getOfferings();
      setOfferings(currentOffering);
      return currentOffering;
    } catch (err) {
      console.error('❌ Error fetching offerings:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Restaure les achats précédents
  const handleRestorePurchases = useCallback(async () => {
    try {
      setLoading(true);
      const isPro = await restorePurchases();
      setIsPro(isPro);
      return isPro;
    } catch (err) {
      console.error('❌ Error restoring purchases:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Au montage, vérifie le statut et les offerings
  useEffect(() => {
    const initRevenueCat = async () => {
      setLoading(true);
      try {
        // Vérifie le statut Pro
        await checkProStatus();

        // Récupère les offerings
        await fetchOfferings();
      } catch (err) {
        console.error('❌ Error initializing RevenueCat:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initRevenueCat();
  }, [checkProStatus, fetchOfferings]);

  return {
    isPro: isPro,
    loading,
    offerings,
    customerInfo,
    proExpiresAt,
    error,
    checkProStatus,
    fetchOfferings,
    handleRestorePurchases,
  };
};
