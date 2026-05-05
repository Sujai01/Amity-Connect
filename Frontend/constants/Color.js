// ============================================================
// AMITY CONNECT — GLOBAL STYLES v2.0
// All reusable StyleSheet objects live here.
//
// HOW THIS FILE WORKS:
// Think of this as your shared CSS file. Instead of writing
// the same button style in every screen, you import it from
// here. Screens only define what's unique to themselves.
//
// WHAT "StyleSheet.create" DOES:
// It's React Native's version of CSS classes. It validates
// your styles at startup and optimizes them for performance.
// The result is an object where each key is a style "class".
// ============================================================

import { StyleSheet, Platform, Dimensions } from 'react-native';
import { THEME } from './Theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================================
// COLORS — flat export for quick access
// ============================================================
export const COLORS = {
  background:  THEME.background,
  surface:     THEME.surface,
  accent:      THEME.accent,
  accentLight: THEME.accentLight,
  energy:      THEME.energy,
  live:        THEME.live,
  warm:        THEME.warm,
  danger:      THEME.danger,
  textPrimary: THEME.textPrimary,
  textSub:     THEME.textSecondary,
  textMuted:   THEME.textTertiary,
  border:      THEME.border,
};

// ============================================================
// GLOBAL STYLES
// These are the building blocks every screen uses.
// ============================================================
export const GlobalStyles = StyleSheet.create({

  // --- LAYOUT ---
  // The base container for every screen
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },

  // Safe scroll container (adds padding for Android status bar)
  safeContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
  },

  // Standard horizontal padding for screen content
  screenPadding: {
    paddingHorizontal: THEME.space.xl,
  },

  // --- CARDS ---
  // Standard dark card (feed posts, settings rows)
  card: {
    backgroundColor: THEME.surface,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: THEME.space.xl,
  },

  // Glass morphism card (floating UI, tab bar, overlays)
  // IMPORTANT: On Android, borderRadius must be set on the
  // same view as overflow:hidden. Blur only works on iOS via
  // expo-blur. On Android, glass = semi-transparent bg.
  glassCard: {
    backgroundColor: THEME.glass,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    padding: THEME.space.xl,
    overflow: 'hidden',
  },

  // --- TYPOGRAPHY ---
  // Screen title (28px, very bold, tight tracking)
  screenTitle: {
    fontSize: THEME.font.display,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -0.8,
  },

  // Section heading (18px)
  sectionTitle: {
    fontSize: THEME.font.lg,
    fontWeight: THEME.font.extrabold,
    color: THEME.textPrimary,
    letterSpacing: -0.3,
    marginBottom: THEME.space.md,
  },

  // Body text (15px)
  bodyText: {
    fontSize: THEME.font.md,
    fontWeight: THEME.font.regular,
    color: THEME.textSecondary,
    lineHeight: 24,
  },

  // Muted label (11px, uppercase, high tracking — like Spotify's section labels)
  label: {
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    color: THEME.textTertiary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },

  // --- INPUTS ---
  // Wraps icon + TextInput in a row
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: THEME.radius.lg,
    paddingHorizontal: THEME.space.lg,
    paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    marginBottom: THEME.space.md,
  },

  // The actual TextInput inside inputWrapper
  inputText: {
    flex: 1,
    color: THEME.textPrimary,
    marginLeft: THEME.space.sm,
    fontSize: THEME.font.md,
    fontWeight: THEME.font.medium,
  },

  // --- BUTTONS ---
  // Primary button (use with LinearGradient as background)
  primaryButton: {
    borderRadius: THEME.radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: THEME.space.sm,
    ...THEME.shadowMd,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: THEME.font.md,
    fontWeight: THEME.font.bold,
    letterSpacing: 0.3,
  },

  // Ghost / outline button
  ghostButton: {
    borderRadius: THEME.radius.pill,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    marginTop: THEME.space.sm,
  },

  ghostButtonText: {
    color: THEME.accent,
    fontSize: THEME.font.md,
    fontWeight: THEME.font.bold,
    letterSpacing: 0.3,
  },

  // Icon-only circle button (notification bell, new chat, etc.)
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: THEME.glass,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- BADGES & PILLS ---
  // Accent-colored pill (for active filters, tags)
  pill: {
    paddingHorizontal: THEME.space.md,
    paddingVertical: THEME.space.xs,
    borderRadius: THEME.radius.pill,
    backgroundColor: THEME.accentMuted,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
  },

  pillText: {
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    color: THEME.accentLight,
  },

  // Online/live status dot
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.live,
    borderWidth: 2,
    borderColor: THEME.background,
  },

  // --- AVATARS ---
  // Gradient ring avatar container (wrap with LinearGradient)
  avatarRing: {
    padding: 2,
    borderRadius: 999,
  },

  avatarInner: {
    borderRadius: 999,
    backgroundColor: THEME.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  avatarInitial: {
    color: '#FFFFFF',
    fontWeight: THEME.font.black,
  },

  // --- DIVIDERS ---
  divider: {
    height: 1,
    backgroundColor: THEME.border,
    marginVertical: THEME.space.lg,
  },

  // --- EMPTY STATES ---
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: THEME.space.xxxl,
    paddingTop: 60,
  },

  emptyTitle: {
    fontSize: THEME.font.lg,
    fontWeight: THEME.font.bold,
    color: THEME.textSecondary,
    textAlign: 'center',
    marginTop: THEME.space.lg,
  },

  emptySubtitle: {
    fontSize: THEME.font.sm,
    color: THEME.textTertiary,
    textAlign: 'center',
    marginTop: THEME.space.sm,
    lineHeight: 20,
  },

  // --- AUTH SCREENS ---
  // Used by LoginScreen and SignupScreen
  authContainer: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    padding: THEME.space.xl,
  },

  authCard: {
    backgroundColor: THEME.surface,
    borderRadius: THEME.radius.xxl,
    padding: THEME.space.xxl,
    borderWidth: 1,
    borderColor: THEME.border,
  },

  authTitle: {
    fontSize: THEME.font.xxl,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    marginBottom: THEME.space.xs,
    letterSpacing: -0.5,
  },

  authSubtitle: {
    fontSize: THEME.font.sm,
    color: THEME.textTertiary,
    marginBottom: THEME.space.xxl,
    lineHeight: 20,
  },

  // --- SETTINGS ROWS ---
  // Used in ProfileScreen settings list
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.glass,
    padding: THEME.space.lg,
    borderRadius: THEME.radius.lg,
    marginBottom: THEME.space.sm,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
  },

  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: THEME.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: THEME.space.md,
  },

  settingsText: {
    flex: 1,
    fontSize: THEME.font.md,
    fontWeight: THEME.font.semibold,
    color: THEME.textPrimary,
  },

  // --- UTILITY ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  flex1: { flex: 1 },

  // Full screen centered loader
  loaderScreen: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================
// SCREEN_WIDTH export — use for anything that needs to be
// exactly as wide as the screen (e.g. map, full-bleed images)
// ============================================================
export { SCREEN_WIDTH };