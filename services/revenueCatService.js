/**
 * RevenueCat Service
 * Gère les abonnements, entitlements, et customer info
 */

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import ENV from '../config/env';

// API Key RevenueCat depuis config/env.js
const REVENUE_CAT_API_KEY = ENV.REVENUE_CAT_API_KEY;

// Entitlements disponibles
export const ENTITLEMENTS = {
  PRO: 'PupyTracker Pro',
};

/**
 * Initialise RevenueCat
 * IMPORTANT: Appelle cette fonction au démarrage de l'app
 */
export const initializeRevenueCat = async () => {
  try {
    console.log('💳 Initializing RevenueCat...');
    
    // Configure Purchases (RevenueCat SDK)
    await Purchases.configure({
      apiKey: REVENUE_CAT_API_KEY,
    });
    
    console.log('✅ RevenueCat configured');
    
    // Sync purchases
    await Purchases.syncPurchases();
    console.log('✅ Purchases synced');
    
    console.log('✅ RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing RevenueCat:', error);
    console.error('  Details:', error.message);
    return false;
  }
};

/**
 * Récupère les offerings (produits d'abonnement)
 * @returns {Promise<PurchasesOffering>}
 */
export const getOfferings = async () => {
  try {
    console.log('📦 Fetching offerings...');
    
    const offerings = await Purchases.getOfferings();
    
    if (offerings.current != null) {
      console.log('✅ Current offering available:', offerings.current.identifier);
      return offerings.current;
    } else {
      console.warn('⚠️ No current offering available');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching offerings:', error);
    return null;
  }
};

/**
 * Récupère les informations du client (abonnement actif, entitlements, etc.)
 * @returns {Promise<Object>}
 */
export const getCustomerInfo = async () => {
  try {
    console.log('👤 Fetching customer info...');
    
    const customerInfo = await Purchases.getCustomerInfo();
    
    console.log('✅ Customer info retrieved:', {
      originalAppUserId: customerInfo.originalAppUserId,
      isAnonymous: customerInfo.isAnonymous,
      entitlements: Object.keys(customerInfo.entitlements.active),
    });
    
    return customerInfo;
  } catch (error) {
    console.error('❌ Error fetching customer info:', error);
    return null;
  }
};

/**
 * Vérifie si l'utilisateur a un entitlement spécifique
 * @param {string} entitlementId - ID de l'entitlement (ex: "PupyTracker Pro")
 * @returns {Promise<boolean>}
 */
export const hasEntitlement = async (entitlementId) => {
  try {
    const customerInfo = await getCustomerInfo();
    
    if (!customerInfo) {
      console.warn('⚠️ No customer info available');
      return false;
    }
    
    const hasAccess = customerInfo.entitlements.active[entitlementId] != null;
    
    console.log(`🔑 Entitlement "${entitlementId}" check:`, hasAccess ? '✅ Active' : '❌ Inactive');
    
    return hasAccess;
  } catch (error) {
    console.error('❌ Error checking entitlement:', error);
    return false;
  }
};

/**
 * Achete un package spécifique
 * @param {PurchasesPackage} selectedPackage - Package à acheter
 * @returns {Promise<boolean>} - true si achat réussi
 */
export const purchasePackage = async (selectedPackage) => {
  try {
    console.log('🛒 Starting purchase for package:', selectedPackage.identifier);
    
    const customerInfo = await Purchases.purchasePackage(selectedPackage);
    
    const isPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO] != null;
    
    if (isPro) {
      console.log('✅ Achat réussi! User est maintenant Pro');
      return true;
    } else {
      console.log('⚠️ Achat complété mais entitlement pas encore actif');
      return false;
    }
  } catch (error) {
    if (error.userCancelled) {
      console.log('👤 User cancelled the purchase');
      return false;
    }
    
    console.error('❌ Error during purchase:', error);
    return false;
  }
};

/**
 * Restaure les achats précédents
 * Utile pour les tests ou si l'utilisateur change de device
 * @returns {Promise<boolean>}
 */
export const restorePurchases = async () => {
  try {
    console.log('🔄 Restoring purchases...');
    
    const customerInfo = await Purchases.restorePurchases();
    
    const isPro = customerInfo.entitlements.active[ENTITLEMENTS.PRO] != null;
    
    console.log('✅ Purchases restored. Pro status:', isPro);
    
    return isPro;
  } catch (error) {
    console.error('❌ Error restoring purchases:', error);
    return false;
  }
};

