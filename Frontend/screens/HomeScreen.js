import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, StatusBar, Modal, TextInput,
  Share, Alert, Animated, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { THEME, HIGHLIGHT_COLORS } from "../constants/Theme";
import { createNewPost, toggleLike, deletePost } from "../services/PostService";

const HIGHLIGHTS = [
  { id: "h1", type: "blog",  title: "Top 10 Exam Hacks",  icon: "bulb-outline",    emoji: "💡" },
  { id: "h2", type: "event", title: "Tech Fest 2026",     icon: "calendar-outline", emoji: "🚀" },
  { id: "h3", type: "meme",  title: "Freshers Logic 😂",  icon: "happy-outline",    emoji: "😂" },
  { id: "h4", type: "news",  title: "New Cafe Open!",     icon: "cafe-outline",     emoji: "☕" },
];

// ─── HIGHLIGHT CARD ────────────────────────────────────────────────────────────
function HighlightCard({ item }) {
  const colors = HIGHLIGHT_COLORS[item.type];
  return (
    <TouchableOpacity activeOpacity={0.8}>
      <View style={[styles.highlightCard, { borderColor: colors.border }]}>
        <LinearGradient
          colors={[colors.bg, "transparent"]}
          style={styles.highlightGrad}
        >
          <View style={[styles.highlightIconBg, { backgroundColor: colors.bg }]}>
            <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
          </View>
          <Text style={styles.highlightTitle} numberOfLines={2}>{item.title}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

// ─── AVATAR ────────────────────────────────────────────────────────────────────
function GradientAvatar({ name, size = 44 }) {
  return (
    <LinearGradient
      colors={THEME.gradientAvatar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 2, justifyContent: "center", alignItems: "center" }}
    >
      <Text style={{ color: "#fff", fontSize: size * 0.4, fontWeight: THEME.font.black }}>
        {name?.charAt(0)?.toUpperCase() || "?"}
      </Text>
    </LinearGradient>
  );
}

// ─── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({ item, onLike, onShare, onOptions }) {
  const hasLiked  = item.likedBy?.includes(auth.currentUser.uid);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleLike = () => {
    // Heart bounce animation
    Animated.sequence([
      Animated.timing(heartScale, { toValue: 1.4, duration: 100, useNativeDriver: true }),
      Animated.spring(heartScale,  { toValue: 1,   friction: 3,   useNativeDriver: true }),
    ]).start();
    onLike(item);
  };

  return (
    <View style={styles.feedCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <GradientAvatar name={item.authorName} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={styles.postAuthor}>{item.authorName}</Text>
            <Ionicons name="checkmark-circle" size={13} color={THEME.accent} />
          </View>
          <Text style={styles.postMeta}>
            in <Text style={{ color: THEME.accent }}>{item.circle || "General"}</Text>
            {" · "}{item.createdAt?.toDate
              ? new Date(item.createdAt.toDate()).toLocaleDateString("en", { month: "short", day: "numeric" })
              : "now"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => onOptions(item)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="ellipsis-horizontal" size={20} color={THEME.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <Text style={styles.postText}>{item.content}</Text>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <TouchableOpacity onPress={handleLike} style={styles.likeBtn} activeOpacity={0.7}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons
              name={hasLiked ? "heart" : "heart-outline"}
              size={18}
              color={hasLiked ? THEME.energy : THEME.textTertiary}
            />
          </Animated.View>
          <Text style={[styles.actionCount, hasLiked && { color: THEME.energy }]}>
            {item.likes || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onShare(item.content)} style={styles.shareBtn} activeOpacity={0.7}>
          <Ionicons name="share-social-outline" size={18} color={THEME.textTertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── HOME SCREEN ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation, route }) {
  const [userData, setUserData]       = useState(null);
  const [posts,    setPosts]          = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [postContent,  setPostContent]  = useState("");
  const [isPosting,    setIsPosting]    = useState(false);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost,   setSelectedPost]   = useState(null);

  // Modal slide-up animation
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = () => {
    setModalVisible(true);
    Animated.spring(modalAnim, { toValue: 1, friction: 8, tension: 65, useNativeDriver: true }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setModalVisible(false));
  };

  useEffect(() => {
    if (route.params?.openPostModal) {
      openModal();
      navigation.setParams({ openPostModal: false });
    }
  }, [route.params?.openPostModal]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) setUserData(snap.data());
      } catch (e) { console.log(e); }
    };

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    fetchUser();
    return () => unsub();
  }, []);

  const handleSendPost = async () => {
    if (postContent.trim().length < 3) {
      Alert.alert("Vibe too short", "Share a little more with the community!");
      return;
    }
    setIsPosting(true);
    const result = await createNewPost(postContent);
    setIsPosting(false);
    if (result.success) { setPostContent(""); closeModal(); }
    else Alert.alert("Error", result.error);
  };

  const handleShare = async (content) => {
    try {
      await Share.share({ message: `Check this vibe on Amity Connect: "${content}"` });
    } catch (_) {}
  };

  // ─── LIST HEADER ─────────────────────────────────────────────────────────────
  const ListHeader = () => (
    <>
      {/* Greeting row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greetSub}>Good {getTimeOfDay()},</Text>
          <Text style={styles.greetName}>{userData?.name?.split(" ")[0] || "Student"} 👋</Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color={THEME.textPrimary} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      {/* Map button — glassmorphism */}
      <TouchableOpacity onPress={() => navigation.navigate("Map")} activeOpacity={0.85} style={{ marginBottom: 28 }}>
        <View style={styles.mapCard}>
          <LinearGradient
            colors={[THEME.accentMuted, "transparent"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mapGrad}
          >
            <LinearGradient colors={THEME.gradientAccent} style={styles.mapIconBg}>
              <Ionicons name="location" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.mapTitle}>Campus Map</Text>
              <Text style={styles.mapSub}>Find friends, events & classes</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* Highlights */}
      <Text style={styles.sectionLabel}>Campus Highlights</Text>
      <FlatList
        horizontal
        data={HIGHLIGHTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HighlightCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingRight: 20, marginBottom: 28 }}
      />

      <Text style={styles.sectionLabel}>Recent Vibes</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {loading ? (
        <ActivityIndicator color={THEME.accent} style={{ marginTop: 80 }} />
      ) : (
        <FlatList
          ListHeaderComponent={<ListHeader />}
          data={posts}
          renderItem={({ item }) => (
            <PostCard
              item={item}
              onLike={(p) => toggleLike(p.id, p.likedBy?.includes(auth.currentUser.uid))}
              onShare={handleShare}
              onOptions={(p) => { setSelectedPost(p); setOptionsVisible(true); }}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40 }}>✨</Text>
              <Text style={styles.emptyTitle}>No vibes yet</Text>
              <Text style={styles.emptySub}>Be the first to post something!</Text>
            </View>
          )}
        />
      )}

      {/* ── POST MODAL ── */}
      <Modal visible={modalVisible} transparent animationType="none" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeModal} />
          <Animated.View
            style={[
              styles.modalSheet,
              {
                transform: [{
                  translateY: modalAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }),
                }],
              },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>New Vibe</Text>
              <TouchableOpacity onPress={handleSendPost} disabled={isPosting}>
                <LinearGradient colors={THEME.gradientAccent} style={styles.postPill}>
                  {isPosting
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={styles.postPillText}>Post</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", padding: THEME.space.xl, gap: 14 }}>
              <GradientAvatar name={userData?.name} size={40} />
              <TextInput
                style={styles.postInput}
                placeholder="What's the vibe at Amity? 👀"
                placeholderTextColor={THEME.textTertiary}
                multiline
                autoFocus
                value={postContent}
                onChangeText={setPostContent}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* ── OPTIONS SHEET ── */}
      <Modal visible={optionsVisible} transparent animationType="fade" onRequestClose={() => setOptionsVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOptionsVisible(false)}>
          <View style={styles.optionsSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.optionsTitle}>POST OPTIONS</Text>

            {selectedPost?.authorId === auth.currentUser.uid ? (
              <TouchableOpacity
                style={styles.optionRow}
                onPress={async () => {
                  setOptionsVisible(false);
                  const res = await deletePost(selectedPost.id);
                  if (!res.success) Alert.alert("Error", "Could not delete post.");
                }}
              >
                <View style={[styles.optionIcon, { backgroundColor: THEME.dangerMuted }]}>
                  <Ionicons name="trash-outline" size={18} color={THEME.danger} />
                </View>
                <Text style={[styles.optionText, { color: THEME.danger }]}>Delete Vibe</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.optionRow} onPress={() => setOptionsVisible(false)}>
                <View style={[styles.optionIcon, { backgroundColor: THEME.warmMuted }]}>
                  <Ionicons name="flag-outline" size={18} color={THEME.warm} />
                </View>
                <Text style={styles.optionText}>Report Post</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.optionRow, { marginTop: 8 }]} onPress={() => setOptionsVisible(false)}>
              <Text style={[styles.optionText, { textAlign: "center", flex: 1, color: THEME.textTertiary }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  listContent: { paddingHorizontal: THEME.space.xl, paddingBottom: 120, paddingTop: THEME.space.xl },

  // Header
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: THEME.space.xxl },
  greetSub: { fontSize: THEME.font.sm, color: THEME.textTertiary, fontWeight: THEME.font.medium },
  greetName: { fontSize: THEME.font.xl, fontWeight: THEME.font.black, color: THEME.textPrimary, letterSpacing: -0.5 },
  notifBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.glassBorder, justifyContent: "center", alignItems: "center" },
  notifDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: THEME.energy, position: "absolute", top: 8, right: 8, borderWidth: 1.5, borderColor: THEME.background },

  // Map card
  mapCard: {
    borderRadius: THEME.radius.xxl,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    overflow: "hidden",
  },
  mapGrad:   { flexDirection: "row", alignItems: "center", padding: THEME.space.xl },
  mapIconBg: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", shadowColor: THEME.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4 },
  mapTitle:  { color: THEME.textPrimary, fontWeight: THEME.font.extrabold, fontSize: THEME.font.lg },
  mapSub:    { color: THEME.textTertiary, fontSize: THEME.font.sm, marginTop: 3 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: THEME.liveMuted, borderWidth: 1, borderColor: THEME.liveBorder, borderRadius: THEME.radius.pill, paddingHorizontal: 10, paddingVertical: 5, gap: 5 },
  liveDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.live },
  liveText:  { color: THEME.live, fontSize: 9, fontWeight: THEME.font.black, letterSpacing: 0.8 },

  // Section label
  sectionLabel: { fontSize: THEME.font.xs, fontWeight: THEME.font.black, color: THEME.textTertiary, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: THEME.space.md },

  // Highlight card
  highlightCard: { width: 130, height: 130, borderRadius: THEME.radius.xl, borderWidth: 1, overflow: "hidden", backgroundColor: THEME.surface },
  highlightGrad: { flex: 1, padding: THEME.space.md, justifyContent: "space-between" },
  highlightIconBg: { width: 40, height: 40, borderRadius: THEME.radius.md, justifyContent: "center", alignItems: "center" },
  highlightTitle: { color: THEME.textPrimary, fontSize: THEME.font.sm, fontWeight: THEME.font.bold, lineHeight: 18 },

  // Feed card
  feedCard:   { backgroundColor: THEME.surface, borderRadius: THEME.radius.xxl, padding: THEME.space.xl, marginBottom: THEME.space.lg, borderWidth: 1, borderColor: THEME.border },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: THEME.space.md },
  postAuthor: { color: THEME.textPrimary, fontWeight: THEME.font.bold, fontSize: THEME.font.md },
  postMeta:   { color: THEME.textTertiary, fontSize: THEME.font.xs, marginTop: 2 },
  postText:   { color: THEME.textSecondary, fontSize: THEME.font.md, lineHeight: 24, marginBottom: THEME.space.md },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  likeBtn:    { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.border, paddingHorizontal: 14, paddingVertical: 7, borderRadius: THEME.radius.pill },
  shareBtn:   { backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.border, padding: 8, borderRadius: THEME.radius.pill },
  actionCount:{ color: THEME.textTertiary, fontSize: THEME.font.sm, fontWeight: THEME.font.bold },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: THEME.font.lg, fontWeight: THEME.font.bold, color: THEME.textTertiary },
  emptySub:   { fontSize: THEME.font.sm, color: THEME.textDisabled },

  // Post modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.75)", justifyContent: "flex-end" },
  modalSheet:   { backgroundColor: THEME.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderColor: THEME.border, paddingBottom: 40, minHeight: 320 },
  sheetHandle:  { width: 36, height: 4, borderRadius: 2, backgroundColor: THEME.border, alignSelf: "center", marginTop: 12 },
  modalHeader:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: THEME.space.xl, paddingTop: THEME.space.lg, paddingBottom: THEME.space.md },
  modalTitle:   { color: THEME.textPrimary, fontWeight: THEME.font.bold, fontSize: THEME.font.md },
  cancelText:   { color: THEME.textTertiary, fontSize: THEME.font.md },
  postPill:     { borderRadius: THEME.radius.pill, paddingHorizontal: 18, paddingVertical: 8 },
  postPillText: { color: "#fff", fontWeight: THEME.font.bold, fontSize: THEME.font.sm },
  postInput:    { flex: 1, color: THEME.textPrimary, fontSize: 18, textAlignVertical: "top", lineHeight: 26, minHeight: 120 },

  // Options sheet
  optionsSheet: { backgroundColor: THEME.surface, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderColor: THEME.border, padding: THEME.space.xl, paddingBottom: 48 },
  optionsTitle: { color: THEME.textTertiary, fontSize: THEME.font.xs, fontWeight: THEME.font.black, letterSpacing: 1.5, textAlign: "center", marginTop: THEME.space.sm, marginBottom: THEME.space.xl },
  optionRow:    { flexDirection: "row", alignItems: "center", backgroundColor: THEME.glass, borderWidth: 1, borderColor: THEME.border, padding: THEME.space.lg, borderRadius: THEME.radius.xl, marginBottom: THEME.space.sm, gap: 14 },
  optionIcon:   { width: 36, height: 36, borderRadius: THEME.radius.md, justifyContent: "center", alignItems: "center" },
  optionText:   { color: THEME.textPrimary, fontSize: THEME.font.md, fontWeight: THEME.font.semibold },
});