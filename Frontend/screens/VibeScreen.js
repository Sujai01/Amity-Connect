import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';

//Kapoor and Ansh can add more interests

const INTERESTS = [
  { id: '1', name: 'Coffee Addict', icon: '☕' },
  { id: '2', name: 'CS Major', icon: '💻' },
  { id: '3', name: 'Gym Rat', icon: '🏋️' },
  { id: '4', name: 'Netflix Binge', icon: '📺' },
  { id: '5', name: 'Late Night Study', icon: '🌙' },
  { id: '6', name: 'Photography', icon: '📸' },
  { id: '7', name: 'Anime', icon: '🎎' },
  { id: '8', name: 'Gamer', icon: '🎮' },
];

export default function VibeScreen({ onNext }) {
  const [selectedIds, setSelectedIds] = useState([]);

  // This function adds or removes an interest when you tap it
  const toggleInterest = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedIds.includes(item.id);
    return (
      <TouchableOpacity 
        style={[styles.chip, isSelected && styles.chipSelected]} 
        onPress={() => toggleInterest(item.id)}
      >
        <Text style={styles.chipText}>{item.icon} {item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>What's your vibe?</Text>
      <Text style={styles.subtitle}>Select at least 3 to help us find your people.</Text>

      <FlatList
        data={INTERESTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2} 
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity 
        style={[styles.nextButton, selectedIds.length < 3 && styles.disabledButton]}
        disabled={selectedIds.length < 3}
        onPress={onNext}
      >
        <Text style={styles.nextText}>Next Step →</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#120E16', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#A0A0A0', marginBottom: 30, marginTop: 10 },
  list: { alignItems: 'center' },
  chip: {
    backgroundColor: '#1F1B24',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  chipSelected: {
    backgroundColor: '#FF2D95', 
    borderColor: '#FF2D95',
  },
  chipText: { color: '#FFF', fontWeight: '600' },
  nextButton: {
    backgroundColor: '#FF2D95',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: { backgroundColor: '#555' },
  nextText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});