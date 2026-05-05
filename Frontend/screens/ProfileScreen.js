// ─────────────────────────────────────────────────────────────────────────────
// ProfileScreen.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, ActivityIndicator, Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, db } from "../firebaseConfig";
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from "firebase/firestore";
import { THEME, VIBE_COLORS } from "../constants/Theme";
import * as ImagePicker from "expo-image-picker";

const SETTINGS = [
  { icon: "notifications",  color: THEME.accent,  bg: THEME.accentMuted,  label: "Push Notifications" },
  { icon: "lock-closed",    color: THEME.live,    bg: THEME.liveMuted,    label: "Privacy & Security" },
  { icon: "color-palette",  color: "#F472B6",     bg: "rgba(244,114,182,0.12)", label: "App Theme" },
  { icon: "help-buoy",      color: THEME.warm,    bg: THEME.warmMuted,    label: "Help & Support" },
];

export default function ProfileScreen() {
  const [profile,  setProfile]  = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (snap) => {
      setProfile(snap.data());
    });
    const fetchStats = async () => {
      const snap = await getDocs(query(collection(db, "posts"), where("authorId", "==", auth.currentUser.uid)));
      setPostCount(snap.size);
      setLoading(false);
    };
    fetchStats();
    return () => unsub();
  }, []);

  const handleImagePick = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) { Alert.alert("Permission Required", "Allow photo access to set your profile picture."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.5, base64: true });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setUploading(true);
      try {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { profilePic: `data:image/jpeg;base64,${result.assets[0].base64}` });
      } catch (e) { Alert.alert("Error", "Could not update picture."); }
      setUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Ready to head out?", [
      { text: "Stay", style: "cancel" },
      { text: "Sign Out", onPress: () => auth.signOut(), style: "destructive" },
    ]);
  };

  if (loading) return <View style={Styles.loader}><ActivityIndicator color={THEME.accent} /></View>;

  return (
    <SafeAreaView style={Styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero gradient banner ── */}
        <LinearGradient colors={["rgba(91,95,255,0.15)", "transparent"]} style={Styles.banner}>
          {/* Avatar */}
          <TouchableOpacity onPress={handleImagePick} disabled={uploading} style={Styles.avatarWrap}>
            <LinearGradient colors={THEME.gradientAvatar} style={Styles.avatarRing}>
              <View style={Styles.avatarInner}>
                {uploading ? (
                  <ActivityIndicator color={THEME.accent} />
                ) : profile?.profilePic ? (
                  <Image source={{ uri: profile.profilePic }} style={{ width: "100%", height: "100%", borderRadius: 999 }} />
                ) : (
                  <Text style={Styles.avatarInitial}>{profile?.name?.charAt(0)?.toUpperCase() || "U"}</Text>
                )}
              </View>
            </LinearGradient>
            <View style={Styles.cameraBadge}>
              <Ionicons name="camera" size={10} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={Styles.name}>{profile?.name}</Text>
          <Text style={Styles.dept}>Amity University · {profile?.email?.split("@")[0]}</Text>

          <TouchableOpacity style={Styles.editBtn} onPress={() => Alert.alert("Coming Soon", "Profile editing in next update!")}>
            <Ionicons name="settings-outline" size={14} color={THEME.textSecondary} />
            <Text style={Styles.editBtnText}>Edit Identity</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Stats row ── */}
        <View style={Styles.statsRow}>
          {[
            { value: profile?.vibes?.length || 0, label: "VIBES", color: THEME.accent },
            { value: postCount,                    label: "POSTS",  color: THEME.textPrimary },
            { value: "4.9",                        label: "TRUST",  color: THEME.live },
          ].map((stat, i) => (
            <View key={i} style={[Styles.statBox, i > 0 && Styles.statBorder]}>
              <Text style={[Styles.statNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={Styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Identity tags ── */}
        {profile?.vibes?.length > 0 && (
          <View style={Styles.section}>
            <Text style={Styles.sectionLabel}>Identity Tags</Text>
            <View style={Styles.tagWrap}>
              {profile.vibes.map((vibe, i) => {
                const c = VIBE_COLORS[i % VIBE_COLORS.length];
                return (
                  <View key={i} style={[Styles.tag, { backgroundColor: c.bg, borderColor: c.border }]}>
                    <Text style={[Styles.tagText, { color: c.text }]}>{vibe}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Settings ── */}
        <View style={Styles.section}>
          <Text style={Styles.sectionLabel}>Preferences</Text>
          {SETTINGS.map((s, i) => (
            <TouchableOpacity key={i} style={Styles.settingsRow}>
              <View style={[Styles.settingsIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={Styles.settingsText}>{s.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={THEME.textDisabled} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={Styles.section}>
          <Text style={Styles.sectionLabel}>Account</Text>
          <TouchableOpacity style={Styles.settingsRow} onPress={handleLogout}>
            <View style={[Styles.settingsIcon, { backgroundColor: THEME.dangerMuted }]}>
              <Ionicons name="log-out" size={18} color={THEME.danger} />
            </View>
            <Text style={[Styles.settingsText, { color: THEME.danger }]}>Sign Out</Text>
            <Ionicons name="chevron-forward" size={18} color={THEME.textDisabled} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  loader:    { flex: 1, backgroundColor: THEME.background, justifyContent: "center", alignItems: "center" },
  banner:    { alignItems: "center", paddingTop: THEME.space.xxl, paddingBottom: THEME.space.xl, paddingHorizontal: THEME.space.xl },
  avatarWrap:    { position: "relative", marginBottom: THEME.space.lg },
  avatarRing:    { padding: 3, borderRadius: 999 },
  avatarInner:   { width: 90, height: 90, borderRadius: 45, backgroundColor: THEME.surface, justifyContent: "center", alignItems: "center", overflow: "hidden", borderWidth: 2, borderColor: THEME.background },
  avatarInitial: { color: "#fff", fontSize: 34, fontWeight: THEME.font.black },
  cameraBadge:   { position: "absolute", bottom: 2, right: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: THEME.surface, borderWidth: 2, borderColor: THEME.background, justifyContent: "center", alignItems: "center" },
  name:    { fontSize: THEME.font.xl, fontWeight: THEME.font.black, color: THEME.textPrimary, letterSpacing: -0.5, textAlign: "center" },
  dept:    { fontSize: THEME.font.sm, color: THEME.textTertiary, marginTop: 4, textAlign: "center" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.glassBorder, borderRadius: THEME.radius.pill, paddingHorizontal: 16, paddingVertical: 10, marginTop: THEME.space.lg },
  editBtnText: { color: THEME.textSecondary, fontSize: THEME.font.sm, fontWeight: THEME.font.semibold },
  statsRow:  { flexDirection: "row", marginHorizontal: THEME.space.xl, marginBottom: THEME.space.xl, backgroundColor: THEME.surface, borderRadius: THEME.radius.xl, borderWidth: 1, borderColor: THEME.border, overflow: "hidden" },
  statBox:   { flex: 1, alignItems: "center", paddingVertical: THEME.space.xl },
  statBorder:{ borderLeftWidth: 1, borderColor: THEME.border },
  statNum:   { fontSize: THEME.font.xxl, fontWeight: THEME.font.black },
  statLabel: { fontSize: 9, color: THEME.textTertiary, fontWeight: THEME.font.black, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 },
  section:   { paddingHorizontal: THEME.space.xl, marginBottom: THEME.space.xl },
  sectionLabel: { fontSize: THEME.font.xs, fontWeight: THEME.font.black, color: THEME.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: THEME.space.md },
  tagWrap:   { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag:       { paddingHorizontal: 14, paddingVertical: 7, borderRadius: THEME.radius.pill, borderWidth: 1 },
  tagText:   { fontSize: THEME.font.sm, fontWeight: THEME.font.bold },
  settingsRow:  { flexDirection: "row", alignItems: "center", backgroundColor: THEME.glass, padding: THEME.space.lg, borderRadius: THEME.radius.lg, marginBottom: THEME.space.sm, borderWidth: 1, borderColor: THEME.glassBorder },
  settingsIcon: { width: 36, height: 36, borderRadius: THEME.radius.md, justifyContent: "center", alignItems: "center", marginRight: THEME.space.md },
  settingsText: { flex: 1, color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.semibold },
});

// ─────────────────────────────────────────────────────────────────────────────
// SearchScreen.js — export individually in your project
// ─────────────────────────────────────────────────────────────────────────────
export { default as SearchScreen } from "./SearchScreen";
export { default as MessageScreen } from "./MessageScreen";
export { default as MapScreen } from "./MapScreen";// ─────────────────────────────────────────────────────────────────────────────
