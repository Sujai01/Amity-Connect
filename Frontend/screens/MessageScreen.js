import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../constants/Theme";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const FALLBACK_USERS = [
  { id: "u1", name: "Aarav Sharma",  lastMsg: "See you at H-Block!", time: "2m",  online: true,  isGroup: false },
  { id: "u2", name: "Priya Gupta",   lastMsg: "Did you get the notes?",  time: "45m", online: false, isGroup: false },
  { id: "u3", name: "Rohan Mehta",   lastMsg: "Cricket at 5?",           time: "1h",  online: true,  isGroup: false },
];
const FALLBACK_GROUPS = [
  { id: "g1", name: "Hackathon Squad",  lastMsg: "Ansh: Firebase logic done ✓", time: "1h",  tag: "💻", isGroup: true },
  { id: "g2", name: "Amity Developers", lastMsg: "Push your code to main",        time: "3h",  tag: "🚀", isGroup: true },
];

export default function MessageScreen() {
  const [activeTab, setActiveTab] = useState("Direct");
  const [users,     setUsers]     = useState([]);
  const [clubs,     setClubs]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const clubsSnap = await getDocs(collection(db, "Clubs"));
        const fetchedUsers = usersSnap.docs.map((d) => ({
          id: d.id, ...d.data(), isGroup: false,
          lastMsg: d.data().lastMsg || "Tap to chat",
          time: d.data().time || "now",
          online: d.data().online ?? Math.random() > 0.5,
        }));
        const fetchedClubs = clubsSnap.docs.map((d) => ({
          id: d.id, ...d.data(), isGroup: true,
        }));
        setUsers(fetchedUsers.length > 0 ? fetchedUsers : FALLBACK_USERS);
        setClubs(fetchedClubs.length > 0 ? fetchedClubs : FALLBACK_GROUPS);
      } catch (e) {
        setUsers(FALLBACK_USERS);
        setClubs(FALLBACK_GROUPS);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const data = (activeTab === "Direct" ? users : clubs).filter((item) =>
    !search.trim() || item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity style={mStyles.chatRow} activeOpacity={0.75}>
      {/* Avatar */}
      <View style={mStyles.avatarWrap}>
        {item.isGroup ? (
          <View style={[mStyles.avatar, { backgroundColor: THEME.accentMuted, borderColor: THEME.accentBorder }]}>
            <Text style={{ fontSize: 22 }}>{item.tag || "🛡️"}</Text>
          </View>
        ) : (
          <LinearGradient colors={THEME.gradientAvatar} style={mStyles.avatar}>
            <Text style={mStyles.avatarText}>{item.name?.charAt(0)?.toUpperCase() || "?"}</Text>
          </LinearGradient>
        )}
        {!item.isGroup && item.online && <View style={mStyles.onlineDot} />}
      </View>

      {/* Info */}
      <View style={mStyles.info}>
        <View style={mStyles.nameRow}>
          <Text style={mStyles.chatName}>{item.name}</Text>
          <Text style={mStyles.timeText}>{item.time || "now"}</Text>
        </View>
        <Text style={mStyles.lastMsg} numberOfLines={1}>
          {item.lastMsg || "Start a conversation"}
        </Text>
      </View>

      {/* Camera icon for direct chats (coming soon) */}
      {!item.isGroup && (
        <View style={mStyles.camBtn}>
          <Ionicons name="camera-outline" size={18} color={THEME.textTertiary} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={mStyles.container}>
      <View style={mStyles.inner}>

        {/* Header */}
        <View style={mStyles.header}>
          <Text style={mStyles.title}>Messages</Text>
          <TouchableOpacity style={mStyles.newBtn}>
            <Ionicons name="create-outline" size={22} color={THEME.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={mStyles.searchBar}>
          <Ionicons name="search" size={18} color={THEME.textTertiary} />
          <TextInput
            style={mStyles.searchInput}
            placeholder="Search messages..."
            placeholderTextColor={THEME.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Tabs */}
        <View style={mStyles.tabRow}>
          {["Direct", "Groups"].map((tab) => {
            const active = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[mStyles.tab, active && mStyles.tabActive]}
                onPress={() => setActiveTab(tab)}
              >
                {active ? (
                  <LinearGradient colors={THEME.gradientAccent} style={mStyles.tabGrad}>
                    <Text style={mStyles.tabTextActive}>{tab}</Text>
                  </LinearGradient>
                ) : (
                  <Text style={mStyles.tabText}>{tab}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <ActivityIndicator color={THEME.accent} size="large" style={{ marginTop: 60 }} />
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120, gap: 10 }}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", paddingTop: 60, gap: 10 }}>
                <Text style={{ fontSize: 48 }}>💬</Text>
                <Text style={mStyles.emptyTitle}>No conversations yet</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const mStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  inner:     { flex: 1, paddingHorizontal: THEME.space.xl },
  header:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: THEME.space.xl, marginBottom: THEME.space.xl },
  title:     { fontSize: THEME.font.display, fontWeight: THEME.font.black, color: THEME.textPrimary, letterSpacing: -0.8 },
  newBtn:    { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.glassBorder, justifyContent: "center", alignItems: "center" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.surface, borderWidth: 1, borderColor: THEME.border, borderRadius: THEME.radius.xl, paddingHorizontal: THEME.space.lg, paddingVertical: 13, marginBottom: THEME.space.lg, gap: 10 },
  searchInput: { flex: 1, color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.medium },
  tabRow:    { flexDirection: "row", backgroundColor: THEME.surface, borderRadius: THEME.radius.xl, padding: 5, borderWidth: 1, borderColor: THEME.border, marginBottom: THEME.space.xl, gap: 5 },
  tab:       { flex: 1, borderRadius: THEME.radius.lg, overflow: "hidden" },
  tabActive: {},
  tabGrad:   { paddingVertical: 11, alignItems: "center", borderRadius: THEME.radius.lg },
  tabText:   { color: THEME.textTertiary, fontWeight: THEME.font.bold, fontSize: THEME.font.md, paddingVertical: 11, textAlign: "center" },
  tabTextActive: { color: "#fff", fontWeight: THEME.font.bold, fontSize: THEME.font.md },
  chatRow:   { flexDirection: "row", alignItems: "center", backgroundColor: THEME.surface, padding: THEME.space.lg, borderRadius: THEME.radius.xxl, borderWidth: 1, borderColor: THEME.border },
  avatarWrap:{ position: "relative" },
  avatar:    { width: 54, height: 54, borderRadius: 27, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: THEME.border },
  avatarText:{ color: "#fff", fontSize: 20, fontWeight: THEME.font.black },
  onlineDot: { position: "absolute", bottom: 2, right: 2, width: 13, height: 13, borderRadius: 7, backgroundColor: THEME.live, borderWidth: 2, borderColor: THEME.background },
  info:      { flex: 1, marginLeft: THEME.space.md },
  nameRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  chatName:  { color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.bold },
  timeText:  { color: THEME.textTertiary, fontSize: THEME.font.xs, fontWeight: THEME.font.medium },
  lastMsg:   { color: THEME.textTertiary, fontSize: THEME.font.sm },
  camBtn:    { width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.border, justifyContent: "center", alignItems: "center", marginLeft: THEME.space.sm },
  emptyTitle:{ fontSize: THEME.font.lg, fontWeight: THEME.font.bold, color: THEME.textTertiary },
});