import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  Platform, 
  StatusBar as RNStatusBar, 
  Modal, 
  TextInput, 
  Share,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { THEME } from '../constants/Theme';
import { createNewPost , toggleLike , deletePost} from '../services/PostService';

// --- HIGHLIGHTS DATA ---
const HIGHLIGHTS = [
  { id: 'h1', type: 'blog', title: 'Top 10 Hacks for exams', icon: 'bulb-outline', color: '#8B5CF6' },
  { id: 'h2', type: 'event', title: 'Tech Fest 2026', icon: 'calendar-outline', color: '#10B981' },
  { id: 'h3', type: 'meme', title: 'Freshers logic 😂', icon: 'happy-outline', color: '#F59E0B' },
  { id: 'h4', type: 'news', title: 'New Cafe Open!', icon: 'cafe-outline', color: '#EF4444' },
];

export default function HomeScreen({ navigation, route }) {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // --- MODAL & POSTING STATE ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // 1. LISTEN FOR THE CENTER "+" TAB PRESS (via Navigation Params)
  useEffect(() => {
    if (route.params?.openPostModal) {
      setModalVisible(true);
      // Immediately reset the param so the modal doesn't keep popping up
      navigation.setParams({ openPostModal: false });
    }
  }, [route.params?.openPostModal]);

  useEffect(() => {
    // 2. FETCH LOGGED IN USER DATA
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (e) { console.log("User fetch error:", e); }
    };

    // 3. FETCH LIVE POSTS FROM FIREBASE
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.log("Posts listener error:", error);
    });

    fetchUser();
    return () => unsubscribePosts();
  }, []);

  const handleSendPost = async () => {
    if (postContent.trim().length < 3) {
      Alert.alert("Vibe too short", "Share a little more with the community!");
      return;
    }

    setIsPosting(true);
    const result = await createNewPost(postContent);
    setIsPosting(false);

    if (result.success) {
      setPostContent('');
      setModalVisible(false);
    } else {
      Alert.alert("Error", result.error);
    }
  };

    // 1. HANDLE LIKE
  const handleLike = (item) => {
    const hasLiked = item.likedBy?.includes(auth.currentUser.uid);
    toggleLike(item.id, hasLiked);
  };

  // 2. HANDLE SHARE
  const handleShare = async (content) => {
    try {
      await Share.share({
        message: `Check out this vibe on Amity Connect: "${content}"`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  // 3. HANDLE OPTIONS (Three Dots)
  const handleOptions = (item) => {
  setSelectedPost(item);
  setOptionsVisible(true);
};

  const renderHighlight = ({ item }) => (
    <TouchableOpacity style={[styles.highlightCard, { borderColor: item.color + '40' }]}>
      <View style={[styles.highlightIconBg, { backgroundColor: item.color + '20' }]}>
         <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.highlightTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => {
    const hasLiked = item.likedBy?.includes(auth.currentUser.uid);

    return (
      <View style={styles.feedCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userThumb}>
            <Text style={styles.avatarInitial}>{item.authorName?.charAt(0)}</Text>
          </View>
          <View style={{flex: 1, marginLeft: 12}}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
               <Text style={styles.postAuthor}>{item.authorName}</Text>
               <Ionicons name="checkmark-circle" size={12} color={THEME.accent} style={{marginLeft: 4}} />
            </View>
            <Text style={styles.postDetails}>posted in <Text style={{color: THEME.accent}}>{item.circle || 'General'}</Text></Text>
          </View>
          
          {/* THREE DOTS BUTTON */}
          <TouchableOpacity onPress={() => handleOptions(item)}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <Text style={styles.postText}>{item.content}</Text>

        <View style={styles.cardFooter}>
           <View style={styles.actionRow}>
              {/* LIKE BUTTON */}
              <TouchableOpacity onPress={() => handleLike(item)} style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20}}>
                <Ionicons 
                  name={hasLiked ? "heart" : "heart-outline"} 
                  size={18} 
                  color={hasLiked ? "#FF2D95" : "white"} 
                />
                <Text style={[styles.actionText, hasLiked && {color: '#FF2D95'}]}>
                  {item.likes || 0}
                </Text>
              </TouchableOpacity>
           </View>

           {/* SHARE BUTTON */}
           <TouchableOpacity onPress={() => handleShare(item.content)} style={{backgroundColor: '#1A1A1A', padding: 8, borderRadius: 20}}>
              <Ionicons name="share-social-outline" size={18} color="white" />
           </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.userName}>Hello, {userData?.name?.split(' ')[0] || 'Student'}!</Text>
        </View>
        <TouchableOpacity style={styles.iconCircle}>
          <Ionicons name="notifications-outline" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.mapButton} 
        onPress={() => navigation.navigate('Map')}
        activeOpacity={0.8}
      >
        <View style={styles.mapContentRow}>
           <View style={styles.mapIconBg}>
              <Ionicons name="location" size={24} color="white" />
           </View>
           <View style={{flex: 1, marginLeft: 15}}>
              <Text style={styles.mapButtonText}>Campus Map</Text>
              <Text style={styles.mapButtonSub}>Find friends, events, classes</Text>
           </View>
           <View style={styles.onlineBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.onlineText}>Live</Text>
           </View>
        </View>
      </TouchableOpacity>

      {/* HIGHLIGHTS SECTION */}
      <View style={{marginBottom: 35}}>
         <Text style={styles.sectionTitle}>Campus Highlights</Text>
         <FlatList
           horizontal
           data={HIGHLIGHTS}
           keyExtractor={item => item.id}
           renderItem={renderHighlight}
           showsHorizontalScrollIndicator={false}
           contentContainerStyle={{paddingRight: 20}} 
         />
      </View>

      <Text style={styles.sectionTitle}>Recent Vibes</Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" />
      
      <View style={styles.innerContainer}>
        {loading ? (
          <ActivityIndicator color={THEME.accent} style={{marginTop: 50}} />
        ) : (
          <FlatList
            ListHeaderComponent={renderHeader}
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 20, paddingTop: 10}}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>No vibes yet. Start the conversation!</Text>
            )}
          />
        )}

        {/* POSTING MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalPostBtn} 
                  onPress={handleSendPost}
                  disabled={isPosting}
                >
                  {isPosting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalPostText}>Post Vibe</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.modalInput}
                placeholder="What's the vibe at Amity?"
                placeholderTextColor="#475569"
                multiline
                autoFocus
                value={postContent}
                onChangeText={setPostContent}
              />
            </View>
          </View>
        </Modal>

        {/* --- CUSTOM DARK ACTION SHEET --- */}
