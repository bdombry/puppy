/**
 * Configuration et constantes métier
 */

// ===== PÉRIODES D'ANALYSE =====
export const PERIODS = [
  { id: '1w', label: '7 jours' },
  { id: '1m', label: '1 mois' },
  { id: '3m', label: '3 mois' },
  { id: '6m', label: '6 mois' },
  { id: 'all', label: 'Total' },
];

// ===== JOURS DE LA SEMAINE =====
export const DAY_NAMES = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];
export const DAY_NAMES_FULL = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// ===== EMOJIS =====
export const EMOJI = {
  dog: '🐶',
  walk: '🌳',
  incident: '⚠️',
  success: '✅',
  home: '🏠',
  calendar: '📅',
  analytics: '📈',
  history: '📝',
  settings: '⚙️',
  gear: '⚙️',
  trash: '🗑️',
  timer: '⏱️',
  fire: '🔥',
  sparkle: '✨',
  treat: '🍬',
  wave: '👋',
  warning: '⚠️',
  medal: '🏅',
  party: '🎉',
  arrow: '→',
  arrowBack: '←',
  check: '✓',
  water: '💧',
  poop: '💩',
  apple: '🍎',
  google: '🔵',
  email: '✉️',
  map: '🗺️',
  pin: '📍',
  distance: '📏',
  clock: '🕐',
  chart: '📊',
};

// ===== TEMPS ENTRE RAFRAÎCHISSEMENTS =====
export const REFRESH_INTERVALS = {
  timer: 10000, // 10 secondes pour le timer "dernière sortie"
  data: 30000, // 30 secondes pour les données
};

// ===== MODE DE STREAK =====
export const STREAK_MODES = {
  ACTIVITY: 'activity',
  CLEAN: 'clean',
};

// ===== TYPES D'ÉVÉNEMENTS =====
export const EVENT_TYPES = {
  WALK: 'walk',
  INCIDENT: 'incident',
};

// ===== TYPES DE BESOINS =====
export const NEED_TYPES = {
  PEE: 'pee',
  POOP: 'poop',
};

// ===== LOCALISATION =====
export const LOCATIONS = {
  OUTSIDE: 'outside',
  INSIDE: 'inside',
};
