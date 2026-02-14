import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, SafeAreaView, ScrollView } from 'react-native';

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>What's your vibe?</Text>
          <Text style={styles.subtitle}>Select at least 3 to help us find your people.</Text>

          <View style={styles.listContainer}>
            {INTERESTS.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggleInterest(item.id)}
                >
                  <Text style={styles.chipText}>{item.icon} {item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.nextButton, selectedIds.length < 3 && styles.disabledButton]}
            disabled={selectedIds.length < 3}
            onPress={onNext}
          >
            <Text style={styles.nextText}>Next Step →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  listContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: '#FFF', marginTop: 40 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginBottom: 30, marginTop: 10 },

  chip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    margin: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  chipText: { color: '#FFF', fontWeight: '600' },
  nextButton: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
  },
  disabledButton: { backgroundColor: '#334155', opacity: 0.5 },
  nextText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});