<Modal
  animationType="fade"
  transparent={true}
  visible={isOptionsVisible}
  onRequestClose={() => setOptionsVisible(false)}
>
  <TouchableOpacity 
    style={styles.sheetOverlay} 
    activeOpacity={1} 
    onPress={() => setOptionsVisible(false)}
  >
    <View style={styles.sheetContent}>
      <View style={styles.sheetHandle} />
      
      <Text style={styles.sheetTitle}>Post Options</Text>

      {/* DELETE OPTION: Only show if it's MY post */}
      {selectedPost?.authorId === auth.currentUser.uid ? (
        <TouchableOpacity 
  style={styles.sheetBtn} 
  onPress={async () => {
    setOptionsVisible(false); // Close menu first for speed
    const result = await deletePost(selectedPost.id);
    if (!result.success) {
      Alert.alert("Delete Failed", "You don't have permission to delete this vibe.");
    }
  }}
>
  <Ionicons name="trash-outline" size={20} color="#FF4444" />
  <Text style={[styles.sheetBtnText, {color: '#FF4444'}]}>Delete Vibe</Text>
</TouchableOpacity>
      ) : (
        // REPORT OPTION: Show if it's someone else's post
        <TouchableOpacity style={styles.sheetBtn} onPress={() => setOptionsVisible(false)}>
          <Ionicons name="flag-outline" size={20} color="white" />
          <Text style={styles.sheetBtnText}>Report Post</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity 
        style={[styles.sheetBtn, {marginTop: 10, backgroundColor: '#111'}]} 
        onPress={() => setOptionsVisible(false)}
      >
        <Text style={[styles.sheetBtnText, {marginLeft: 0, width: '100%', textAlign: 'center'}]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
</Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000000', 
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 10 : 0 
  },
  innerContainer: { paddingHorizontal: 20, flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, marginBottom: 25 },
  userName: { color: 'white', fontSize: 28, fontWeight: 'bold', letterSpacing: -0.5 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1A1A1A' },
  
  mapButton: { 
    backgroundColor: '#1E3A8A', 
    borderRadius: 28, 
    marginBottom: 35,
    borderWidth: 1,
    borderColor: '#3B82F655', 
    overflow: 'hidden'
  },
  mapContentRow: {
    flexDirection: 'row', 
    padding: 20, 
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)' 
  },
  mapIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5
  },
  mapButtonText: { color: 'white', fontWeight: '800', fontSize: 18 },
  mapButtonSub: { color: '#93C5FD', fontSize: 13, marginTop: 4, fontWeight: '500' },
  onlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981', marginRight: 6 },
  onlineText: { color: 'white', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },

  sectionTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 15, letterSpacing: -0.3 },
  
  // HIGHLIGHTS STYLES
  highlightCard: {
    backgroundColor: '#080808',
    width: 140,
    height: 140,
    borderRadius: 24,
    padding: 18,
    marginRight: 15,
    borderWidth: 1,
    justifyContent: 'space-between'
  },
  highlightIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  highlightTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20
  },

  feedCard: { backgroundColor: '#080808', borderRadius: 28, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: '#121212' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  userThumb: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
  avatarInitial: { color: THEME.accent, fontWeight: 'bold', fontSize: 18 },
  postAuthor: { color: 'white', fontWeight: '800', fontSize: 15 },
  postDetails: { color: '#666', fontSize: 12, marginTop: 2, fontWeight: '500' },
  postText: { color: '#D1D5DB', fontSize: 15, lineHeight: 24, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  actionRow: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: 'white', marginLeft: 6, fontSize: 13, fontWeight: '700' },
  emptyText: { color: '#444', textAlign: 'center', marginTop: 40 },

  // MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0A0A0A', height: '90%', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, borderWidth: 1, borderColor: '#1A1A1A' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalCancel: { color: '#94A3B8', fontSize: 16 },
  modalPostBtn: { backgroundColor: THEME.accent, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 25 },
  modalPostText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  modalInput: { color: 'white', fontSize: 20, textAlignVertical: 'top', height: '100%', lineHeight: 28 },

  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#0A0A0A',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: '#1A1A1A'
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#333',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20
  },
  sheetTitle: {
    color: '#444',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase'
  },
  sheetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080808',
    padding: 18,
    borderRadius: 20,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#111'
  },
  sheetBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15
  },
});