/**
 * Configuration des variables d'environnement
 * En développement: Lire depuis process.env ou valeurs par défaut
 * En production (EAS): Lire depuis Expo Secrets (eas.json)
 */

import Constants from 'expo-constants';

// Récupérer les secrets d'Expo (disponibles en EAS Build)
const expoSecrets = Constants.expoConfig?.extra || {};

const ENV = {
  // Supabase - Lire depuis les secrets Expo ou process.env
  SUPABASE_URL: expoSecrets.SUPABASE_URL || process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: expoSecrets.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  
  // RevenueCat - Lire depuis les secrets Expo ou process.env
  REVENUE_CAT_API_KEY: expoSecrets.REVENUE_CAT_API_KEY || process.env.REVENUE_CAT_API_KEY || '',

  // Expo - Lire depuis les secrets Expo ou process.env
  EXPO_PROJECT_ID: expoSecrets.EXPO_PROJECT_ID || process.env.EXPO_PROJECT_ID || '',
};

// Validation - vérifier les clés requises
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  console.warn('⚠️ Warning: Supabase credentials not found');
}

if (!ENV.REVENUE_CAT_API_KEY) {
  console.warn('⚠️ Warning: RevenueCat API key not found');
}

export default ENV;
