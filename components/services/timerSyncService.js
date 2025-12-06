/**
 * Service de synchronisation des timers
 * Tous les timers s'updatent en même temps via cet intervalle global
 */

let listeners = [];
let globalInterval = null;

export const timerSyncService = {
  /**
   * S'abonner aux updates du timer
   * Retourne une fonction pour se désabonner
   */
  subscribe: (callback) => {
    listeners.push(callback);
    
    // Démarrer l'intervalle global si pas déjà lancé
    if (!globalInterval) {
      globalInterval = setInterval(() => {
        listeners.forEach(cb => cb());
      }, 10000); // Update tous les 10 secondes
    }
    
    // Retourner fonction de désabonnement
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
      
      // Arrêter l'intervalle si plus de listeners
      if (listeners.length === 0 && globalInterval) {
        clearInterval(globalInterval);
        globalInterval = null;
      }
    };
  },

  /**
   * Déclencher une update immédiate
   */
  trigger: () => {
    listeners.forEach(cb => cb());
  },
};
