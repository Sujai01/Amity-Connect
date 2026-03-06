import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { COLORS, GlobalStyles } from '../constants/Color';
import { auth, db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

// 20 Organized Options
const INTERESTS = [
  { id: '1', name: 'CS Major', icon: '💻' },
  { id: '2', name: 'Coffee Addict', icon: '☕' },
  { id: '3', name: 'Gym Rat', icon: '🏋️' },
  { id: '4', name: 'Late Night Coder', icon: '🚀' },
  { id: '5', name: 'Anime Fan', icon: '🎎' },
  { id: '6', name: 'Gamer', icon: '🎮' },
  { id: '7', name: 'Photography', icon: '📸' },
  { id: '8', name: 'Netflix Binge', icon: '📺' },
  { id: '9', name: 'Foodie', icon: '🍕' },
  { id: '10', name: 'Music Lover', icon: '🎧' },
  { id: '11', name: 'Cricket Fan', icon: '🏏' },
  { id: '12', name: 'Book Worm', icon: '📚' },
  { id: '13', name: 'H-Block regular', icon: '🏢' },
  { id: '14', name: 'Pari Chowk gang', icon: '🚌' },
  { id: '15', name: 'Hackathon Squad', icon: '🏆' },
  { id: '16', name: 'Night Owl', icon: '🦉' },
  { id: '17', name: 'Early Bird', icon: '☀️' },
  { id: '18', name: 'Designer', icon: '🎨' },
  { id: '19', name: 'Stock Market', icon: '📈' },
  { id: '20', name: 'Dorm Life', icon: '🏠' },
];

export default function VibeScreen({ onNext }) {
  const [selectedNames, setSelectedNames] = useState([]);

  const toggleInterest = (name) => {
    if (selectedNames.includes(name)) {
      setSelectedNames(selectedNames.filter(item => item !== name));
    } else {
      setSelectedNames([...selectedNames, name]);
    }
  };

  const handleFinish = async () => {
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { vibes: selectedNames });
      onNext();
    } catch (error) {
      console.log(error);
    }
  };

  const renderVibe = ({ item }) => {
    const isSelected = selectedNames.includes(item.name);
    return (
      <TouchableOpacity
        style={[styles.vibeBox, isSelected && styles.vibeSelected]}
        onPress={() => toggleInterest(item.name)}
      >
        <Text style={styles.vibeEmoji}>{item.icon}</Text>
        <Text style={styles.vibeText} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.headerTitle}>What's your vibe?</Text>
        <Text style={styles.headerSub}>Select at least 3 items to customize your map</Text>
        
        <FlatList
          data={INTERESTS}
          renderItem={renderVibe}
          keyExtractor={item => item.id}
          numColumns={2} // THE OCD FIX: Perfect 2-column grid
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridPadding}
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[GlobalStyles.mainButton, selectedNames.length < 3 && { opacity: 0.3 }]}
            disabled={selectedNames.length < 3}
            onPress={handleFinish}
          >
            <Text style={GlobalStyles.buttonText}>Enter Amity Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  innerContainer: { flex: 1, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontSize: 32, fontWeight: 'bold', marginTop: 40, textAlign: 'left' },
  headerSub: { color: COLORS.textSub, fontSize: 16, marginTop: 10, marginBottom: 20 },
  gridPadding: { paddingBottom: 100 },
  
  vibeBox: {
    flex: 1, // This makes both columns equal width
    backgroundColor: COLORS.card,
    margin: 8,
    paddingVertical: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.chipBorder,
  },
  vibeSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  vibeEmoji: { fontSize: 24, marginBottom: 8 },
  vibeText: { color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  
  footer: { 
    position: 'absolute', 
    bottom: 30, 
    left: 20, 
    right: 20, 
    backgroundColor: 'transparent' 
  }
});