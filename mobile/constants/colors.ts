/**
 * Design System — Coral & Charcoal Fitness Theme
 * Matches the reference screenshot:
 * - Soft light background canvas (#F8F9FA)
 * - Deep Charcoal Black cards (#1C1C1E)
 * - Vibrant Warm Coral / Red-Orange accents (#FA5A47 / #FF5757)
 */

export const Colors = {
  // Brand & Accent
  primary: '#FA5A47',
  primaryDark: '#E04130',
  primaryLight: '#FF7463',
  primarySubtle: 'rgba(250, 90, 71, 0.12)',
  accentCoral: '#FA5A47',
  accentGreen: '#10B981',

  // Canvas & Light Surfaces
  canvas: '#F7F8FA',
  white: '#FFFFFF',
  cardLight: '#FFFFFF',
  chipBg: '#ECEEF2',
  chipBgActive: '#FA5A47',
  chipText: '#374151',
  chipTextActive: '#FFFFFF',

  // Dark Cards & Overlays (for Active Plan card, Detail screen, Floating Tab bar)
  darkBg: '#121214',
  darkCard: '#1C1C1E',
  darkElevated: '#252528',
  darkInput: '#2A2A2E',
  darkPill: '#28282C',
  tabBarBg: '#161618',

  // Backwards compatibility mappings for existing screens
  bgPrimary: '#121214',
  bgSecondary: '#1C1C1E',
  bgElevated: '#252528',
  bgCard: '#1C1C1E',
  bgInput: '#28282C',

  // Typography
  textPrimary: '#111216',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textLight: '#FFFFFF',
  textLightSecondary: '#A1A1AA',
  textLightMuted: '#71717A',
  textAccent: '#FA5A47',

  // Gradients
  gradientCoral: ['#FA5A47', '#FF705E'] as const,
  gradientDarkCard: ['#222226', '#171719'] as const,
  gradientDarkBg: ['#1C1C1F', '#121214'] as const,
  gradientGreen: ['#10B981', '#059669'] as const,
  gradientPurple: ['#FA5A47', '#FF705E'] as const, // remapped to theme

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#E5E7EB',
  borderDark: '#2E2E32',
  borderLight: '#F3F4F6',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.65)',
  overlayLight: 'rgba(255, 255, 255, 0.08)',
};

export default Colors;
