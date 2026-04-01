/**
 * RevenueCat Service
 * Gère les abonnements, entitlements, et customer info.
 * Configure RevenueCat avec le Supabase user ID comme appUserID.
 */

import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import ENV from '../config/env';
import { supabase } from '../config/supabase';

const REVENUE_CAT_API_KEY = ENV.REVENUE_CAT_API_KEY;

// Entitlements disponibles
export const ENTITLEMENTS = {
  PRO: 'PupyTracker Pro',
};

// Re-export pour usage externe
export { PAYWALL_RESULT };

// ─────────────────────────────────────────────────
// 1. Initialisation avec appUserID Supabase
// ─────────────────────────────────────────────────

/**
 * Initialise RevenueCat avec le Supabase user ID.
 * @param {string|null} userId - Supabase user.id (UUID)
 */
export const initializeRevenueCat = async (userId = null) => {
  try {
    console.log('💳 Initializing RevenueCat...');

    // Réduit fortement le bruit des logs SDK (notamment dumps transactions/JWS).
    if (typeof Purchases.setLogLevel === 'function' && Purchases.LOG_LEVEL?.WARN) {
      Purchases.setLogLevel(Purchases.LOG_LEVEL.WARN);
    }

    if (userId) {
      await Purchases.configure({
        apiKey: REVENUE_CAT_API_KEY,
        appUserID: userId,
      });
      console.log('✅ RevenueCat configured with appUserID:', userId);
    } else {
      await Purchases.configure({
        apiKey: REVENUE_CAT_API_KEY,
      });
      console.log('✅ RevenueCat configured (anonymous)');
    }

    return true;
  } catch (error) {
    console.error('❌ Error initializing RevenueCat:', error.message);
    return false;
  }
};

/**
 * Identifie (login) un utilisateur après connexion Supabase.
 * Fusionne l'historique anonyme si existant.
 * @param {string} userId - Supabase user.id
 */
export const loginRevenueCat = async (userId) => {
  try {
    console.log('🔑 RevenueCat logIn:', userId);
    const { customerInfo } = await Purchases.logIn(userId);
    console.log('✅ RevenueCat logIn success');
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat logIn error:', error.message);
    return null;
  }
};

/**
 * Déconnecte l'utilisateur de RevenueCat (retour anonyme).
 */
