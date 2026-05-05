import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { THEME } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChatDetailScreen({ route, navigation }) {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [otherUserLastRead, setOtherUserLastRead] = useState(0);
  const flatListRef = useRef();

  useEffect(() => {
    // 1. MARK AS READ: Update my lastRead timestamp for this chat
    const markAsRead = async () => {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        [`lastRead.${auth.currentUser.uid}`]: serverTimestamp()
      });
    };
    markAsRead();

    // 2. LISTEN FOR MESSAGES
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 3. LISTEN TO OTHER USER: See when they last read the chat
    const unsubChat = onSnapshot(doc(db, "chats", chatId), (snap) => {
      const data = snap.data();
      if (!data) return;
      // Find the ID of the person who is NOT me
      const otherId = data.participants.find(id => id !== auth.currentUser.uid);
      if (data.lastRead && data.lastRead[otherId]) {
        setOtherUserLastRead(data.lastRead[otherId].seconds);
      }
    });

    return () => { unsubMessages(); unsubChat(); };
  }, [chatId]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');

    // Add message to sub-collection
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    // Update the main chat doc for the message list preview
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      lastTimestamp: serverTimestamp()
    });
  };

  const renderMessage = ({ item }) => {
    const isMine = item.senderId === auth.currentUser.uid;
    // Seen logic: if message time <= other user's last read time
    const isSeen = isMine && item.createdAt && item.createdAt.seconds <= otherUserLastRead;

    return (
      <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={styles.msgText}>{item.text}</Text>
        {isMine && (
          <Text style={styles.statusText}>
            {isSeen ? "Seen" : "Sent"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chatName}</Text>
        <TouchableOpacity><Ionicons name="call-outline" size={22} color="white" /></TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        contentContainerStyle={{padding: 20}}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.camBtn}><Ionicons name="camera" size={24} color="white" /></TouchableOpacity>
        <TextInput 
          style={styles.input} 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="Message..." 
          placeholderTextColor="#666" 
        />
        {inputText.length > 0 && (
          <TouchableOpacity onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#111' },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
  bubble: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginBottom: 4, maxWidth: '75%' },
  myBubble: { alignSelf: 'flex-end', backgroundColor: THEME.accent, borderBottomRightRadius: 4 },
  theirBubble: { alignSelf: 'flex-start', backgroundColor: '#1C1C1E', borderBottomLeftRadius: 4 },
  msgText: { color: 'white', fontSize: 16 },
  statusText: { color: 'rgba(255,255,255,0.4)', fontSize: 10, textAlign: 'right', marginTop: 2, fontWeight: '600' },
  inputBar: { flexDirection: 'row', padding: 15, alignItems: 'center', backgroundColor: '#000', paddingBottom: Platform.OS === 'ios' ? 30 : 15 },
  camBtn: { backgroundColor: THEME.accent, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  input: { flex: 1, backgroundColor: '#121212', color: 'white', borderRadius: 25, paddingHorizontal: 20, height: 44, borderWidth: 1, borderColor: '#222' },
  sendText: { color: THEME.accent, fontWeight: 'bold', marginLeft: 15, fontSize: 16 }
});