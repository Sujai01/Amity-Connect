// ============================================================
// AMITY CONNECT — DESIGN SYSTEM v2.0
// "Deep Space Campus" — Spotify depth × Discord energy × Opera refinement
//
// HOW THIS FILE WORKS:
// Every color, spacing, and style token lives here.
// All screens import from this file — change one value here
// and it ripples across the entire app instantly.
// ============================================================

export const THEME = {

  // ----------------------------------------------------------
  // BACKGROUNDS
  // The blue-tinted near-black is the Spotify/Discord trick.
  // Pure #000 looks cheap on OLED. #0A0A0F feels premium.
  // ----------------------------------------------------------
  background:    '#0A0A0F',   // Base canvas — every screen's bg
  surface:       '#111118',   // Cards, modals, bottom sheets
  surfaceHigh:   '#1A1A2E',   // Elevated cards, selected states
  overlay:       'rgba(10, 10, 15, 0.85)', // Modal backdrops

  // ----------------------------------------------------------
  // GLASS MORPHISM LAYERS
  // Use these for floating cards, tab bars, headers that sit
  // over content. The key is: light fill + light border.
  // ----------------------------------------------------------
  glass:         'rgba(255, 255, 255, 0.06)',  // Glass card fill
  glassBorder:   'rgba(255, 255, 255, 0.10)',  // Glass card border
  glassStrong:   'rgba(255, 255, 255, 0.12)',  // Hovered glass
  glassDark:     'rgba(10, 10, 15, 0.80)',     // Dark glass (tab bar)

  // ----------------------------------------------------------
  // ACCENT COLORS — the identity of the app
  // Primary: Indigo-Violet (replaces flat blue — this is what
  // makes it feel premium instead of "Bootstrap blue")
  // ----------------------------------------------------------
  accent:        '#5B5FFF',   // Primary CTA, active states, links
  accentLight:   '#9B6DFF',   // Gradient end, softer accent uses
  accentMuted:   'rgba(91, 95, 255, 0.15)',  // Accent bg tint
  accentBorder:  'rgba(91, 95, 255, 0.30)',  // Accent borders

  // Energy color — likes, notifications, online dots
  energy:        '#FF2D95',   // Hot pink — "vibe" color
  energyMuted:   'rgba(255, 45, 149, 0.15)',
  energyBorder:  'rgba(255, 45, 149, 0.30)',

  // Status color — online, live, success
  live:          '#00D4AA',   // Teal-green — fresher than old #10B981
  liveMuted:     'rgba(0, 212, 170, 0.15)',
  liveBorder:    'rgba(0, 212, 170, 0.30)',

  // Warm color — events, highlights, badges, campus moments
  warm:          '#F59E0B',   // Amber
  warmMuted:     'rgba(245, 158, 11, 0.15)',
  warmBorder:    'rgba(245, 158, 11, 0.30)',

  // Danger — delete, errors
  danger:        '#FF4444',
  dangerMuted:   'rgba(255, 68, 68, 0.12)',

  // ----------------------------------------------------------
  // GRADIENTS
  // React Native doesn't support CSS gradients natively —
  // use expo-linear-gradient with these arrays.
  // For text gradients, use MaskedView (see screens).
  // ----------------------------------------------------------
  gradientAccent:   ['#5B5FFF', '#9B6DFF'],  // Primary gradient
  gradientEnergy:   ['#FF2D95', '#FF6B6B'],  // Like / energy gradient
  gradientFresh:    ['#00D4AA', '#0EA5E9'],  // Live / success gradient
  gradientWarm:     ['#F59E0B', '#FF6B35'],  // Campus / events gradient
  gradientDark:     ['#0A0A0F', '#1A1A2E'],  // Subtle bg gradient
  gradientAvatar:   ['#5B5FFF', '#FF2D95'],  // User avatar gradient

  // ----------------------------------------------------------
  // TYPOGRAPHY
  // Text hierarchy: 4 levels.
  // The opacity-based system (not separate hex values) ensures
  // dark mode works automatically.
  // ----------------------------------------------------------
  textPrimary:   '#FFFFFF',                  // Headlines, names
  textSecondary: 'rgba(255, 255, 255, 0.65)', // Body text, descriptions
  textTertiary:  'rgba(255, 255, 255, 0.35)', // Placeholders, meta
  textDisabled:  'rgba(255, 255, 255, 0.20)', // Disabled states

  // ----------------------------------------------------------
  // BORDERS
  // Ultra-thin — 0.5px to 1px only. Thicker = cheaper look.
  // ----------------------------------------------------------
  border:        'rgba(255, 255, 255, 0.08)',  // Default card border
  borderStrong:  'rgba(255, 255, 255, 0.15)',  // Focused input border
  borderAccent:  'rgba(91, 95, 255, 0.40)',    // Accent-colored border

  // ----------------------------------------------------------
  // SPACING SCALE
  // Consistent spacing = what separates amateur from pro.
  // Use these values everywhere — don't hardcode random px.
  // ----------------------------------------------------------
  space: {
    xs:   4,
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  24,
    xxxl: 32,
  },

  // ----------------------------------------------------------
  // BORDER RADIUS SCALE
  // Large radii = modern, youthful (Discord/Spotify style)
  // ----------------------------------------------------------
  radius: {
    sm:   8,
    md:   12,
    lg:   16,
    xl:   20,
    xxl:  24,
    pill: 999,  // For tags, badges, status pills
  },

  // ----------------------------------------------------------
  // TYPOGRAPHY SCALE
  // fontWeight as string — RN requires this
  // ----------------------------------------------------------
  font: {
    // Sizes
    xs:      11,
    sm:      13,
    md:      15,
    lg:      17,
    xl:      20,
    xxl:     24,
    display: 28,
    hero:    36,

    // Weights (must be strings in React Native)
    regular:   '400',
    medium:    '500',
    semibold:  '600',
    bold:      '700',
    extrabold: '800',
    black:     '900',
  },

  // ----------------------------------------------------------
  // SHADOWS
  // React Native shadow props (iOS) + elevation (Android)
  // ----------------------------------------------------------
  shadowSm: {
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  shadowMd: {
    shadowColor: '#5B5FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 16,
    elevation: 6,
  },
  shadowLg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.40,
    shadowRadius: 24,
    elevation: 10,
  },
};

