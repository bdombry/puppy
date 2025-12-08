/**
 * Utilitaire pour générer des messages personnalisés selon le sexe du chien
 */

export const getDogMessages = (dogName, sex) => {
  const isFemale = sex === 'female';
  const pronoun = isFemale ? 'Elle' : 'Il';
  const pronounLower = isFemale ? 'elle' : 'il';
  const possessive = isFemale ? 'sa' : 'son';

  return {
    // Messages de base
    pronoun,
    pronounLower,
    possessive,
    
    // Messages de pipi
    peeDone: `${pronoun} a fait pipi! `,
    peeOutside: `${pronoun} a fait pipi dehors! `,
    peeInside: `${pronoun} a fait pipi à l'intérieur `,
    
    // Messages de caca
    poopDone: `${pronoun} a fait caca! `,
    poopOutside: `${pronoun} a fait caca dehors! `,
    poopInside: `${pronoun} a fait caca à l'intérieur `,
    
    // Messages de traitement
    treatsGiven: `${pronoun} a reçu une friandise! `,
    
    // Messages de sortie
    walkSuccess: `${pronoun} a fait une belle sortie! `,
    incidentInside: `Qu'a fait ${dogName} ?`,
    incidentQuestion: `${pronoun} a eu un incident...`,
    
    // Messages de nourriture/boisson
    ateFood: `${pronoun} a mangé! `,
    drankWater: `${pronoun} a bu de l'eau! `,
    ateAndDrank: `${pronoun} a mangé et bu! `,
    
    // Messages génériques
    greeting: `Coucou ${dogName} ! `,
    welcome: `Bienvenue ! `,
    syncSuccess: `La synchronisation de ${dogName} est terminée! `,
  };
};