import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Easing, Dimensions, StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../constants/Theme";
import { GlobalStyles } from "../constants/Color";

const { width, height } = Dimensions.get("window");

export default function LandingScreen({ onGoSignup, onGoLogin }) {
  // Staggered entrance animations
  const fadeTop    = useRef(new Animated.Value(0)).current;
  const fadeMiddle = useRef(new Animated.Value(0)).current;
  const fadeBottom = useRef(new Animated.Value(0)).current;
  const slideY     = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTop, {
        toValue: 1, duration: 700, useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeMiddle, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideY,     { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(fadeBottom, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── Ambient glow blobs (decorative) ── */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      {/* ── Top badge ── */}
      <Animated.View style={[styles.topBadge, { opacity: fadeTop }]}>
        <View style={styles.badgeDot} />
        <Text style={styles.badgeText}>AMITY GREATER NOIDA</Text>
      </Animated.View>

      {/* ── Hero text ── */}
      <Animated.View style={[styles.heroContainer, { opacity: fadeMiddle, transform: [{ translateY: slideY }] }]}>
        <Text style={styles.heroLine1}>Connect with</Text>
        <Text style={styles.heroLine2}>your campus</Text>

        {/* Gradient accent word */}
        <LinearGradient
          colors={THEME.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientWord}
        >
          <Text style={styles.heroLine3}>community.</Text>
        </LinearGradient>

        <Text style={styles.subHero}>
          Find friends nearby, discover events, join{"\n"}campus circles — all in one place.
        </Text>

        {/* Feature chips row */}
        <View style={styles.chips}>
          {["📍 Live Map", "🎯 Your Vibes", "💬 Connect"].map((chip) => (
            <View key={chip} style={styles.chip}>
              <Text style={styles.chipText}>{chip}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* ── CTA buttons ── */}
      <Animated.View style={[styles.ctaContainer, { opacity: fadeBottom }]}>
        <TouchableOpacity onPress={onGoSignup} activeOpacity={0.85}>
          <LinearGradient
            colors={THEME.gradientAccent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Join the Community</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={onGoLogin} style={styles.ghostBtn} activeOpacity={0.7}>
          <Text style={styles.ghostBtnText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          By joining, you agree to keep campus vibes respectful ✌️
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: THEME.space.xl,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  // Ambient glow — purely decorative circles with very low opacity
  blob: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.10,
  },
  blobTop: {
    width: 300,
    height: 300,
    backgroundColor: THEME.accent,
    top: -100,
    right: -80,
  },
  blobBottom: {
    width: 250,
    height: 250,
    backgroundColor: THEME.energy,
    bottom: 100,
    left: -80,
  },

  // Top status badge
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: THEME.glass,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: THEME.live,
    marginRight: 8,
  },
  badgeText: {
    color: THEME.textTertiary,
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    letterSpacing: 1.5,
  },

  // Hero
  heroContainer: { flex: 1, justifyContent: "center", marginTop: 32 },
  heroLine1: {
    fontSize: 42,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -1,
    lineHeight: 50,
  },
  heroLine2: {
    fontSize: 42,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -1,
    lineHeight: 50,
  },
  gradientWord: {
    borderRadius: 4,
    alignSelf: "flex-start",
    marginTop: -4,
  },
  heroLine3: {
    fontSize: 42,
    fontWeight: THEME.font.black,
    color: "#fff",
    letterSpacing: -1,
    lineHeight: 54,
    paddingRight: 8,
  },
  subHero: {
    fontSize: THEME.font.md,
    color: THEME.textTertiary,
    lineHeight: 24,
    marginTop: THEME.space.xl,
  },

  // Feature chips
  chips: {
    flexDirection: "row",
    gap: 8,
    marginTop: THEME.space.xl,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: THEME.glass,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    color: THEME.textSecondary,
    fontSize: THEME.font.sm,
    fontWeight: THEME.font.medium,
  },

  // CTAs
  ctaContainer: { marginTop: THEME.space.xxxl },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: THEME.radius.pill,
    paddingVertical: 17,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: THEME.font.md,
    fontWeight: THEME.font.bold,
    letterSpacing: 0.3,
  },
  ghostBtn: {
    paddingVertical: 16,
    alignItems: "center",
    marginTop: THEME.space.md,
  },
  ghostBtnText: {
    color: THEME.accent,
    fontSize: THEME.font.md,
    fontWeight: THEME.font.semibold,
  },
  legalText: {
    color: THEME.textDisabled,
    fontSize: THEME.font.xs,
    textAlign: "center",
    marginTop: THEME.space.lg,
    lineHeight: 18,
  },
});