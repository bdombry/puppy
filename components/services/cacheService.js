/**
 * Service de cache local avec expiration
 * Évite de recharger les données inutilement
 * 
 * Utilisation:
 * - Données statiques (stats, streaks): cache 5 minutes
 * - Données temps réel (last outing): cache 30 secondes
 * - Format: cacheService.set('key', data, expirationMs)
 *           cacheService.get('key')
 */

class CacheService {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Définir une valeur en cache avec expiration optionnelle
   * @param {string} key - Clé unique
   * @param {*} value - Valeur à cacher
   * @param {number} expirationMs - Expiration en ms (défaut: 5 min)
   */
  set(key, value, expirationMs = 5 * 60 * 1000) {
    // Effacer l'ancien timer si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Stocker la valeur + timestamp
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      expiration: expirationMs,
    });

    // Programmer la suppression automatique
    const timer = setTimeout(() => {
      this.cache.delete(key);
      this.timers.delete(key);
    }, expirationMs);

    this.timers.set(key, timer);
  }

  /**
   * Récupérer une valeur du cache si valide
   * @param {string} key - Clé unique
   * @returns {*|null} - Valeur ou null si expiré/inexistant
   */
  get(key) {
    if (!this.cache.has(key)) return null;

    const cached = this.cache.get(key);
    const age = Date.now() - cached.timestamp;

    // Vérifier l'expiration
    if (age > cached.expiration) {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
      return null;
    }

    return cached.value;
  }

  /**
   * Vérifier si une clé existe et est valide
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Invalider une clé spécifique
   * @param {string} key
   */
  invalidate(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
  }

  /**
   * Invalider toutes les clés matchant un pattern
   * Utile après une écriture en base
   * @param {string|RegExp} pattern - Pattern à matcher
   */
  invalidatePattern(pattern) {
    const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.invalidate(key));
  }

  /**
   * Vider tout le cache
   */
  clear() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }

  /**
   * Debug: voir ce qui est en cache
   */
  debug() {
    const entries = [];
    for (const [key, data] of this.cache.entries()) {
      const age = Date.now() - data.timestamp;
      const remaining = data.expiration - age;
      entries.push({
        key,
        ageMs: age,
        remainingMs: remaining,
        valuePreview: typeof data.value === 'object' ? 
          `${JSON.stringify(data.value).substring(0, 50)}...` : 
          String(data.value)
      });
    }
    console.table(entries);
  }
}

// Export singleton
export const cacheService = new CacheService();

/**
 * Helpers pour clés communes
 */
export const CACHE_KEYS = {
  // HomeScreen - 5 minutes par défaut
  HOME_STATS: (dogId, period) => `home_stats_${dogId}_${period}`,
  HOME_TOTAL_OUTINGS: (dogId) => `home_total_outings_${dogId}`,
  HOME_STREAK: (dogId) => `home_streak_${dogId}`,
  
  // Timers - 30 secondes (données temps réel)
  LAST_OUTING: (dogId) => `last_outing_${dogId}`,
  LAST_NEED: (dogId) => `last_need_${dogId}`,
  
  // History - 2 minutes
  OUTING_HISTORY: (dogId, days) => `outing_history_${dogId}_${days}d`,
  ACTIVITY_HISTORY: (dogId, days) => `activity_history_${dogId}_${days}d`,
  
  // Analytics - 10 minutes (calculs coûteux)
  ANALYTICS: (dogId, period) => `analytics_${dogId}_${period}`,
};

/**
 * Cache durations recommandées
 */
export const CACHE_DURATION = {
  STATIC: 5 * 60 * 1000,        // 5 min - Stats, streaks
  REALTIME: 30 * 1000,           // 30 sec - Timers
  HISTORY: 2 * 60 * 1000,        // 2 min - Historique
  ANALYTICS: 10 * 60 * 1000,     // 10 min - Analytics
  SHORT: 1 * 60 * 1000,          // 1 min - Données volatiles
};
