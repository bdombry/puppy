/**
 * Hook: useRevenueCat
 *
 * Wrapper de compatibilité autour de useUser() (UserContext).
 * Les écrans existants qui importent useRevenueCat continuent à fonctionner.
 *
 * Pour du nouveau code, utilise directement:
 *   import { useUser } from '../context/UserContext';
 */

import { useUser } from '../context/UserContext';
import {
  getCustomerInfo,
  getOfferings,
  checkPremiumStatus,
} from '../services/revenueCatService';

export const useRevenueCat = () => {
  const {
    isPremium,
    premiumLoading,
    expiresAt,
    offerings,
    refreshPremiumStatus,
    handleRestorePurchases,
    manageSubscription,
  } = useUser();

  return {
    // Backward-compatible API
    isPro: isPremium,
    isPremium,
    loading: premiumLoading,
    offerings,
    proExpiresAt: expiresAt,
    expiresAt,
    customerInfo: null, // Deprecated: use getCustomerInfo() directly
    error: null,

    // Actions
    checkProStatus: refreshPremiumStatus,
    refreshPremiumStatus,
    fetchOfferings: getOfferings,
    handleRestorePurchases,
    manageSubscription,
  };
};
