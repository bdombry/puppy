/**
 * Deeplink Testing Utilities
 * 
 * Utilisation:
 * 1. Importer ce fichier dans votre écran de test
 * 2. Appeler les fonctions via un bouton de test
 * 3. Vérifier les logs et la navigation
 */

import { Linking } from 'react-native';
import { generateDeepLink } from './deeplinkService';

/**
 * Teste un deeplink en l'ouvrant directement
 * @param {string} routeName - Nom de la route à tester
 * @param {object} params - Paramètres optionnels
 */
export const testDeepLink = async (routeName, params = {}) => {
  try {
    const deepLink = generateDeepLink(routeName, params);
    console.log(`🧪 Testing deeplink: ${deepLink}`);
    
    const canOpen = await Linking.canOpenURL(deepLink);
    console.log(`   Can open: ${canOpen}`);
    
    if (canOpen) {
      await Linking.openURL(deepLink);
      console.log(`✅ Deeplink opened successfully`);
    } else {
      console.warn(`⚠️ Cannot open deeplink: ${deepLink}`);
    }
  } catch (error) {
    console.error(`❌ Error testing deeplink:`, error);
  }
};

/**
 * Suite de tests pour tous les deeplinks
 */
export const testAllDeepLinks = async () => {
  console.log('🚀 Starting deeplink test suite...\n');

  const tests = [
    { name: 'Paywall', route: 'paywall', params: {} },
    { name: 'Auth', route: 'auth', params: {} },
    { name: 'Setup', route: 'setup', params: {} },
    { name: 'Invite', route: 'invite', params: { token: 'test_token_123' } },
  ];

  for (const test of tests) {
    console.log(`\n📍 Testing: ${test.name}`);
    await testDeepLink(test.route, test.params);
    // Petit délai entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n✅ Deeplink test suite completed!');
};

/**
 * Teste un deeplink raw (URL complète)
 * Utile pour tester des URLs personnalisées
 * 
 * @param {string} url - URL complète du deeplink
 */
export const testRawDeepLink = async (url) => {
  try {
    console.log(`🧪 Testing raw deeplink: ${url}`);
    
    const canOpen = await Linking.canOpenURL(url);
    console.log(`   Can open: ${canOpen}`);
    
    if (canOpen) {
      await Linking.openURL(url);
      console.log(`✅ Raw deeplink opened successfully`);
    } else {
      console.warn(`⚠️ Cannot open raw deeplink: ${url}`);
    }
  } catch (error) {
    console.error(`❌ Error testing raw deeplink:`, error);
  }
};

/**
 * Teste un deeplink avec délai
 * Utile pour voir les transitions d'écran
 * 
 * @param {string} routeName - Nom de la route
 * @param {number} delayMs - Délai avant d'ouvrir (ms)
 * @param {object} params - Paramètres optionnels
 */
export const testDeepLinkWithDelay = async (routeName, delayMs = 2000, params = {}) => {
  console.log(`⏱️  Testing deeplink with ${delayMs}ms delay: ${routeName}`);
  await new Promise(resolve => setTimeout(resolve, delayMs));
  await testDeepLink(routeName, params);
};

/**
 * Exemple d'utilisation dans un composant:
 * 
 * import { testDeepLink, testAllDeepLinks } from './deeplinkTestUtils';
 * 
 * <Button
 *   title="Test Paywall Deeplink"
 *   onPress={() => testDeepLink('paywall')}
 * />
 * 
 * <Button
 *   title="Test All Deeplinks"
 *   onPress={() => testAllDeepLinks()}
 * />
 */
