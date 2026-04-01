/**
 * Service pour gérer les deeplinks de l'application
 * 
 * URI Scheme: pupytracker://
 * 
 * Routes disponibles:
 * - pupytracker://paywall - Désactivé (évite ouverture paywall hors onboarding)
 * - pupytracker://invite/:token - Accepter une invitation
 * - pupytracker://auth - Aller à l'écran d'authentification
 */

/**
 * Parse une URL de deeplink et retourne le nom de la route et ses paramètres
 * @param {string} url - L'URL à parser
 * @returns {{ routeName: string, params: object }}
 */
export const parseDeepLink = (url) => {
  if (!url) return null;

  try {
    // Enlever le préfixe du scheme
    const route = url.replace(/.*?:\/\//g, '');
    const [routeName, ...pathParts] = route.split('/');

    const params = {};

    // Parser les paramètres selon la route
    if (routeName === 'invite' && pathParts[0]) {
      params.token = pathParts[0];
    }

    console.log(`📍 Deeplink parsé:`, { routeName, params });

    return { routeName, params };
  } catch (error) {
    console.error('❌ Erreur lors du parsing du deeplink:', error);
    return null;
  }
};

/**
 * Navigate vers la route appropriée basée sur le deeplink
 * @param {NavigationContainerRef} navigationRef - Référence du conteneur de navigation
 * @param {{ routeName: string, params: object }} deeplink - Deeplink parsé
 */
export const handleDeepLink = (navigationRef, deeplink) => {
  if (!deeplink || !navigationRef?.current) return;

  const { routeName, params } = deeplink;

  console.log(`🔗 Gestion du deeplink: ${routeName}`, params);

  switch (routeName) {
    case 'paywall':
      console.warn('⚠️ Deeplink paywall ignoré (désactivé hors onboarding)');
      break;
    case 'invite':
      navigationRef.current.navigate('AcceptInvitation', { token: params.token });
      break;
    case 'auth':
      navigationRef.current.navigate('Auth');
      break;
    default:
      console.warn(`⚠️ Route deeplink inconnue: ${routeName}`);
  }
};

/**
 * Génère une URL de deeplink pour une route donnée
 * @param {string} routeName - Nom de la route
 * @param {object} params - Paramètres de la route
 * @returns {string} URL de deeplink
 */
export const generateDeepLink = (routeName, params = {}) => {
  const baseUrl = 'pupytracker://';

  switch (routeName) {
    case 'paywall':
      console.warn('⚠️ Deeplink paywall désactivé');
      return baseUrl;
    case 'invite':
      return `${baseUrl}invite/${params.token}`;
    case 'auth':
      return `${baseUrl}auth`;
    default:
      console.warn(`⚠️ Route inconnue pour générer deeplink: ${routeName}`);
      return baseUrl;
  }
};
