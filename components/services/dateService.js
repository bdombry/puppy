/**
 * Service de gestion des dates avec correction timezone
 * Assure que toutes les dates sont enregistrées correctement selon le timezone local
 */

/**
 * Convertit une date en string ISO avec correction timezone locale
 * @param {Date} date - La date à convertir (défaut: maintenant)
 * @returns {string} Date en format ISO sans le Z final (compatible Supabase)
 */
export const formatDateTimeLocal = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, -1); // Enlever le Z final
};

/**
 * Crée une date à l'heure actuelle avec correction timezone
 * @returns {string} Date actuelle en format ISO local
 */
export const getNowLocal = () => {
  return formatDateTimeLocal(new Date());
};
