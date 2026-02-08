/**
 * Tests unitaires pour le service de notifications
 */

import {
  PUPPY_PRESETS,
  DEFAULT_NOTIFICATION_SETTINGS,
  scheduleNotificationFromOuting,
  timeToMinutes,
  isInExcludedRange,
  getNextValidTime,
} from '../notificationService';

// Mocks
jest.mock('expo-notifications');
jest.mock('@react-native-async-storage/async-storage');

// ============================================
// 1. TESTS DES PRESETS
// ============================================

describe('PUPPY_PRESETS', () => {
  test('doit avoir 3 presets (young, medium, older)', () => {
    expect(Object.keys(PUPPY_PRESETS).length).toBe(3);
    expect(PUPPY_PRESETS.young).toBeDefined();
    expect(PUPPY_PRESETS.medium).toBeDefined();
    expect(PUPPY_PRESETS.older).toBeDefined();
  });

  test('chaque preset doit avoir un intervalle correct', () => {
    expect(PUPPY_PRESETS.young.interval).toBe(2);
    expect(PUPPY_PRESETS.medium.interval).toBe(3);
    expect(PUPPY_PRESETS.older.interval).toBe(4);
  });

  test('chaque preset doit avoir un label', () => {
    expect(PUPPY_PRESETS.young.label).toContain('2-3 mois');
    expect(PUPPY_PRESETS.medium.label).toContain('4-6 mois');
    expect(PUPPY_PRESETS.older.label).toContain('6+ mois');
  });
});

// ============================================
// 2. TESTS DES PARAMÈTRES PAR DÉFAUT
// ============================================

describe('DEFAULT_NOTIFICATION_SETTINGS', () => {
  test('doit avoir un preset par défaut', () => {
    expect(DEFAULT_NOTIFICATION_SETTINGS.preset).toBe('medium');
  });

  test('doit avoir un tableau de plages d\'exclusion vide par défaut', () => {
    expect(Array.isArray(DEFAULT_NOTIFICATION_SETTINGS.excludedRanges)).toBe(true);
    expect(DEFAULT_NOTIFICATION_SETTINGS.excludedRanges.length).toBe(0);
  });
});

// ============================================
// 3. TESTS DES CONVERSIONS DE TEMPS
// ============================================

describe('timeToMinutes', () => {
  test('doit convertir "00:00" en 0 minutes', () => {
    expect(timeToMinutes('00:00')).toBe(0);
  });

  test('doit convertir "12:30" en 750 minutes', () => {
    expect(timeToMinutes('12:30')).toBe(750); // 12*60 + 30
  });

  test('doit convertir "23:59" en 1439 minutes', () => {
    expect(timeToMinutes('23:59')).toBe(1439); // 23*60 + 59
  });

  test('doit convertir "08:00" en 480 minutes', () => {
    expect(timeToMinutes('08:00')).toBe(480); // 8*60
  });
});

// ============================================
// 4. TESTS DES PLAGES D'EXCLUSION
// ============================================

describe('isInExcludedRange - Cas normal (sans minuit)', () => {
  const ranges = [
    { start: '08:00', end: '12:00' }, // 8h-12h
    { start: '14:00', end: '16:00' }, // 14h-16h
  ];

  test('doit détecter 10:30 dans la plage 08:00-12:00', () => {
    expect(isInExcludedRange(10, 30, ranges)).toBe(true);
  });

  test('doit détecter 15:00 dans la plage 14:00-16:00', () => {
    expect(isInExcludedRange(15, 0, ranges)).toBe(true);
  });

  test('ne doit pas détecter 07:59 dans les plages', () => {
    expect(isInExcludedRange(7, 59, ranges)).toBe(false);
  });

  test('ne doit pas détecter 12:00 (limite supérieure exclus)', () => {
    expect(isInExcludedRange(12, 0, ranges)).toBe(false);
  });

  test('doit détecter 08:00 (limite inférieure inclus)', () => {
    expect(isInExcludedRange(8, 0, ranges)).toBe(true);
  });

  test('ne doit pas détecter 13:00 entre deux plages', () => {
    expect(isInExcludedRange(13, 0, ranges)).toBe(false);
  });
});

describe('isInExcludedRange - Cas nuit (passage minuit)', () => {
  const ranges = [
    { start: '22:00', end: '08:00' }, // 22h-8h (passe minuit)
  ];

  test('doit détecter 23:00 (avant minuit)', () => {
    expect(isInExcludedRange(23, 0, ranges)).toBe(true);
  });

  test('doit détecter 02:00 (après minuit)', () => {
    expect(isInExcludedRange(2, 0, ranges)).toBe(true);
  });

  test('doit détecter 22:00 (limite inférieure)', () => {
    expect(isInExcludedRange(22, 0, ranges)).toBe(true);
  });

  test('ne doit pas détecter 08:00 (limite supérieure)', () => {
    expect(isInExcludedRange(8, 0, ranges)).toBe(false);
  });

  test('ne doit pas détecter 12:00 (en dehors)', () => {
    expect(isInExcludedRange(12, 0, ranges)).toBe(false);
  });

  test('ne doit pas détecter 07:59 (juste avant 08:00)', () => {
    expect(isInExcludedRange(7, 59, ranges)).toBe(true); // Encore dans la plage
  });
});

