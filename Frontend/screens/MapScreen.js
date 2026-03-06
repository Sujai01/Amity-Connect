
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { auth, db } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { updateUserLocation } from '../services/PostService';
import { THEME } from '../constants/Theme';
import { Ionicons } from '@expo/vector-icons';

// --- HELPER: Calculate distance in KM ---
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1) return 999; 
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
}

export default function MapScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [myLocation, setMyLocation] = useState(null); // The variable the error was talking about
  const [loading, setLoading] = useState(true);

  // Constants for Amity Campus
  const AMITY_LAT = 28.465009;
  const AMITY_LON = 77.485304;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMyLocation(location.coords);
      setLoading(false);

      // Updates your position in the database as you move
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
        (loc) => {
          setMyLocation(loc.coords);
          updateUserLocation(loc.coords.latitude, loc.coords.longitude);
        }
      );
    })();

    const q = query(collection(db, "users")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.id !== auth.currentUser.uid && u.location);
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={THEME.accent} />
    </View>
  );

  // Check if we are within 1km of campus
  const isAtAmity = getDistance(myLocation?.latitude, myLocation?.longitude, AMITY_LAT, AMITY_LON) < 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        // This centers the map on YOUR house if you are at home
        region={{
          latitude: myLocation?.latitude || AMITY_LAT,
          longitude: myLocation?.longitude || AMITY_LON,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        customMapStyle={midnightStyle}
      >
        {myLocation && (
          <Marker coordinate={myLocation}>
            <View style={styles.myMarker} />
          </Marker>
        )}

        {users.map(student => (
          <Marker 
            key={student.id} 
            coordinate={{ latitude: student.location.latitude, longitude: student.location.longitude }}
          >
            <View style={styles.studentMarker}>
               <Text style={styles.markerEmoji}>{student.vibes?.[0] || '👋'}</Text>
            </View>
            <Text style={styles.markerName}>{student.name?.split(' ')[0]}</Text>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={28} color="white" />
      </TouchableOpacity>

      {/* --- DYNAMIC BADGE --- */}
      <View style={[styles.campusBadge, { backgroundColor: isAtAmity ? THEME.accent : '#222' }]}>
        <Text style={styles.campusText}>
            {isAtAmity ? "Amity Greater Noida" : "Exploring Nearby"}
        </Text>
      </View>
    </View>
  );
}

const midnightStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#121212" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#bbbbbb" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#000000" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#333333" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0a192f" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  loader: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  myMarker: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#3B82F6', borderWidth: 3, borderColor: 'white' },
  studentMarker: { backgroundColor: '#1E293B', padding: 8, borderRadius: 20, borderWidth: 1.5, borderColor: THEME.accent },
  markerEmoji: { fontSize: 16 },
  markerName: { color: 'white', fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginTop: 4, textShadowColor: 'black', textShadowRadius: 3 },
  backButton: { position: 'absolute', top: 50, left: 20, backgroundColor: '#0A0A0A', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  campusBadge: { position: 'absolute', top: 55, alignSelf: 'center', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  campusText: { color: 'white', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }
});
