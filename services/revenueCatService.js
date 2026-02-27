/**
 * RevenueCat Service
 * Gère les abonnements, entitlements, et customer info
 */

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
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
