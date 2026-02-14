import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar } from 'react-native';

// This line "imports" the vibe screen so App.js can use it kapoor
import VibeScreen from './screens/VibeScreen';

export default function App() {
  // 1. We create a "State" to track if the app is still loading
  const [isLoading, setIsLoading] = useState(true);

  // 2. This runs as soon as the app starts
  useEffect(() => {
    // Wait for 3 seconds, then set isLoading to false
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer); // Cleanup the timer
  }, []);

  // 3. IF LOADING: Show the Splash Screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.logoText}>AMITY</Text>
        <Text style={[styles.logoText, { color: '#FF2D95' }]}>CONNECT</Text>
        <ActivityIndicator size="large" color="#FF2D95" style={{ marginTop: 20 }} />
      </View>
    );
  }

  // 4. IF NOT LOADING: Show the VibeScreen
  return (
    <View style={{ flex: 1 }}>
       <StatusBar barStyle="light-content" />
       {/* We call the VibeScreen here. When they click 'Next', it will alert. */}
       <VibeScreen onNext={() => alert('Vibes Saved! Moving to Map...')} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#120E16', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFF',
    letterSpacing: 2,
  },
});