export const logoutRevenueCat = async () => {
  try {
    console.log('🚪 RevenueCat logOut');
    const customerInfo = await Purchases.logOut();
    console.log('✅ RevenueCat logOut success');
    return customerInfo;
  } catch (error) {
    console.error('❌ RevenueCat logOut error:', error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────
// 2. Customer info & premium check
// ─────────────────────────────────────────────────

/**
 * Récupère les infos customer RevenueCat.
 */
export const getCustomerInfo = async () => {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('❌ Error fetching customer info:', error.message);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur est premium.
 * @returns {{ isPremium: boolean, expiresAt: Date|null, entitlement: Object|null }}
 */
export const checkPremiumStatus = async () => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();

    if (!customerInfo) {
      return { isPremium: false, expiresAt: null, entitlement: null };
    }

    const entitlement = customerInfo.entitlements.active[ENTITLEMENTS.PRO];
    const isPremium = entitlement != null;
    const expiresAt = entitlement?.expirationDate
      ? new Date(entitlement.expirationDate)
      : null;

    console.log(
      `🔑 Premium: ${isPremium ? '✅' : '❌'}`,
      expiresAt ? `expires ${expiresAt.toISOString()}` : ''
    );

    return { isPremium, expiresAt, entitlement };
  } catch (error) {
    console.error('❌ Error checking premium:', error.message);
    return { isPremium: false, expiresAt: null, entitlement: null };
  }
};

// ─────────────────────────────────────────────────
// 3. Offerings
// ─────────────────────────────────────────────────

/**
 * @returns {Promise<Object|null>} current offering
 */
export const getOfferings = async () => {
  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current != null) {
      return offerings.current;
    }
    console.warn('⚠️ No current offering available');
    return null;
  } catch (error) {
    console.error('❌ Error fetching offerings:', error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────
// 4. Purchase & Restore
// ─────────────────────────────────────────────────

/**
 * Achète un package.
 * @param {Object} selectedPackage
 * @returns {{ success: boolean, customerInfo: Object|null }}
 */
export const purchasePackage = async (selectedPackage) => {
  try {
    console.log('🛒 Purchasing:', selectedPackage.identifier);
    const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
    const isPremium =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO] != null;

    return { success: isPremium, customerInfo };
  } catch (error) {
    if (error.userCancelled) {
      console.log('👤 Purchase cancelled');
      return { success: false, customerInfo: null };
    }
    console.error('❌ Purchase error:', error.message);
    return { success: false, customerInfo: null };
  }
};

/**
 * Restaure les achats.
 * @returns {{ success: boolean, customerInfo: Object|null }}
 */
export const restorePurchases = async () => {
  try {
    console.log('🔄 Restoring purchases...');
    const customerInfo = await Purchases.restorePurchases();
    const isPremium =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO] != null;
    console.log('✅ Restore done. Premium:', isPremium);
    return { success: isPremium, customerInfo };
  } catch (error) {
    console.error('❌ Restore error:', error.message);
    return { success: false, customerInfo: null };
  }
};

// ─────────────────────────────────────────────────
// 5. Customer Center (manage subscription)
// ─────────────────────────────────────────────────

/**
 * Ouvre le Customer Center de RevenueCat.
 * Après fermeture, re-fetch le statut (l'utilisateur a pu annuler).
 */
export const showCustomerCenter = async () => {
  try {
    console.log('🎫 Opening Customer Center...');
    if (typeof RevenueCatUI.presentCustomerCenter !== 'function') {
      throw new Error('presentCustomerCenter is not available on RevenueCatUI. Check package version.');
    }
    await RevenueCatUI.presentCustomerCenter();
    // Re-fetch après fermeture
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('✅ Customer Center closed');
    return customerInfo;
  } catch (error) {
    console.error('❌ Customer Center error:', error.message);
    return null;
  }
};

// ─────────────────────────────────────────────────
// 6. RevenueCatUI Paywall
// ─────────────────────────────────────────────────

/**
 * Présente le paywall RevenueCatUI.
 * @param {Object} options - { offering, listeners }
 * @returns {{ success: boolean, result: string, customerInfo: Object|null }}
 */
export const presentPaywall = async (options = {}) => {
  try {
    console.log('🎬 Presenting paywall...');

    const paywallResult = await RevenueCatUI.presentPaywall({
      offering: options.offering || null,
      ...(options.listeners || {}),
    });

    console.log('🎯 Paywall result:', paywallResult);

    const success =
      paywallResult === PAYWALL_RESULT.PURCHASED ||
      paywallResult === PAYWALL_RESULT.RESTORED;

    // Fetch fresh info après paywall si achat réussi
    const customerInfo = success ? await Purchases.getCustomerInfo() : null;

    return { success, result: paywallResult, customerInfo };
  } catch (error) {
    console.error('❌ Paywall error:', error.message);
    return { success: false, result: 'ERROR', customerInfo: null };
  }
};

// ─────────────────────────────────────────────────
// 7. Supabase premium sync (analytics)
// ─────────────────────────────────────────────────

/**
 * Synchronise le statut premium dans user_subscriptions (Supabase).
 * Upsert basé sur user_id.
 *
 * @param {string} userId - Supabase user.id
 * @param {{ isPremium: boolean, expiresAt: Date|null }} premiumData
 */
export const syncPremiumToSupabase = async (userId, premiumData) => {
  try {
    if (!userId) return;

    const customerInfo = await Purchases.getCustomerInfo();
    const entitlement =
      customerInfo?.entitlements?.active?.[ENTITLEMENTS.PRO];

    const row = {
      user_id: userId,
      is_premium: premiumData.isPremium,
      entitlement_id: ENTITLEMENTS.PRO,
      product_id: entitlement?.productIdentifier || null,
      expires_at: premiumData.expiresAt
        ? premiumData.expiresAt.toISOString()
        : null,
      original_purchase_date: entitlement?.originalPurchaseDate || null,
      latest_purchase_date: entitlement?.latestPurchaseDate || null,
      revenue_cat_user_id: customerInfo?.originalAppUserId || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert(row, { onConflict: 'user_id' });

    if (error) {
      console.error('❌ Supabase sync error:', error.message);
    } else {
      console.log('✅ Premium status synced to Supabase');
    }
  } catch (error) {
    console.error('❌ syncPremiumToSupabase error:', error.message);
  }
};

// ─────────────────────────────────────────────────
// 8. Listener temps réel pour changements de statut
// ─────────────────────────────────────────────────

/**
 * Ajoute un listener pour les mises à jour de customerInfo.
 * Utile pour détecter un annulation via Customer Center.
 * @param {Function} callback - (customerInfo) => void
 * @returns {{ remove: Function }} subscription
 */
export const addCustomerInfoListener = (callback) => {
  return Purchases.addCustomerInfoUpdateListener(callback);
};
