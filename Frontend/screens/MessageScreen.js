import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, ActivityIndicator, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/Theme';
import { db } from '../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function MessageScreen() {
  const [activeTab, setActiveTab] = useState('Direct');
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchMessagesData = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        let fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isGroup: false }));
        
        const clubsSnap = await getDocs(collection(db, "Clubs"));
        let fetchedClubs = clubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data(), isGroup: true }));

        if (fetchedUsers.length === 0) {
           fetchedUsers = [
             { id: 'u1', name: 'Aarav Sharma', lastMsg: 'See you at H-Block!', time: '2m', online: true, isGroup: false },
             { id: 'u2', name: 'Priya Gupta', lastMsg: 'Did you get the notes?', time: '45m', online: false, isGroup: false },
             { id: 'u3', name: 'Rohan Mehta', lastMsg: 'Cricket at 5?', time: 'Yesterday', online: true, isGroup: false },
           ];
        }

        if (fetchedClubs.length === 0) {
           fetchedClubs = [
             { id: 'g1', name: 'Hackathon Group', lastMsg: 'Ansh: I added the Firebase logic.', time: '1h', isGroup: true, tag: '💻' },
             { id: 'g2', name: 'Amity Developers', lastMsg: 'Sujai: Push your code to main.', time: '3h', isGroup: true, tag: '🚀' },
           ];
        }

        fetchedUsers = fetchedUsers.map(u => ({
          ...u,
          lastMsg: u.lastMsg || 'Tap to chat',
          time: u.time || 'now',
          online: u.online !== undefined ? u.online : Math.random() > 0.5
        }));

        setUsers(fetchedUsers);
        setClubs(fetchedClubs);
      } catch (error) {
        console.error("Fetch Messsages error: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessagesData();
  }, []);

  const getFilteredData = () => {
    const data = activeTab === 'Direct' ? users : clubs;
    if (!searchQuery) return data;
    return data.filter(item => item.name?.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatRow} activeOpacity={0.7}>
      <View style={styles.avatarContainer}>
        {item.isGroup ? (
          <View style={[styles.avatar, {backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: 'transparent'}]}>
            <Text style={{fontSize: 24}}>{item.tag || '🛡️'}</Text>
          </View>
        ) : (
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{item.name?.charAt(0) || 'U'}</Text>
          </View>
        )}
        {!item.isGroup && item.online && <View style={styles.onlineDot} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatNameRow}>
           <Text style={styles.chatName}>{item.name}</Text>
           <Text style={styles.timeText}>{item.time || '2m'}</Text>
        </View>
        <Text style={styles.lastMsg} numberOfLines={1}>
          {item.lastMsg || 'Started a conversation'}
        </Text>
      </View>
      
      {!item.isGroup && (
        <TouchableOpacity style={styles.camBtn}>
           <Ionicons name="camera-outline" size={20} color="#777" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" />
      
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.newChatBtn}>
            <Ionicons name="create-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            placeholder="Search messages..." 
            placeholderTextColor="#64748B" 
            style={styles.searchInput} 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Direct' && styles.activeTab]} 
            onPress={() => setActiveTab('Direct')}
          >
            <Text style={[styles.tabText, activeTab === 'Direct' && styles.activeTabText]}>Direct</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Groups' && styles.activeTab]} 
            onPress={() => setActiveTab('Groups')}
          >
            <Text style={[styles.tabText, activeTab === 'Groups' && styles.activeTabText]}>Groups</Text>
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {loading ? (
           <ActivityIndicator color={THEME.accent} size="large" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={getFilteredData()}
            renderItem={renderChatItem}
            keyExtractor={item => item.id}
            contentContainerStyle={{paddingBottom: 120}}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 10 : 0 },
  innerContainer: { flex: 1, paddingHorizontal: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 25 },
  headerTitle: { color: 'white', fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 },
  newChatBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  
  searchContainer: { flexDirection: 'row', backgroundColor: '#0A0A0A', paddingHorizontal: 18, paddingVertical: 16, borderRadius: 20, borderWidth: 1, borderColor: '#1A1A1A', alignItems: 'center', marginBottom: 25 },
  searchInput: { color: 'white', marginLeft: 12, flex: 1, fontSize: 16, fontWeight: '500' },
  
  tabContainer: { flexDirection: 'row', marginBottom: 25, backgroundColor: '#050505', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: '#111' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16, flexDirection: 'row', justifyContent: 'center' },
  activeTab: { backgroundColor: '#1A1A1A' },
  tabText: { color: '#64748B', fontWeight: '700', fontSize: 15 },
  activeTabText: { color: 'white' },
  notificationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: THEME.accent, marginLeft: 6, marginTop: -8 },
  
  chatRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#080808', padding: 16, borderRadius: 24, marginBottom: 16, borderWidth: 1, borderColor: '#151515' },
  avatarContainer: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2, borderColor: '#000' },
  
  chatInfo: { flex: 1, marginLeft: 16, justifyContent: 'center' },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { color: 'white', fontSize: 17, fontWeight: '700' },
  timeText: { color: '#64748B', fontSize: 12, fontWeight: '600' },
  lastMsg: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  
  camBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }
});