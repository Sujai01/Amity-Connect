import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { THEME } from "../constants/Theme";
import { GlobalStyles } from "../constants/Color"; // Using your 'color' file
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

// --- CONSTANTS (Defined outside the component to prevent errors) ---
const CATEGORIES = [
  { id: "all", label: "All", icon: "apps" },
  { id: "people", label: "People", icon: "people" },
  { id: "events", label: "Events", icon: "calendar" },
  { id: "clubs", label: "Clubs", icon: "shield" },
  { id: "places", label: "Places", icon: "location" },
];

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  // FETCH DATA FROM FIREBASE
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let combinedData = [];

        // Determine which collections to fetch
        // Note: I am using the exact names you used (Events, Clubs, Places)
        const collectionsToFetch =
          activeCategory === "all"
            ? ["users", "Events", "Clubs", "Places"]
            : [activeCategory === "people" ? "users" : activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)];

        const promises = collectionsToFetch.map((colName) => getDocs(collection(db, colName)));
        const snapshots = await Promise.all(promises);

        snapshots.forEach((snapshot, index) => {
          const colName = collectionsToFetch[index];
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            // We force the type to lowercase for your switch-case logic
            type: colName === "users" ? "people" : colName.toLowerCase(),
            ...doc.data(),
          }));
          combinedData = [...combinedData, ...docs];
        });

        setResults(combinedData);
      } catch (error) {
        console.error("Firebase Fetch Error: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeCategory]);

  const getFilteredData = () => {
    if (!searchText.trim()) return results;
    return results.filter((item) =>
      item.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  };

  // --- RENDER CARDS (Same as your UI logic) ---
  const renderPersonCard = (item) => (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name?.charAt(0) || "?"}</Text>
        </View>
        {item.online && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultSub}>{item.dept}</Text>
        <View style={styles.vibeRow}>
          {item.vibes?.map((v, i) => (
            <View key={i} style={styles.vibeChip}>
              <Text style={{ fontSize: 12 }}>{v}</Text>
            </View>
          ))}
        </View>
      </View>
      <TouchableOpacity style={styles.connectBtn}>
        <Ionicons name="person-add-outline" size={16} color={THEME.accent} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEventCard = (item) => (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: "rgba(59, 130, 246, 0.15)" }]}>
        <Text style={{ fontSize: 22 }}>{item.tag || "📅"}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultSub}>📍 {item.location}</Text>
        <Text style={[styles.resultSub, { color: THEME.accent, fontSize: 11 }]}>{item.time}</Text>
      </View>
      <View style={styles.attendeeBadge}>
        <Ionicons name="people" size={12} color={THEME.accent} />
        <Text style={styles.attendeeText}>{item.attendees || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderClubCard = (item) => (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: "rgba(16, 185, 129, 0.15)" }]}>
        <Text style={{ fontSize: 22 }}>{item.tag || "🛡️"}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultSub}>{item.members || 0} members</Text>
      </View>
      <TouchableOpacity style={[styles.connectBtn, { borderColor: "#10B981" }]}>
        <Ionicons name="add" size={16} color="#10B981" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderPlaceCard = (item) => (
    <TouchableOpacity style={styles.resultCard} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: "rgba(244, 114, 182, 0.15)" }]}>
        <Text style={{ fontSize: 22 }}>{item.tag || "📍"}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultSub}>{item.desc}</Text>
      </View>
      <View style={styles.distanceBadge}>
        <Ionicons name="navigate-outline" size={12} color="#F472B6" />
        <Text style={[styles.attendeeText, { color: "#F472B6" }]}>{item.distance}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    switch (item.type) {
      case "people": return renderPersonCard(item);
      case "events": return renderEventCard(item);
      case "clubs": return renderClubCard(item);
      case "places": return renderPlaceCard(item);
      default: return null;
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.headerTitle}>Discover</Text>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, events, clubs..."
            placeholderTextColor="#64748B"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={{ height: 60 }}>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryChip, activeCategory === item.id && styles.categoryChipActive]}
                onPress={() => setActiveCategory(item.id)}
              >
                <Ionicons name={item.icon} size={14} color={activeCategory === item.id ? "#FFF" : "#94A3B8"} style={{ marginRight: 6 }} />
                <Text style={[styles.chipLabel, activeCategory === item.id && styles.chipLabelActive]}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={THEME.accent} size="large" style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={getFilteredData()}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={60} color="#334155" />
                <Text style={styles.emptyTitle}>No results found</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// ... (Keep your existing styles.create exactly as you have it)
const styles = StyleSheet.create({
    innerContainer: { flex: 1, paddingHorizontal: 20 },
    headerTitle: { color: "white", fontSize: 32, fontWeight: "bold", marginTop: 60, marginBottom: 20 },
    searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.card, borderRadius: 15, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, borderColor: "#1E293B", marginBottom: 16 },
    searchInput: { flex: 1, color: "#FFF", fontSize: 15, marginLeft: 10 },
    categoryChip: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.card, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, borderWidth: 1, borderColor: "#1E293B", height: 40 },
    categoryChipActive: { backgroundColor: THEME.accent, borderColor: THEME.accent },
    chipLabel: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
    chipLabelActive: { color: "#FFF" },
    resultCount: { color: "#64748B", fontSize: 12, marginBottom: 12, fontWeight: "500" },
    resultCard: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1E293B" },
    avatarContainer: { position: "relative" },
    avatar: { width: 48, height: 48, borderRadius: 14, backgroundColor: "#1E293B", justifyContent: "center", alignItems: "center" },
    avatarText: { color: THEME.accent, fontSize: 20, fontWeight: "bold" },
    onlineDot: { position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: "#10B981", borderWidth: 2, borderColor: THEME.card },
    resultInfo: { flex: 1, marginLeft: 14 },
    resultName: { color: "#FFF", fontSize: 15, fontWeight: "600" },
    resultSub: { color: "#94A3B8", fontSize: 12, marginTop: 2 },
    vibeRow: { flexDirection: "row", marginTop: 6 },
    vibeChip: {
  backgroundColor: 'rgba(255, 255, 255, 0.05)', // Transparent white
  borderRadius: 8,
  paddingHorizontal: 8,
  paddingVertical: 4,
  marginRight: 6,
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
},
    connectBtn: { width: 36, height: 36, borderRadius: 12, borderWidth: 1.5, borderColor: THEME.accent, justifyContent: "center", alignItems: "center" },
    attendeeBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    attendeeText: { color: THEME.accent, fontSize: 12, fontWeight: "600", marginLeft: 4 },
    distanceBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(244, 114, 182, 0.1)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
    emptyContainer: { alignItems: "center", marginTop: 60 },
    emptyTitle: { color: "#64748B", fontSize: 18, fontWeight: "600", marginTop: 16 },
  });