/**
 * Récupère la date d'expiration d'un entitlement
 * @param {string} entitlementId
 * @returns {Promise<Date|null>}
 */
export const getEntitlementExpiration = async (entitlementId) => {
  try {
    const customerInfo = await getCustomerInfo();
    
    if (!customerInfo) return null;
    
    const entitlement = customerInfo.entitlements.active[entitlementId];
    
    if (!entitlement) return null;
    
    const expirationDate = new Date(entitlement.expirationDate);
    
    console.log(`📅 Entitlement "${entitlementId}" expires at:`, expirationDate);
    
    return expirationDate;
  } catch (error) {
    console.error('❌ Error getting entitlement expiration:', error);
    return null;
  }
};

/**
 * Ouvre le Customer Center de RevenueCat
 * Permet à l'utilisateur de gérer ses abonnements directement
 * @returns {Promise<void>}
 */
export const showCustomerCenter = async () => {
  try {
    console.log('🎫 Opening RevenueCat Customer Center...');
    
    // Le Customer Center ouvre une interface native RevenueCat
    await Purchases.presentCustomerCenter();
    
    console.log('✅ Customer Center closed');
  } catch (error) {
    console.error('❌ Error opening Customer Center:', error);
  }
};

/**
 * ========== NEW METHODS FOR REVENUECATUI (v9.10+) ==========
 */

/**
 * Présente le paywall RevenueCatUI avec gestion complète des résultats
 * Suit la documentation officielle: https://rev.cat/react-native-paywalls
 * 
 * @param {Object} options - Configuration optionnelle
 * @param {PurchasesOffering} options.offering - Offering spécifique (optionnel)
 * @param {Function} options.onPurchaseStarted - Callback quand l'achat commence
 * @param {Function} options.onPurchaseCompleted - Callback quand l'achat est complété
 * @param {Function} options.onPurchaseError - Callback en cas d'erreur
 * @param {Function} options.onPurchaseCancelled - Callback si utilisateur annule
 * @param {Function} options.onRestoreStarted - Callback quand restore commence
 * @param {Function} options.onRestoreCompleted - Callback quand restore est complété
 * @param {Function} options.onRestoreError - Callback si restore échoue
 * @param {Function} options.onDismiss - Callback quand le paywall se ferme
 * @returns {Promise<Object>} - { success: boolean, result: PAYWALL_RESULT, paywallResult }
 */
export const presentPaywall = async (options = {}) => {
  try {
    console.log('🎬 presentPaywall() called with listeners');
    
    const offeringToUse = options.offering || null;

    // Préparer les listeners
    const listeners = {
      onPurchaseStarted: options.onPurchaseStarted || (() => {
        console.log('💳 Purchase started...');
      }),
      onPurchaseCompleted: options.onPurchaseCompleted || ((customerInfo) => {
        console.log('✅ Purchase completed!', customerInfo);
      }),
      onPurchaseError: options.onPurchaseError || ((error) => {
        console.error('❌ Purchase error:', error);
      }),
      onPurchaseCancelled: options.onPurchaseCancelled || (() => {
        console.log('👋 Purchase cancelled by user');
      }),
      onRestoreStarted: options.onRestoreStarted || (() => {
        console.log('🔄 Restore purchases started...');
      }),
      onRestoreCompleted: options.onRestoreCompleted || ((customerInfo) => {
        console.log('✅ Restore completed!', customerInfo);
      }),
      onRestoreError: options.onRestoreError || ((error) => {
        console.error('❌ Restore error:', error);
      }),
      onDismiss: options.onDismiss || (() => {
        console.log('🚪 Paywall dismissed');
      }),
    };

    // Présenter le paywall avec listeners
    console.log('📱 Calling RevenueCatUI.presentPaywall()...');
    const paywallResult = await RevenueCatUI.presentPaywall({
      offering: offeringToUse,
      ...listeners,
    });

    console.log('🎯 Paywall result:', paywallResult);

    // Analyser le résultat
    let success = false;
    let message = '';

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
        success = true;
        message = 'Achat réussi! 🎉';
        console.log('✅ PAYWALL_RESULT.PURCHASED');
        break;

      case PAYWALL_RESULT.RESTORED:
        success = true;
        message = 'Achat restauré avec succès! 🎉';
        console.log('✅ PAYWALL_RESULT.RESTORED');
        break;

      case PAYWALL_RESULT.CANCELLED:
        success = false;
        message = 'Paywall annulé par l\'utilisateur';
        console.log('⚠️ PAYWALL_RESULT.CANCELLED');
        break;

      case PAYWALL_RESULT.NOT_PRESENTED:
        success = false;
        message = 'Le paywall n\'a pas pu être affiché';
        console.warn('⚠️ PAYWALL_RESULT.NOT_PRESENTED');
        break;

      case PAYWALL_RESULT.ERROR:
        success = false;
        message = 'Une erreur est survenue lors de la présentation du paywall';
        console.error('❌ PAYWALL_RESULT.ERROR');
        break;

      default:
        success = false;
        message = 'Statut du paywall inconnu';
        console.warn('⚠️ Unknown PAYWALL_RESULT:', paywallResult);
    }

    return {
      success,
      result: paywallResult,
      message,
      paywallResult,
    };
  } catch (error) {
    console.error('❌ Error presenting paywall:', error);
    return {
      success: false,
      result: 'ERROR',
      message: error.message,
      error,
    };
  }
};