// ============================================================
// SEMANTIC ALIASES
// Use these in your components so intent is clear.
// "THEME.card.bg" reads better than "THEME.surface".
// ============================================================
export const SEMANTIC = {
  card: {
    bg:           THEME.surface,
    border:       THEME.border,
    radius:       THEME.radius.xl,
    padding:      THEME.space.xl,
  },
  glassCard: {
    bg:           THEME.glass,
    border:       THEME.glassBorder,
    radius:       THEME.radius.xl,
    padding:      THEME.space.xl,
  },
  tabBar: {
    bg:           THEME.glassDark,
    border:       THEME.glassBorder,
    radius:       THEME.radius.pill,
    activeColor:  THEME.accent,
    inactiveColor:'rgba(255, 255, 255, 0.30)',
  },
  input: {
    bg:           'rgba(255, 255, 255, 0.05)',
    border:       THEME.border,
    focusBorder:  THEME.borderAccent,
    radius:       THEME.radius.lg,
    placeholder:  THEME.textTertiary,
    text:         THEME.textPrimary,
  },
  button: {
    primary: {
      bg:         THEME.gradientAccent,  // Use with LinearGradient
      text:       '#FFFFFF',
      radius:     THEME.radius.pill,
    },
    ghost: {
      bg:         'transparent',
      border:     THEME.accentBorder,
      text:       THEME.accent,
      radius:     THEME.radius.pill,
    },
    danger: {
      bg:         THEME.dangerMuted,
      text:       THEME.danger,
      radius:     THEME.radius.lg,
    },
  },
};

// ============================================================
// HIGHLIGHT CARD COLORS
// Used in HomeScreen highlights section.
// Each has bg, icon color, and border.
// ============================================================
export const HIGHLIGHT_COLORS = {
  blog:  { bg: THEME.accentMuted,  border: THEME.accentBorder,  color: THEME.accentLight },
  event: { bg: THEME.liveMuted,    border: THEME.liveBorder,    color: THEME.live },
  meme:  { bg: THEME.warmMuted,    border: THEME.warmBorder,    color: THEME.warm },
  news:  { bg: THEME.energyMuted,  border: THEME.energyBorder,  color: THEME.energy },
};

// ============================================================
// VIBE TAG COLORS
// Rotate through these for the interest tags on VibeScreen
// and ProfileScreen so they don't all look the same.
// ============================================================
export const VIBE_COLORS = [
  { bg: THEME.accentMuted,  border: THEME.accentBorder,  text: THEME.accentLight },
  { bg: THEME.energyMuted,  border: THEME.energyBorder,  text: '#FF7BC5' },
  { bg: THEME.liveMuted,    border: THEME.liveBorder,    text: THEME.live },
  { bg: THEME.warmMuted,    border: THEME.warmBorder,    text: THEME.warm },
];