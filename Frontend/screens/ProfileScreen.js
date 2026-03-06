import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { THEME } from '../constants/Theme';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [postCount, setPostCount] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const unsubscribeProfile = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      setProfile(docSnap.data());
    });

    const fetchStats = async () => {
      const q = query(collection(db, "posts"), where("authorId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      setPostCount(snapshot.size);
      setLoading(false);
    };

    fetchStats();
    return () => unsubscribeProfile();
  }, []);

  const handleEditProfile = () => {
    Alert.alert("Edit Profile", "Profile editing will be available in the next update!");
  };

  const handleImagePick = async () => {
    try {
      // Ask for permission First
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You've refused to allow this app to access your photos!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true, // Request base64
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        await uploadImageToFirebase(base64Image);
      }
    } catch (error) {
       console.log("Image picker error: ", error);
       Alert.alert("Error", "Could not pick image.");
    }
  };

  const uploadImageToFirebase = async (base64String) => {
     setUploadingImage(true);
     try {
       const userRef = doc(db, "users", auth.currentUser.uid);
       // In a real app, use Firebase Storage, but for simple MVP, saving Base64 to Firestore directly
       await updateDoc(userRef, {
         profilePic: base64String
       });
       Alert.alert("Success", "Profile Picture Updated!");
     } catch (error) {
       console.log("Upload Error", error);
       Alert.alert("Error", "Failed to update profile picture.");
     } finally {
       setUploadingImage(false);
     }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Ready to head out?", [
      { text: "Stay", style: "cancel" },
      { text: "Logout", onPress: () => auth.signOut(), style: 'destructive' }
    ]);
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator color={THEME.accent} /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 120}}>
        
        {/* --- HEADER --- */}
        <View style={styles.profileHeader}>
           <TouchableOpacity style={styles.avatarGlow} onPress={handleImagePick} disabled={uploadingImage}>
              <View style={styles.avatar}>
                 {uploadingImage ? (
                    <ActivityIndicator color={THEME.accent}/>
                 ) : profile?.profilePic ? (
                    <Image source={{uri: profile.profilePic}} style={styles.profileImage} />
                 ) : (
                    <Text style={styles.avatarText}>{profile?.name?.charAt(0) || 'U'}</Text>
                 )}
              </View>
              {/* Added small camera icon badge */}
              <View style={styles.cameraBadge}>
                 <Ionicons name="camera" size={12} color="white" />
              </View>
              
              <View style={styles.verifiedBadge}>
                 <Ionicons name="checkmark-circle" size={18} color="white" />
              </View>
           </TouchableOpacity>
           
           <View style={styles.nameContainer}>
              <Text style={styles.userName}>{profile?.name}</Text>
              <Text style={styles.userDept}>Amity University • {profile?.email?.split('@')[0]}</Text>
           </View>
           
           <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
              <Ionicons name="settings-outline" size={16} color="white" />
              <Text style={styles.editBtnText}>Edit Identity</Text>
           </TouchableOpacity>
        </View>

        {/* --- STATS ROW --- */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
             <Text style={styles.statNum}>{profile?.vibes?.length || 0}</Text>
             <Text style={styles.statLabel}>Vibes</Text>
          </View>
          <View style={[styles.statBox, styles.statBorder]}>
             <Text style={styles.statNum}>{postCount}</Text>
             <Text style={styles.statLabel}>Vibes Posted</Text>
          </View>
          <View style={styles.statBox}>
             <Text style={styles.statNum}>4.9</Text>
             <Text style={styles.statLabel}>Trust Score</Text>
          </View>
        </View>

        {/* --- VIBE SECTION --- */}
        {profile?.vibes && profile.vibes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Campus Identity Tags</Text>
            <View style={styles.vibeGrid}>
              {profile.vibes.map((vibe, i) => (
   
   <View key={i} style={styles.vibePill}>
                  <Text style={styles.vibeText}>{vibe}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- PROFESSIONAL SETTINGS ACTIONS --- */}
        <View style={styles.actionSection}>
           <Text style={styles.sectionTitle}>Preferences</Text>
           
           <TouchableOpacity style={styles.settingsRow}>
              <View style={[styles.settingsIcon, {backgroundColor: 'rgba(59, 130, 246, 0.15)'}]}>
                <Ionicons name="notifications" size={20} color={THEME.accent} />
              </View>
              <Text style={styles.settingsText}>Push Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.settingsRow}>
              <View style={[styles.settingsIcon, {backgroundColor: 'rgba(16, 185, 129, 0.15)'}]}>
                <Ionicons name="lock-closed" size={20} color="#10B981" />
              </View>
              <Text style={styles.settingsText}>Privacy & Security</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.settingsRow}>
              <View style={[styles.settingsIcon, {backgroundColor: 'rgba(244, 114, 182, 0.15)'}]}>
                <Ionicons name="color-palette" size={20} color="#F472B6" />
              </View>
              <Text style={styles.settingsText}>App Theme</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
           </TouchableOpacity>

           <TouchableOpacity style={styles.settingsRow}>
              <View style={[styles.settingsIcon, {backgroundColor: 'rgba(139, 92, 246, 0.15)'}]}>
                <Ionicons name="help-buoy" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.settingsText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
           </TouchableOpacity>

           <Text style={[styles.sectionTitle, {marginTop: 15}]}>Account</Text>
           <TouchableOpacity style={styles.actionRow} onPress={handleLogout}>
              <View style={[styles.actionIcon, {backgroundColor: '#FF444422'}]}>
                <Ionicons name="log-out" size={20} color="#FF4444" />
              </View>
              <Text style={[styles.actionText, {color: '#FF4444'}]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={20} color="#333" />
           </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loader: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
  profileHeader: { alignItems: 'center', marginTop: 20 },
  avatarGlow: { width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(59, 130, 246, 0.12)', justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222', overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%', borderRadius: 45 },
  avatarText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: THEME.accent, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#000' },
  cameraBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#333', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#000' },
  
  nameContainer: { alignItems: 'center', marginTop: 15 },
  userName: { color: 'white', fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  userDept: { color: '#666', fontSize: 13, marginTop: 4, textAlign: 'center' },
  
  editBtn: { flexDirection: 'row', backgroundColor: '#0A0A0A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 25, marginTop: 25, borderWidth: 1, borderColor: '#1A1A1A' },
  editBtnText: { color: 'white', marginLeft: 8, fontWeight: 'bold', fontSize: 13 },
  
  statsRow: { flexDirection: 'row', backgroundColor: '#080808', margin: 25, paddingVertical: 22, borderRadius: 28, borderWidth: 1, borderColor: '#111' },
  statBox: { flex: 1, alignItems: 'center' },
  statBorder: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#1A1A1A' },
  statNum: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  statLabel: { color: '#444', fontSize: 10, marginTop: 4, fontWeight: '800', textTransform: 'uppercase' },
  
  section: { paddingHorizontal: 25 },
  sectionTitle: { color: '#555', fontSize: 12, fontWeight: '900', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 2 },
  vibeGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  vibePill: { backgroundColor: '#0A0A0A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18, marginRight: 10, marginBottom: 10, borderWidth: 1, borderColor: '#1A1A1A' },
  vibeText: { color: THEME.accent, fontSize: 13, fontWeight: '700' },
  
  actionSection: { paddingHorizontal: 25, marginTop: 25 },
  settingsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#080808', padding: 18, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#111' },
  settingsIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingsText: { flex: 1, marginLeft: 15, color: 'white', fontWeight: '600', fontSize: 15 },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#080808', padding: 18, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#111' },
  actionIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionText: { flex: 1, marginLeft: 15, color: 'white', fontWeight: 'bold' }
});