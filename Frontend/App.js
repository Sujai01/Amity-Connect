import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, StatusBar, Animated, Easing,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { THEME } from "./constants/Theme";

import LandingScreen  from "./screens/LandingScreen";
import LoginScreen    from "./screens/LoginScreen";
import SignupScreen   from "./screens/SignupScreen";
import VibeScreen     from "./screens/VibeScreen";
import HomeScreen     from "./screens/HomeScreen";
import MessageScreen  from "./screens/MessageScreen";
import ProfileScreen  from "./screens/ProfileScreen";
import SearchScreen   from "./screens/SearchScreen";
import MapScreen      from "./screens/MapScreen";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─── TAB BAR ──────────────────────────────────────────────────────────────────
// Custom floating tab bar with glass blur + accent indicator dot
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.wrapper} pointerEvents="box-none">
      <BlurView intensity={60} tint="dark" style={tabStyles.blur}>
        <View style={tabStyles.inner}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const isPost    = route.name === "Post";

            const icons = {
              Feed:     ["home",        "home-outline"],
              Search:   ["search",      "search-outline"],
              Post:     ["add-circle",  "add-circle-outline"],
              Messages: ["chatbubble",  "chatbubble-outline"],
              Profile:  ["person",      "person-outline"],
            };

            const [activeIcon, inactiveIcon] = icons[route.name] || ["ellipse", "ellipse-outline"];

            const onPress = () => {
              if (isPost) {
                navigation.navigate("Feed", { openPostModal: true });
                return;
              }
              if (!isFocused) navigation.navigate(route.name);
            };

            if (isPost) {
              return (
                <View key={route.key} style={tabStyles.tabItem}>
                  <LinearGradient
                    colors={THEME.gradientAccent}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={tabStyles.postBtn}
                  >
                    <Ionicons
                      name="add"
                      size={26}
                      color="#fff"
                      onPress={onPress}
                      style={{ width: 48, height: 48, textAlign: "center", lineHeight: 48 }}
                    />
                  </LinearGradient>
                </View>
              );
            }

            return (
              <View key={route.key} style={tabStyles.tabItem}>
                <Ionicons
                  name={isFocused ? activeIcon : inactiveIcon}
                  size={24}
                  color={isFocused ? THEME.accent : "rgba(255,255,255,0.30)"}
                  onPress={onPress}
                />
                {isFocused && <View style={tabStyles.dot} />}
              </View>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 28,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  blur: {
    width: "100%",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: THEME.glassBorder,
  },
  inner: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: THEME.glassDark,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.accent,
  },
  postBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});

// ─── MAIN TABS ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Feed"     component={HomeScreen} />
      <Tab.Screen name="Search"   component={SearchScreen} />
      <Tab.Screen name="Post"     component={View} />
      <Tab.Screen name="Messages" component={MessageScreen} />
      <Tab.Screen name="Profile"  component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// ─── ROOT STACK ────────────────────────────────────────────────────────────────
function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade_from_bottom",
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Map"      component={MapScreen} />
    </Stack.Navigator>
  );
}

// ─── ANIMATED SPLASH ───────────────────────────────────────────────────────────
// HOW IT WORKS:
// Three Animated.Values control opacity + position of title words.
// useEffect triggers them sequentially with staggered delays.
// The logo pulses with a looping scale animation while loading.
function SplashScreen() {
  const amityOpacity = useRef(new Animated.Value(0)).current;
  const connectOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const amityY = useRef(new Animated.Value(20)).current;
  const connectY = useRef(new Animated.Value(20)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Word-by-word entrance
    Animated.sequence([
      Animated.parallel([
        Animated.timing(amityOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(amityY,       { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(connectOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(connectY,       { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();

    // Pulse loop on the dot indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.15, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1,    duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={splash.container}>
      <StatusBar barStyle="light-content" />

      {/* Ambient glow blobs */}
      <View style={[splash.blob, { top: "20%", left: "10%", backgroundColor: THEME.accent }]} />
      <View style={[splash.blob, { bottom: "25%", right: "5%",  backgroundColor: THEME.energy, width: 200, height: 200 }]} />

      <View style={splash.content}>
        <Animated.Text style={[splash.wordAmity, { opacity: amityOpacity, transform: [{ translateY: amityY }] }]}>
          AMITY
        </Animated.Text>
        <Animated.Text style={[splash.wordConnect, { opacity: connectOpacity, transform: [{ translateY: connectY }] }]}>
          CONNECT
        </Animated.Text>
        <Animated.Text style={[splash.subtitle, { opacity: subtitleOpacity }]}>
          Your campus, your circle
        </Animated.Text>

        <Animated.View style={[splash.pulse, { transform: [{ scale: pulseScale }] }]}>
          <LinearGradient colors={THEME.gradientAccent} style={splash.pulseDot} />
        </Animated.View>
      </View>
    </View>
  );
}

const splash = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.07,
  },
  content: { alignItems: "center" },
  wordAmity: {
    fontSize: 52,
    fontWeight: "900",
    color: THEME.textPrimary,
    letterSpacing: 10,
  },
  wordConnect: {
    fontSize: 52,
    fontWeight: "900",
    color: THEME.accent,
    letterSpacing: 10,
    marginTop: -8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textTertiary,
    letterSpacing: 3,
    marginTop: 16,
    textTransform: "uppercase",
  },
  pulse: { marginTop: 48 },
  pulseDot: { width: 10, height: 10, borderRadius: 5 },
});

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoading,       setIsLoading]       = useState(true);
  const [user,            setUser]            = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentScreen,   setCurrentScreen]   = useState("LANDING");

  useEffect(() => {
    // 2.5s splash — slightly shorter than original 3s, feels snappier
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (authedUser) => {
        if (authedUser) {
          const snap = await getDoc(doc(db, "users", authedUser.uid));
          setNeedsOnboarding(!(snap.exists() && snap.data().vibes?.length >= 3));
          setUser(authedUser);
        } else {
          setUser(null);
          setNeedsOnboarding(false);
        }
        setIsLoading(false);
      });
      return unsubscribe;
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (email, password) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const handleSignUp = async (email, password, name) => {
    const { user: newUser } = await createUserWithEmailAndPassword(auth, email.trim(), password);
    await setDoc(doc(db, "users", newUser.uid), {
      uid: newUser.uid, name, email, vibes: [], createdAt: new Date(),
    });
    setNeedsOnboarding(true);
  };

  if (isLoading)       return <SplashScreen />;
  if (needsOnboarding) return <VibeScreen onNext={() => setNeedsOnboarding(false)} />;

  if (!user) {
    if (currentScreen === "LANDING") return <LandingScreen onGoSignup={() => setCurrentScreen("SIGNUP")} onGoLogin={() => setCurrentScreen("LOGIN")} />;
    if (currentScreen === "LOGIN")   return <LoginScreen   onLogin={handleLogin}   onSignUp={() => setCurrentScreen("SIGNUP")} />;
    if (currentScreen === "SIGNUP")  return <SignupScreen  onSignUp={handleSignUp} onLogin={() => setCurrentScreen("LOGIN")} />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="light-content" />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}