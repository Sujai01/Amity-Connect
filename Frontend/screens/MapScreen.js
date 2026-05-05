import React, { useState, useEffect } from "react";
import {
  View, StyleSheet, Dimensions, Text, ActivityIndicator,
  TouchableOpacity, StatusBar, Platform,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebaseConfig";
import { collection, onSnapshot, query } from "firebase/firestore";
import { updateUserLocation } from "../services/LocationService";
import { THEME } from "../constants/Theme";

// Lazy-load react-native-maps only on native (not web)
let MapView, PROVIDER_GOOGLE, Marker;
if (Platform.OS !== "web") {
  const Maps  = require("react-native-maps");
  MapView     = Maps.default;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  Marker      = Maps.Marker;
}

// Haversine distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1) return 999;
  const R    = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const AMITY_LAT = 28.465009;
const AMITY_LON = 77.485304;

// ── Deep Space map style — matches app palette ────────────────────────────────
const MAP_STYLE = [
  { elementType: "geometry",             stylers: [{ color: "#0A0A0F" }] },
  { elementType: "labels.text.fill",     stylers: [{ color: "#6B6B8A" }] },
  { elementType: "labels.text.stroke",   stylers: [{ color: "#0A0A0F" }] },
  { featureType: "road",         elementType: "geometry",           stylers: [{ color: "#1A1A2E" }] },
  { featureType: "road",         elementType: "geometry.stroke",    stylers: [{ color: "#111118" }] },
  { featureType: "road.highway", elementType: "geometry",           stylers: [{ color: "#1A1A2E" }] },
  { featureType: "road.highway", elementType: "geometry.stroke",    stylers: [{ color: "#5B5FFF22" }] },
  { featureType: "water",        elementType: "geometry",           stylers: [{ color: "#060612" }] },
  { featureType: "poi",          elementType: "geometry",           stylers: [{ color: "#111118" }] },
  { featureType: "poi.park",     elementType: "geometry",           stylers: [{ color: "#0D1A0D" }] },
  { featureType: "transit",      elementType: "geometry",           stylers: [{ color: "#111118" }] },
  { featureType: "administrative", elementType: "geometry.stroke",  stylers: [{ color: "#1A1A2E" }] },
];

export default function MapScreen({ navigation }) {
  const [users,      setUsers]      = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") { alert("Location permission required for campus map."); return; }

      const loc = await Location.getCurrentPositionAsync({});
      setMyLocation(loc.coords);
      setLoading(false);

      if (Platform.OS !== "web") {
        Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 10 },
          (l) => {
            setMyLocation(l.coords);
            updateUserLocation(l.coords.latitude, l.coords.longitude);
          }
        );
      }
    })();

    const unsub = onSnapshot(query(collection(db, "users")), (snap) => {
      setUsers(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((u) => u.id !== auth.currentUser.uid && u.location)
      );
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <View style={mapStyles.loader}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color={THEME.accent} />
        <Text style={{ color: THEME.textTertiary, marginTop: 16, fontSize: THEME.font.sm }}>
          Finding your location...
        </Text>
      </View>
    );
  }

  const isAtAmity = getDistance(myLocation?.latitude, myLocation?.longitude, AMITY_LAT, AMITY_LON) < 1;

  return (
    <View style={mapStyles.container}>
      <StatusBar barStyle="light-content" />

      {Platform.OS === "web" ? (
        <View style={mapStyles.webFallback}>
          <Ionicons name="map-outline" size={64} color={THEME.textDisabled} />
          <Text style={mapStyles.webTitle}>Map not available on Web</Text>
          <Text style={mapStyles.webSub}>Use the mobile app to see the live campus map.</Text>
        </View>
      ) : (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={mapStyles.map}
          region={{
            latitude:       myLocation?.latitude  || AMITY_LAT,
            longitude:      myLocation?.longitude || AMITY_LON,
            latitudeDelta:  0.005,
            longitudeDelta: 0.005,
          }}
          customMapStyle={MAP_STYLE}
        >
          {/* My marker — pulsing accent dot */}
          {myLocation && (
            <Marker coordinate={myLocation} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={mapStyles.myMarkerOuter}>
                <View style={mapStyles.myMarkerInner} />
              </View>
            </Marker>
          )}

          {/* Other students */}
          {users.map((student) => (
            <Marker
              key={student.id}
              coordinate={{
                latitude:  student.location.latitude,
                longitude: student.location.longitude,
              }}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={mapStyles.studentMarkerWrap}>
                <LinearGradient colors={THEME.gradientAvatar} style={mapStyles.studentMarker}>
                  <Text style={{ fontSize: 14 }}>{student.vibes?.[0]?.slice(0, 1) || "?"}</Text>
                </LinearGradient>
                <Text style={mapStyles.markerName}>{student.name?.split(" ")[0]}</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Back button */}
      <TouchableOpacity style={mapStyles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={THEME.textPrimary} />
      </TouchableOpacity>

      {/* Campus badge — top center */}
      <View style={[mapStyles.campusBadge, isAtAmity && mapStyles.campusBadgeActive]}>
        {isAtAmity && <View style={mapStyles.badgeDot} />}
        <Text style={[mapStyles.campusText, isAtAmity && { color: THEME.live }]}>
          {isAtAmity ? "Amity Greater Noida" : "Exploring Nearby"}
        </Text>
      </View>

      {/* Bottom friends count chip */}
      <View style={mapStyles.friendsChip}>
        <Ionicons name="people" size={16} color={THEME.accent} />
        <Text style={mapStyles.friendsText}>
          {users.length} {users.length === 1 ? "friend" : "friends"} nearby
        </Text>
      </View>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: THEME.background },
  loader:      { flex: 1, backgroundColor: THEME.background, justifyContent: "center", alignItems: "center" },
  map:         { width: Dimensions.get("window").width, height: Dimensions.get("window").height },

  myMarkerOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: `${THEME.accent}30`, justifyContent: "center", alignItems: "center" },
  myMarkerInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: THEME.accent, borderWidth: 2, borderColor: "#fff" },

  studentMarkerWrap: { alignItems: "center" },
  studentMarker:     { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#fff" },
  markerName:        { color: "#fff", fontSize: 10, fontWeight: THEME.font.black, marginTop: 3, textShadowColor: "#000", textShadowRadius: 4 },

  backBtn: {
    position: "absolute",
    top: 54,
    left: 20,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: THEME.glassDark,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    justifyContent: "center",
    alignItems: "center",
  },

  campusBadge: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.glassDark,
    borderWidth: 1,
    borderColor: THEME.glassBorder,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 6,
  },
  campusBadgeActive: {
    borderColor: THEME.liveBorder,
    backgroundColor: THEME.liveMuted,
  },
  badgeDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: THEME.live },
  campusText: { color: THEME.textTertiary, fontSize: THEME.font.xs, fontWeight: THEME.font.black, letterSpacing: 0.8 },

  friendsChip: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.glassDark,
    borderWidth: 1,
    borderColor: THEME.accentBorder,
    borderRadius: THEME.radius.pill,
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8,
  },
  friendsText: { color: THEME.textSecondary, fontSize: THEME.font.sm, fontWeight: THEME.font.bold },

  webFallback: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  webTitle:    { color: THEME.textSecondary, fontSize: THEME.font.lg, fontWeight: THEME.font.bold },
  webSub:      { color: THEME.textTertiary, fontSize: THEME.font.sm },
});