import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

import App from './App';

// Attraper les erreurs non-catchées globalement (crash natif/promise)
const originalHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('💥 GLOBAL ERROR:', error?.message, error?.stack);
  if (isFatal) {
    Alert.alert(
      '💥 Crash détecté',
      `${error?.message || 'Erreur inconnue'}\n\nStack: ${(error?.stack || '').substring(0, 300)}`,
      [{ text: 'OK' }]
    );
  }
  if (originalHandler) {
    originalHandler(error, isFatal);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
