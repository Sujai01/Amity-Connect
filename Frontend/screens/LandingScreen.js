import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { THEME } from '../constants/Theme';
import { GlobalStyles } from '../constants/Color'; 

export default function LandingScreen({ onGoSignup, onGoLogin }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heroText}>Connect with your campus community.</Text>
        <Text style={styles.subHero}>Find friends, events, and carpools at Amity Greater Noida.</Text>
        
        <TouchableOpacity style={styles.joinButton} onPress={onGoSignup}>
          <Text style={styles.joinText}>Join the Community</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginBtn} onPress={onGoLogin}>
          <Text style={styles.loginText}>I already have an account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end', padding: 30 },
  content: { marginBottom: 50 },
  heroText: { color: 'white', fontSize: 42, fontWeight: 'bold', lineHeight: 50, marginBottom: 15 },
  subHero: { color: THEME.textSub, fontSize: 16, marginBottom: 40, lineHeight: 24 },
  joinButton: { backgroundColor: THEME.accent, padding: 20, borderRadius: 15, alignItems: 'center' },
  joinText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  loginBtn: { marginTop: 25, alignItems: 'center' },
  loginText: { color: THEME.accent, fontWeight: 'bold' }
});