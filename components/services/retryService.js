/**
 * Service de retry automatique pour les appels Supabase
 * Utilise exponential backoff et jitter
 */

import { isRetryableError } from './errorHandler';

/**
 * Réessayer une opération avec exponential backoff
 * @param {Function} operation - Fonction async à réessayer
 * @param {Object} options - Configuration
 * @returns {Promise}
 *
 * @example
 * const data = await withRetry(
 *   () => supabase.from('outings').insert([walkData]),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export const withRetry = async (
  operation,
  options = {}
) => {
  const {
    maxRetries = 3,
    initialDelay = 1000, // ms
    maxDelay = 30000, // ms
    context = 'Unknown operation',
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Vérifier si l'erreur est retryable
      if (!isRetryableError(error)) {
        throw error;
      }

      // Pas plus d'essais
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculer le délai avec exponential backoff + jitter
      const exponentialDelay = initialDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 1000; // 0-1000ms de jitter
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      console.warn(
        `⚠️ ${context} - Tentative ${attempt + 1}/${maxRetries} échouée. ` +
        `Nouvel essai dans ${Math.round(delay)}ms...`
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper Supabase query avec retry
 * @param {Function} supabaseQuery - Fonction Supabase (ex: supabase.from('table').select())
 * @param {Object} options - Configuration retry
 * @returns {Promise}
 */
export const executeSupabaseQuery = async (supabaseQuery, options = {}) => {
  return withRetry(
    async () => {
      const { data, error } = await supabaseQuery;

      if (error) {
        const err = new Error(error.message);
        err.code = error.code;
        err.status = error.status;
        throw err;
      }

      return data;
    },
    { context: 'Supabase query', ...options }
  );
};

/**
 * Wrapper Supabase insert avec retry
 * @param {Object} supabase - Client Supabase
 * @param {string} table - Nom de la table
 * @param {Array} data - Données à insérer
 * @param {Object} options - Configuration retry
 * @returns {Promise}
 */
export const insertWithRetry = async (
  supabase,
  table,
  data,
  options = {}
) => {
  return withRetry(
    async () => {
      const { error, data: result } = await supabase
        .from(table)
        .insert(data);

      if (error) {
        const err = new Error(error.message);
        err.code = error.code;
        err.status = error.status;
        throw err;
      }

      return result;
    },
    { context: `Supabase insert into ${table}`, ...options }
  );
};

/**
 * Wrapper Supabase update avec retry
 * @param {Object} supabase - Client Supabase
 * @param {string} table - Nom de la table
 * @param {Object} data - Données à mettre à jour
 * @param {string} matchColumn - Colonne pour le WHERE
 * @param {*} matchValue - Valeur pour le WHERE
 * @param {Object} options - Configuration retry
 * @returns {Promise}
 */
export const updateWithRetry = async (
  supabase,
  table,
  data,
  matchColumn,
  matchValue,
  options = {}
) => {
  return withRetry(
    async () => {
      const { error, data: result } = await supabase
        .from(table)
        .update(data)
        .eq(matchColumn, matchValue);

      if (error) {
        const err = new Error(error.message);
        err.code = error.code;
        err.status = error.status;
        throw err;
      }

      return result;
    },
    { context: `Supabase update ${table}`, ...options }
  );
};

/**
 * Wrapper pour les opérations batch (plusieurs inserts)
 * Réessaie une fois le batch complet, puis essaie élément par élément
 * @param {Object} supabase - Client Supabase
 * @param {string} table - Nom de la table
 * @param {Array} items - Éléments à insérer
 * @param {Object} options - Configuration
 * @returns {Promise<Object>} { successful: Array, failed: Array }
 */
export const insertBatchWithFallback = async (
  supabase,
  table,
  items,
  options = {}
) => {
  const { maxRetries = 3, maxParallel = 5 } = options;
  const successful = [];
  const failed = [];

  // Essayer le batch complet d'abord
  try {
    await insertWithRetry(supabase, table, items, { maxRetries });
    return { successful: items, failed: [] };
  } catch (batchError) {
    console.warn(`⚠️ Batch insert échoué, tentative par élément...`);
  }

  // Fallback: insérer un par un en parallèle
  const chunks = [];
  for (let i = 0; i < items.length; i += maxParallel) {
    chunks.push(items.slice(i, i + maxParallel));
  }

  for (const chunk of chunks) {
    const promises = chunk.map(item =>
      insertWithRetry(supabase, table, [item], { maxRetries })
        .then(() => {
          successful.push(item);
        })
        .catch(error => {
          console.error(`❌ Erreur insert élément:`, error.message);
          failed.push({ item, error: error.message });
        })
    );

    await Promise.all(promises);
  }

  return { successful, failed };
};
