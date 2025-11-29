// src/services/chartService.js
import { supabase } from '../../config/supabase';

/**
 * Récupère les stats des 7 derniers jours pour le graphique
 */
export const getLast7DaysStats = async (dogId) => {
  try {
    // Utiliser UTC pour comparer avec les données en UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Créer les 7 derniers jours en UTC
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - i);
      days.push({
        date: date,
        dayKey: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
        outside: 0,
        inside: 0,
        total: 0,
        percentage: 0,
      });
    }

    const startDate = new Date(today);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const { data, error } = await supabase
      .from('outings')
      .select('datetime, pee, pee_location, poop, poop_location')
      .eq('dog_id', dogId)
      .gte('datetime', startDate.toISOString());

    if (error) throw error;
    const outings = data || [];


    // Remplir les stats par jour
    outings.forEach(outing => {
      const outingDate = new Date(outing.datetime);
      // Extraire la date en UTC
      const dayKey = outingDate.toISOString().split('T')[0];
      
      const dayData = days.find(d => d.dayKey === dayKey);
      if (!dayData) return;

      // Une outing = 1 enregistrement
      // On regarde si AU MOINS UN besoin (pee ou poop) est dedans (inside)
      // Si oui = incident, sinon = succès
      
      const peeIsInside = outing.pee && outing.pee_location === 'inside';
      const poopIsInside = outing.poop && outing.poop_location === 'inside';
      const peeIsOutside = outing.pee && outing.pee_location === 'outside';
      const poopIsOutside = outing.poop && outing.poop_location === 'outside';

      // Priorité: si AU MOINS UN besoin est dedans = INCIDENT
      if (peeIsInside || poopIsInside) {
        dayData.inside++;
      } else if (peeIsOutside || poopIsOutside) {
        // Sinon si au moins un est dehors = SUCCÈS
        dayData.outside++;
      }
      // Sinon: aucun besoin (pee=false et poop=false) = pas compté
    });

    // Calculer les totaux et pourcentages
    days.forEach(day => {
      day.total = day.outside + day.inside;
      day.percentage = day.total > 0 
        ? Math.round((day.outside / day.total) * 100)
        : 0;
    });

    return days;
  } catch (error) {
    console.error('Erreur getLast7DaysStats:', error);
    return [];
  }
};