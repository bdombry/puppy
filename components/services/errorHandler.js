/**
 * Gestionnaire centralisé d'erreurs
 * Convertit les erreurs techniques en messages utilisateur simples
 */

/**
 * Convertir une erreur Supabase/technique en message utilisateur
 * @param {Error|Object} error - L'erreur à convertir
 * @returns {string} Message lisible pour l'utilisateur
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (!error) return 'Une erreur inconnue est survenue';

  // Message personnalisé si défini
  if (error.userMessage) {
    return error.userMessage;
  }

  // Erreurs réseau
  if (error.message?.includes('Network')) {
    return '📡 Pas de connexion Internet. Vérifiez votre réseau.';
  }

  // Erreurs Supabase spécifiques
  if (error.code === '42P01') {
    return '❌ Table non trouvée. Contactez le support.';
  }
  if (error.code === '42703') {
    return '⚠️ Colonne manquante en base de données. Veuillez réessayer.';
  }
  if (error.code === '23505') {
    return '⚠️ Cet enregistrement existe déjà.';
  }
  if (error.code === '23503') {
    return '❌ Données invalides ou références manquantes.';
  }
  if (error.code === 'PGRST116') {
    return '🔍 Ressource non trouvée.';
  }
  if (error.code === 'PGRST204') {
    return '📭 Aucune donnée disponible.';
  }

  // Erreurs d'authentification
  if (error.message?.includes('Invalid login credentials')) {
    return '🔐 Email ou mot de passe incorrect.';
  }
  if (error.message?.includes('User already registered')) {
    return '👤 Cet email est déjà utilisé.';
  }
  if (error.message?.includes('Password should be')) {
    return '🔒 Le mot de passe est trop faible (min 6 caractères).';
  }

  // Erreurs de timeout
  if (error.message?.includes('timeout')) {
    return '⏱️ La requête a pris trop de temps. Vérifiez votre connexion.';
  }

  // Erreur générique
  const messageGeneric = error.message || error.toString();
  if (messageGeneric.length > 100) {
    return '❌ Une erreur est survenue. Veuillez réessayer.';
  }

  return messageGeneric;
};

/**
 * Logger une erreur avec contexte
 * @param {string} context - Où l'erreur s'est produite (ex: "WalkScreen.handleSave")
 * @param {Error} error - L'erreur
 * @param {Object} data - Données contextuelles optionnelles
 */
export const logError = (context, error, data = {}) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error?.message || String(error);
  const errorCode = error?.code || 'UNKNOWN';

  console.error(`[${timestamp}] ${context} (${errorCode})`);
  console.error('Message:', errorMessage);
  if (Object.keys(data).length > 0) {
    console.error('Context:', data);
  }
  if (error?.stack) {
    console.error('Stack:', error.stack);
  }
};

/**
 * Wrapper pour les opérations Supabase avec meilleure gestion d'erreur
 * @param {string} context - Contexte de l'opération
 * @param {Function} operation - Fonction async à exécuter
 * @param {Object} options - { showAlert: boolean, alertTitle: string }
 * @returns {Promise} Résultat de l'opération ou null
 */
export const executeWithErrorHandling = async (
  context,
  operation,
  options = {}
) => {
  const { showAlert = true, alertTitle = '❌ Erreur' } = options;

  try {
    const result = await operation();
    return result;
  } catch (error) {
    logError(context, error);

    if (showAlert) {
      // Ne pas logger directement Alert.alert() - retourner le message
      throw {
        title: alertTitle,
        message: getUserFriendlyErrorMessage(error),
        isUserFriendly: true,
      };
    }

    throw error;
  }
};

/**
 * Créer une erreur personnalisée avec message utilisateur
 * @param {string} userMessage - Message pour l'utilisateur
 * @param {string} technicalMessage - Message technique (pour logs)
 * @returns {Error}
 */
export const createUserError = (userMessage, technicalMessage = null) => {
  const error = new Error(technicalMessage || userMessage);
  error.userMessage = userMessage;
  return error;
};

/**
 * Décider si une erreur est retryable
 * @param {Error} error - L'erreur à tester
 * @returns {boolean}
 */
export const isRetryableError = (error) => {
  // Erreurs réseau
  if (error.message?.includes('Network') || error.message?.includes('ECONNREFUSED')) {
    return true;
  }

  // Timeouts
  if (error.message?.includes('timeout')) {
    return true;
  }

  // Erreurs Supabase côté serveur (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Codes spécifiques non retryable
  const nonRetryableCodes = ['23505', '23503', '42P01', 'PGRST116', 'PGRST204'];
  if (nonRetryableCodes.includes(error.code)) {
    return false;
  }

  return false;
};
