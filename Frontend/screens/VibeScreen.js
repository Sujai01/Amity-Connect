import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Animated, StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { THEME, VIBE_COLORS } from "../constants/Theme";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const INTERESTS = [
  { id: "1",  name: "CS Major",        icon: "💻" },
  { id: "2",  name: "Coffee Addict",   icon: "☕" },
  { id: "3",  name: "Gym Rat",         icon: "🏋️" },
  { id: "4",  name: "Late Night Coder",icon: "🚀" },
  { id: "5",  name: "Anime Fan",       icon: "🎎" },
  { id: "6",  name: "Gamer",           icon: "🎮" },
  { id: "7",  name: "Photography",     icon: "📸" },
  { id: "8",  name: "Netflix Binge",   icon: "📺" },
  { id: "9",  name: "Foodie",          icon: "🍕" },
  { id: "10", name: "Music Lover",     icon: "🎧" },
  { id: "11", name: "Cricket Fan",     icon: "🏏" },
  { id: "12", name: "Book Worm",       icon: "📚" },
  { id: "13", name: "H-Block Regular", icon: "🏢" },
  { id: "14", name: "Pari Chowk Gang", icon: "🚌" },
  { id: "15", name: "Hackathon Squad", icon: "🏆" },
  { id: "16", name: "Night Owl",       icon: "🦉" },
  { id: "17", name: "Early Bird",      icon: "☀️" },
  { id: "18", name: "Designer",        icon: "🎨" },
  { id: "19", name: "Stock Market",    icon: "📈" },
  { id: "20", name: "Dorm Life",       icon: "🏠" },
];

export default function VibeScreen({ onNext }) {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  // Each tile has its own scale ref for press feedback
  const scaleRefs = useRef(INTERESTS.reduce((acc, item) => {
    acc[item.id] = new Animated.Value(1);
    return acc;
  }, {})).current;

  const toggleInterest = (name, id) => {
    // Scale bounce on tap
    Animated.sequence([
      Animated.timing(scaleRefs[id], { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleRefs[id], { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    setSelected((prev) =>
      prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
    );
  };

  const handleFinish = async () => {
    if (selected.length < 3 || saving) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { vibes: selected });
      onNext();
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const renderVibe = ({ item, index }) => {
    const isSelected  = selected.includes(item.name);
    const colorScheme = VIBE_COLORS[index % VIBE_COLORS.length];

    return (
      <Animated.View style={{ flex: 1, transform: [{ scale: scaleRefs[item.id] }] }}>
        <TouchableOpacity
          onPress={() => toggleInterest(item.name, item.id)}
          activeOpacity={0.85}
          style={[
            styles.tile,
            isSelected && {
              backgroundColor: colorScheme.bg,
              borderColor: colorScheme.border,
            },
          ]}
        >
          {/* Checkmark badge when selected */}
          {isSelected && (
            <View style={[styles.checkBadge, { backgroundColor: colorScheme.border }]}>
              <Ionicons name="checkmark" size={10} color="#fff" />
            </View>
          )}
          <Text style={styles.tileEmoji}>{item.icon}</Text>
          <Text
            style={[styles.tileName, isSelected && { color: colorScheme.text }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const canProceed = selected.length >= 3;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.stepLabel}>STEP 1 OF 1</Text>
        <Text style={styles.title}>What's your vibe?</Text>
        <Text style={styles.subtitle}>
          Pick at least 3 — we'll personalize your campus map and feed.
        </Text>

        {/* Counter pill */}
        <View style={[styles.counter, canProceed && styles.counterActive]}>
          <Text style={[styles.counterText, canProceed && { color: THEME.live }]}>
            {selected.length} selected {canProceed ? "✓" : `· need ${3 - selected.length} more`}
          </Text>
        </View>
      </View>

      {/* Grid */}
      <FlatList
        data={INTERESTS}
        renderItem={renderVibe}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 10 }}
      />

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleFinish}
          disabled={!canProceed || saving}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canProceed ? THEME.gradientAccent : ["#1A1A2E", "#1A1A2E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaBtn}
          >
            <Text style={[styles.ctaText, !canProceed && { color: THEME.textDisabled }]}>
              {saving ? "Saving..." : "Enter Amity Connect →"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    paddingHorizontal: THEME.space.xl,
    paddingTop: THEME.space.xl,
    paddingBottom: THEME.space.lg,
  },
  stepLabel: {
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    color: THEME.accent,
    letterSpacing: 2,
    marginBottom: THEME.space.sm,
  },
  title: {
    fontSize: THEME.font.display,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -0.8,
    marginBottom: THEME.space.sm,
  },
  subtitle: {
    fontSize: THEME.font.sm,
    color: THEME.textTertiary,
    lineHeight: 20,
    marginBottom: THEME.space.lg,
  },
  counter: {
    alignSelf: "flex-start",
    backgroundColor: THEME.glass,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  counterActive: {
    backgroundColor: THEME.liveMuted,
    borderColor: THEME.liveBorder,
  },
  counterText: {
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    color: THEME.textTertiary,
    letterSpacing: 0.3,
  },
  grid: {
    paddingHorizontal: THEME.space.xl,
    paddingBottom: 120,
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: THEME.radius.xl,
    paddingVertical: THEME.space.xl,
    paddingHorizontal: THEME.space.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: THEME.border,
    minHeight: 100,
    position: "relative",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: {
    fontSize: 26,
    marginBottom: THEME.space.sm,
  },
  tileName: {
    color: THEME.textSecondary,
    fontSize: THEME.font.sm,
    fontWeight: THEME.font.semibold,
    textAlign: "center",
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: THEME.space.xl,
    right: THEME.space.xl,
  },
  ctaBtn: {
    borderRadius: THEME.radius.pill,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaText: {
    color: "#fff",
    fontSize: THEME.font.md,
    fontWeight: THEME.font.bold,
    letterSpacing: 0.3,
  },
});