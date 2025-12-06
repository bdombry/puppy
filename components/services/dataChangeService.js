/**
 * Service pour notifier les screens quand les données changent
 * Permet au WalkHistoryScreen de se recharger après un enregistrement
 */

let listeners = [];

export const dataChangeService = {
  /**
   * S'abonner aux changements
   * @param {Function} callback - Appelé quand les données changent
   * @returns {Function} Fonction pour se désabonner
   */
  subscribe: (callback) => {
    listeners.push(callback);
    // Retourner la fonction de désabonnement
    return () => {
      listeners = listeners.filter(l => l !== callback);
    };
  },

  /**
   * Notifier les listeners que les données ont changé
   * @param {string} type - Type de données: 'walk', 'activity', 'feeding', etc.
   */
  notifyChange: (type) => {
    console.log(`📢 Data change notified: ${type}`);
    listeners.forEach(callback => callback(type));
  },
};
