import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../constants/Theme";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CATEGORIES = [
  { id: "all",    label: "All",    icon: "apps-outline" },
  { id: "people", label: "People", icon: "people-outline" },
  { id: "events", label: "Events", icon: "calendar-outline" },
  { id: "clubs",  label: "Clubs",  icon: "shield-outline" },
  { id: "places", label: "Places", icon: "location-outline" },
];

// Color scheme per type
const TYPE_COLORS = {
  people: { bg: THEME.accentMuted,  border: THEME.accentBorder, color: THEME.accentLight },
  events: { bg: THEME.liveMuted,    border: THEME.liveBorder,   color: THEME.live },
  clubs:  { bg: THEME.warmMuted,    border: THEME.warmBorder,   color: THEME.warm },
  places: { bg: THEME.energyMuted,  border: THEME.energyBorder, color: "#FF7BC5" },
};

function ResultCard({ item }) {
  const tc = TYPE_COLORS[item.type] || TYPE_COLORS.people;

  return (
    <TouchableOpacity style={sStyles.card} activeOpacity={0.8}>
      {/* Avatar / icon */}
      <View style={[sStyles.avatar, { backgroundColor: tc.bg, borderColor: tc.border }]}>
        {item.type === "people" ? (
          <Text style={[sStyles.avatarText, { color: tc.color }]}>
            {item.name?.charAt(0)?.toUpperCase() || "?"}
          </Text>
        ) : (
          <Text style={{ fontSize: 22 }}>{item.tag || item.emoji || "📍"}</Text>
        )}
      </View>

      {/* Info */}
      <View style={sStyles.info}>
        <Text style={sStyles.name}>{item.name}</Text>
        {item.type === "people" && (
          <>
            <Text style={sStyles.sub}>{item.dept || "Amity University"}</Text>
            {item.vibes?.length > 0 && (
              <View style={sStyles.vibeRow}>
                {item.vibes.slice(0, 2).map((v, i) => (
                  <View key={i} style={sStyles.vibeChip}>
                    <Text style={sStyles.vibeChipText}>{v}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
        {item.type === "events" && (
          <>
            <Text style={sStyles.sub}>📍 {item.location || "Campus"}</Text>
            <Text style={[sStyles.sub, { color: THEME.accent, fontSize: 11, marginTop: 2 }]}>{item.time}</Text>
          </>
        )}
        {item.type === "clubs"  && <Text style={sStyles.sub}>{item.members || 0} members</Text>}
        {item.type === "places" && <Text style={sStyles.sub}>{item.desc}</Text>}
      </View>

      {/* Action button */}
      {item.type === "people" && (
        <TouchableOpacity style={[sStyles.actionBtn, { borderColor: tc.border }]}>
          <Ionicons name="person-add-outline" size={15} color={tc.color} />
        </TouchableOpacity>
      )}
      {item.type === "clubs" && (
        <TouchableOpacity style={[sStyles.actionBtn, { borderColor: tc.border }]}>
          <Ionicons name="add" size={15} color={tc.color} />
        </TouchableOpacity>
      )}
      {item.type === "events" && (
        <View style={[sStyles.badge, { backgroundColor: tc.bg, borderColor: tc.border }]}>
          <Ionicons name="people" size={11} color={tc.color} />
          <Text style={[sStyles.badgeText, { color: tc.color }]}>{item.attendees || 0}</Text>
        </View>
      )}
      {item.type === "places" && (
        <View style={[sStyles.badge, { backgroundColor: tc.bg, borderColor: tc.border }]}>
          <Ionicons name="navigate-outline" size={11} color={tc.color} />
          <Text style={[sStyles.badgeText, { color: tc.color }]}>{item.distance}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [searchText,      setSearchText]      = useState("");
  const [activeCategory,  setActiveCategory]  = useState("all");
  const [loading,         setLoading]         = useState(false);
  const [results,         setResults]         = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cols = activeCategory === "all"
          ? ["users", "Events", "Clubs", "Places"]
          : [activeCategory === "people" ? "users" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)];

        const snaps = await Promise.all(cols.map((c) => getDocs(collection(db, c))));
        const data  = snaps.flatMap((snap, i) =>
          snap.docs.map((d) => ({
            id: d.id,
            type: cols[i] === "users" ? "people" : cols[i].toLowerCase(),
            ...d.data(),
          }))
        );
        setResults(data);
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [activeCategory]);

  const filtered = searchText.trim()
    ? results.filter((r) => r.name?.toLowerCase().includes(searchText.toLowerCase()))
    : results;

  return (
    <SafeAreaView style={sStyles.container}>
      <View style={sStyles.inner}>

        <Text style={sStyles.title}>Discover</Text>

        {/* Search bar */}
        <View style={sStyles.searchBar}>
          <Ionicons name="search" size={18} color={THEME.textTertiary} />
          <TextInput
            style={sStyles.searchInput}
            placeholder="Search people, events, clubs..."
            placeholderTextColor={THEME.textTertiary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={18} color={THEME.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 48, marginBottom: THEME.space.xl }}
          contentContainerStyle={{ gap: 8 }}
          renderItem={({ item }) => {
            const active = activeCategory === item.id;
            return (
              <TouchableOpacity
                onPress={() => setActiveCategory(item.id)}
                activeOpacity={0.8}
              >
                {active ? (
                  <LinearGradient colors={THEME.gradientAccent} style={sStyles.chipActive}>
                    <Ionicons name={item.icon} size={13} color="#fff" />
                    <Text style={sStyles.chipTextActive}>{item.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={sStyles.chip}>
                    <Ionicons name={item.icon} size={13} color={THEME.textTertiary} />
                    <Text style={sStyles.chipText}>{item.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {loading ? (
          <ActivityIndicator color={THEME.accent} size="large" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={filtered}
            renderItem={({ item }) => <ResultCard item={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, gap: 10 }}
            ListEmptyComponent={() => (
              <View style={sStyles.empty}>
                <Text style={{ fontSize: 48 }}>🔍</Text>
                <Text style={sStyles.emptyTitle}>No results</Text>
                <Text style={sStyles.emptySub}>Try a different search or category</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const sStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  inner:     { flex: 1, paddingHorizontal: THEME.space.xl },
  title:     { fontSize: THEME.font.display, fontWeight: THEME.font.black, color: THEME.textPrimary, letterSpacing: -0.8, marginTop: THEME.space.xxl, marginBottom: THEME.space.xl },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, borderRadius: THEME.radius.xl, paddingHorizontal: THEME.space.lg, paddingVertical: 13, marginBottom: THEME.space.lg, gap: 10 },
  searchInput: { flex: 1, color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.medium },
  chip:       { flexDirection: "row", alignItems: "center", backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, borderRadius: THEME.radius.pill, paddingHorizontal: 14, paddingVertical: 9, gap: 6 },
  chipText:   { color: THEME.textTertiary, fontSize: THEME.font.sm, fontWeight: THEME.font.semibold },
  chipActive: { flexDirection: "row", alignItems: "center", borderRadius: THEME.radius.pill, paddingHorizontal: 14, paddingVertical: 9, gap: 6 },
  chipTextActive: { color: "#fff", fontSize: THEME.font.sm, fontWeight: THEME.font.bold },
  card:       { flexDirection: "row", alignItems: "center", backgroundColor: THEME.surface, borderRadius: THEME.radius.xl, padding: THEME.space.lg, borderWidth: 1, borderColor: THEME.border },
  avatar:     { width: 50, height: 50, borderRadius: THEME.radius.lg, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  avatarText: { fontSize: 20, fontWeight: THEME.font.black },
  info:       { flex: 1, marginLeft: 14 },
  name:       { color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.bold },
  sub:        { color: THEME.textTertiary, fontSize: THEME.font.xs, marginTop: 3 },
  vibeRow:    { flexDirection: "row", gap: 6, marginTop: 6 },
  vibeChip:   { backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  vibeChipText: { color: THEME.textTertiary, fontSize: 11 },
  actionBtn:  { width: 34, height: 34, borderRadius: THEME.radius.md, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  badge:      { flexDirection: "row", alignItems: "center", borderRadius: THEME.radius.md, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, gap: 4 },
  badgeText:  { fontSize: 11, fontWeight: THEME.font.bold },
  empty:      { alignItems: "center", paddingTop: 80, gap: 10 },
  emptyTitle: { fontSize: THEME.font.lg, fontWeight: THEME.font.bold, color: THEME.textTertiary },
  emptySub:   { fontSize: THEME.font.sm, color: THEME.textDisabled, textAlign: "center" },
});