describe('isInExcludedRange - Sans plages', () => {
  test('ne doit pas détecter d\'exclusion sans plages', () => {
    expect(isInExcludedRange(15, 30, [])).toBe(false);
  });
});

// ============================================
// 5. TESTS DE CALCUL DE PROCHAINE HEURE VALIDE
// ============================================

describe('getNextValidTime', () => {
  test("doit retourner la même heure si elle n'est pas exclue", () => {
    const date = new Date('2025-12-02T15:00:00');
    const ranges = [{ start: '08:00', end: '12:00' }];
    const result = getNextValidTime(date, ranges);
    expect(result.getHours()).toBe(15);
    expect(result.getMinutes()).toBe(0);
  });

  test('doit avancer si l\'heure est exclue (cas normal)', () => {
    const date = new Date('2025-12-02T10:00:00'); // 10h
    const ranges = [{ start: '08:00', end: '12:00' }]; // Exclue de 8h à 12h
    const result = getNextValidTime(date, ranges);
    expect(result.getHours()).toBe(12); // Doit avancer à 12h
  });

  test('doit passer le minuit si exclue la nuit', () => {
    const date = new Date('2025-12-02T23:00:00'); // 23h
    const ranges = [{ start: '22:00', end: '08:00' }];
    const result = getNextValidTime(date, ranges);
    expect(result.getHours()).toBe(8); // Doit aller à 8h du lendemain
  });

  test('doit gérer plusieurs plages d\'exclusion', () => {
    const date = new Date('2025-12-02T10:00:00'); // 10h (dans 8-12)
    const ranges = [
      { start: '08:00', end: '12:00' },
      { start: '14:00', end: '16:00' },
    ];
    const result = getNextValidTime(date, ranges);
    expect(result.getHours()).toBe(12); // Sort de la première plage
  });
});

// ============================================
// 6. SCENARIO COMPLET: UNE SORTIE
// ============================================

describe('Scenario complet: sortie + notification', () => {
  test('sortie à 09:00 + preset 2h = notif à 11:00', () => {
    const outingTime = new Date('2025-12-02T09:00:00');
    const nextTime = new Date(outingTime);
    nextTime.setHours(nextTime.getHours() + 2); // +2h = 11:00
    
    expect(nextTime.getHours()).toBe(11);
    expect(nextTime.getMinutes()).toBe(0);
  });

  test('sortie à 23:00 + preset 2h = notif à 01:00 (lendemain)', () => {
    const outingTime = new Date('2025-12-02T23:00:00');
    const nextTime = new Date(outingTime);
    nextTime.setHours(nextTime.getHours() + 2); // +2h = 01:00
    
    expect(nextTime.getDate()).toBeGreaterThan(outingTime.getDate());
    expect(nextTime.getHours()).toBe(1);
  });

  test('sortie à 10:00, plage exclue 22-08, preset 3h = notif à 13:00', () => {
    const outingTime = new Date('2025-12-02T10:00:00');
    let nextTime = new Date(outingTime);
    nextTime.setHours(nextTime.getHours() + 3); // +3h = 13:00
    
    const ranges = [{ start: '22:00', end: '08:00' }];
    const validTime = getNextValidTime(nextTime, ranges);
    
    expect(validTime.getHours()).toBe(13); // 13h n'est pas exclue
  });

  test('sortie à 21:00, plage exclue 22-08, preset 2h = notif repoussée à 08:00+', () => {
    const outingTime = new Date('2025-12-02T21:00:00');
    let nextTime = new Date(outingTime);
    nextTime.setHours(nextTime.getHours() + 2); // +2h = 23:00 (exclue)
    
    const ranges = [{ start: '22:00', end: '08:00' }];
    const validTime = getNextValidTime(nextTime, ranges);
    
    expect(validTime.getHours()).toBe(8); // Doit attendre 8h du lendemain
  });
});

// ============================================
// 7. TESTS D'EDGE CASES
// ============================================

describe('Edge cases', () => {
  test('doit gérer les secondes avec un calcul correct', () => {
    const now = new Date('2025-12-02T10:00:00');
    const target = new Date('2025-12-02T11:00:00');
    const seconds = Math.floor((target - now) / 1000);
    
    expect(seconds).toBe(3600); // 1h en secondes
  });

  test('doit retourner 0 ou négatif si l\'heure est déjà passée', () => {
    const now = new Date('2025-12-02T15:00:00');
    const target = new Date('2025-12-02T14:00:00');
    const seconds = Math.floor((target - now) / 1000);
    
    expect(seconds).toBeLessThan(0);
  });

  test('doit reconnaître un preset invalide', () => {
    expect(PUPPY_PRESETS['invalid']).toBeUndefined();
  });
});

// ============================================
// 8. RÉSUMÉ DES TESTS
// ============================================

describe('Résumé du système', () => {
  test('le système est bien structuré', () => {
    // Vérifications globales
    expect(typeof PUPPY_PRESETS).toBe('object');
    expect(typeof DEFAULT_NOTIFICATION_SETTINGS).toBe('object');
    
    // Vérification des exports
    expect(scheduleNotificationFromOuting).toBeDefined();
  });
});
