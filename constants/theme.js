/**
 * Theme centralisé pour toute l'app
 * Couleurs, espacements, typographies
 */

// ===== COULEURS =====
export const colors = {
  // Primaire (PupyTracker - Blue)
  primary: '#3B82F6',
  primaryLight: '#EFF6FF',
  primaryLighter: '#DBEAFE',
  primaryDark: '#1D4ED8',

  // Succès (Vert)
  success: '#10b981',
  successLight: '#d1fae5',
  successLighter: '#a7f3d0',
  successDark: '#059669',

  // Erreur (Rouge)
  error: '#ef4444',
  errorLight: '#fee2e2',
  errorLighter: '#fecaca',
  errorDark: '#dc2626',

  // Danger (Rouge doux pour incidents)
  danger: '#f87171',

  // Warning (Amber)
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  warningLighter: '#fde68a',
  warningDark: '#d97706',

  // Info (Bleu)
  info: '#3b82f6',
  infoLight: '#eff6ff',
  infoLighter: '#dbeafe',
  infoDark: '#1d4ed8',

  // Purple
  purple: '#8b5cf6',
  purpleLight: '#faf5ff',
  purpleLighter: '#e9d5ff',
  purpleDark: '#7c3aed',

  // Neutre
  white: '#F4F1EC',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray150: '#fafafa',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // PupyTracker Custom
  pupyBackground: '#ffffff',
  pupyAccent: '#A8C7D8',
  pupyPremium: '#D6B26E',
  pupyTextPrimary: '#2E2E2E',
  pupyTextSecondary: '#7A7A7A',

  // Alias
  text: '#2E2E2E',
  textSecondary: '#7A7A7A',
  textTertiary: '#9ca3af',
  border: '#f3f4f6',
  background: '#F4F1EC',
  card: '#F4F1EC',
};

// ===== TYPOGRAPHIES =====
export const typography = {
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 17,
    xxl: 20,
    xxxl: 24,
    huge: 32,
    massive: 64,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// ===== ESPACEMENTS =====
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

// ===== BORDER RADIUS =====
export const borderRadius = {
  sm: 6,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 32,
  full: 9999,
};

// ===== SHADOWS =====
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
};

// ===== EXPORT OBJECT THEME =====
export const theme = {
  colors,
  typography: {
    size: typography.sizes,
    weight: typography.weights,
  },
  spacing,
  borderRadius,
  shadows,
};