/**
 * Présente le paywall UNIQUEMENT si l'utilisateur n'a pas l'entitlement requis
 * Idéal pour les paywalls au sein de l'app
 * 
 * @param {string} entitlementId - ID de l'entitlement requis (ex: "PupyTracker Pro")
 * @param {Object} options - Configuration optionnelle (listeners, offering)
 * @returns {Promise<Object>} - { success: boolean, hadEntitlement: boolean, result }
 */
export const presentPaywallIfNeeded = async (entitlementId, options = {}) => {
  try {
    console.log(`🎯 presentPaywallIfNeeded() - checking "${entitlementId}"`);

    // D'abord, vérifier si l'utilisateur a déjà l'entitlement
    const hasAccess = await hasEntitlement(entitlementId);
    
    if (hasAccess) {
      console.log(`✅ User already has "${entitlementId}" - no paywall needed`);
      return {
        success: true,
        hadEntitlement: true,
        result: 'ALREADY_ENTITLED',
        message: `User already has access to ${entitlementId}`,
      };
    }

    console.log(`❌ User doesn't have "${entitlementId}" - presenting paywall`);

    // Préparer les listeners
    const listeners = {
      onPurchaseStarted: options.onPurchaseStarted || (() => {
        console.log('💳 Purchase started...');
      }),
      onPurchaseCompleted: options.onPurchaseCompleted || ((customerInfo) => {
        console.log('✅ Purchase completed!');
      }),
      onPurchaseError: options.onPurchaseError || ((error) => {
        console.error('❌ Purchase error:', error);
      }),
      onDismiss: options.onDismiss || (() => {
        console.log('🚪 Paywall dismissed');
      }),
    };

    // Présenter le paywall
    console.log('📱 Calling RevenueCatUI.presentPaywallIfNeeded()...');
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: entitlementId,
      offering: options.offering || null,
      ...listeners,
    });

    console.log('🎯 Paywall result:', paywallResult);

    // Analyser le résultat
    let success = false;
    let message = '';

    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        success = true;
        message = 'Achat réussi! 🎉';
        console.log('✅ Purchase successful');
        break;

      case PAYWALL_RESULT.CANCELLED:
      case PAYWALL_RESULT.NOT_PRESENTED:
        success = false;
        message = 'Paywall annulé ou non affiché';
        console.log('⚠️ Paywall not completed');
        break;

      case PAYWALL_RESULT.ERROR:
        success = false;
        message = 'Une erreur est survenue';
        console.error('❌ Paywall error');
        break;

      default:
        success = false;
        message = 'Statut inconnu';
    }

    return {
      success,
      hadEntitlement: false,
      result: paywallResult,
      message,
    };
  } catch (error) {
    console.error('❌ Error in presentPaywallIfNeeded:', error);
    return {
      success: false,
      hadEntitlement: false,
      result: 'ERROR',
      message: error.message,
      error,
    };
  }
};
