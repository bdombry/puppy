/**
 * Validateurs de données réutilisables
 * Utilisés par ActivityScreen, FeedingScreen, WalkScreen, etc.
 */

/**
 * Valide les données d'une activité avant insertion
 * @param {Object} data - Les données à valider
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateActivityData = (data) => {
  const errors = [];

  if (data.duration_minutes) {
    const minutes = parseInt(data.duration_minutes);
    if (isNaN(minutes)) {
      errors.push('Durée invalide (doit être un nombre)');
    } else if (minutes < 0 || minutes > 480) {
      errors.push('Durée invalide (0-480 minutes)');
    }
  }

  if (data.title && data.title.trim().length > 255) {
    errors.push('Titre trop long (max 255 caractères)');
  }

  if (data.location && data.location.trim().length > 255) {
    errors.push('Lieu trop long (max 255 caractères)');
  }

  if (data.description && data.description.trim().length > 1000) {
    errors.push('Description trop longue (max 1000 caractères)');
  }

  if (data.datetime) {
    try {
      const date = new Date(data.datetime);
      if (isNaN(date.getTime())) {
        errors.push('Date invalide');
      }
      // Vérifier que la date n'est pas trop loin dans le passé (> 1 an)
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (date < oneYearAgo) {
        errors.push('La date est trop ancienne (> 1 an)');
      }
      // Vérifier que la date n'est pas dans le futur
      const now = new Date();
      if (date > now) {
        errors.push('La date ne peut pas être dans le futur');
      }
    } catch (err) {
      errors.push('Erreur validation date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données d'une sortie (walk/incident)
 * @param {Object} data - Les données à valider
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateWalkData = (data) => {
  const errors = [];

  // Au moins un besoin doit être enregistré
  if (!data.pee && !data.poop) {
    errors.push('Au moins pipi ou caca doit être enregistré');
  }

  if (data.datetime) {
    try {
      const date = new Date(data.datetime);
      if (isNaN(date.getTime())) {
        errors.push('Date invalide');
      }
      // Pas plus de 5 minutes dans le futur (tolérance horloge)
      const now = new Date();
      const fifthMinutesFromNow = new Date(now.getTime() + 5 * 60000);
      if (date > fifthMinutesFromNow) {
        errors.push('La date ne peut pas être dans le futur');
      }
    } catch (err) {
      errors.push('Erreur validation date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Valide les données d'alimentation
 * @param {Object} data - Les données à valider
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
export const validateFeedingData = (data) => {
  const errors = [];

  // Au moins un type doit être enregistré
  if (!data.types || data.types.length === 0) {
    errors.push('Au moins manger ou boire doit être sélectionné');
  }

  if (data.datetime) {
    try {
      const date = new Date(data.datetime);
      if (isNaN(date.getTime())) {
        errors.push('Date invalide');
      }
    } catch (err) {
      errors.push('Erreur validation date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Convertir les erreurs de validation en message utilisateur
 * @param {string[]} errors - Tableau d'erreurs
 * @returns {string} Message formaté pour l'utilisateur
 */
export const formatValidationErrors = (errors) => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return '❌ ' + errors.join('\n• ');
};

/**
 * Valider et nettoyer les données avant envoi Supabase
 * @param {Object} data - Les données brutes
 * @param {Object} schema - { key: validatorFn, ... }
 * @returns {Object} Données nettoyées ou null si invalide
 */
export const sanitizeAndValidate = (data, schema) => {
  const cleaned = {};

  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in data)) continue;

    const value = data[key];

    // Sauter les valeurs null/undefined
    if (value === null || value === undefined) {
      cleaned[key] = null;
      continue;
    }

    // Appliquer le validateur
    const isValid = validator(value);
    if (!isValid) {
      throw new Error(`Validation échouée pour ${key}`);
    }

    // Nettoyer les strings
    if (typeof value === 'string') {
      cleaned[key] = value.trim() || null;
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
};
