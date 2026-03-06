import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { THEME } from "./constants/Theme";

// SCREENS
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import VibeScreen from "./screens/VibeScreen";
import HomeScreen from "./screens/HomeScreen";
import MessageScreen from "./screens/MessageScreen";
import ProfileScreen from "./screens/ProfileScreen";
import SearchScreen from "./screens/SearchScreen";
import MapScreen from "./screens/MapScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// =====================
// MAIN TABS
// =====================
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        safeAreaInsets: { bottom: 0, left: 0, right: 0 },

        tabBarItemStyle: {
          flex: 1,
          height: 70,
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarIconStyle: {
          top: 15,
        },

        tabBarStyle: {
          position: "absolute",
          bottom: 30,
          left: 20,
          right: 20,
          backgroundColor: "#0A0A0A",
          borderRadius: 35,
          height: 70,
          borderTopWidth: 0,
          paddingBottom: 0,
          elevation: 10,
        },

        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#444",

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = size;

          if (route.name === "Feed") iconName = "home";
          else if (route.name === "Search") iconName = "search";
          else if (route.name === "Post") {
            iconName = "add-circle";
            iconSize = 36;
          }
          else if (route.name === "Messages") iconName = "chatbubble";
          else if (route.name === "Profile") iconName = "person";

          return (
            <Ionicons
              name={focused ? iconName : iconName + "-outline"}
              size={iconSize}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />

      <Tab.Screen
        name="Post"
        component={View}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Feed", { openPostModal: true });
          },
        })}
      />

      <Tab.Screen name="Messages" component={MessageScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


// =====================
// ROOT STACK (IMPORTANT)
// =====================
function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Map" component={MapScreen} />
    </Stack.Navigator>
  );
}


// =====================
// MAIN APP
// =====================
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [currentScreen, setCurrentScreen] = useState("LANDING");

  useEffect(() => {
    const timer = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
        if (authenticatedUser) {
          const userDoc = await getDoc(doc(db, "users", authenticatedUser.uid));
          if (userDoc.exists() && userDoc.data().vibes?.length >= 3) {
            setNeedsOnboarding(false);
          } else {
            setNeedsOnboarding(true);
          }
          setUser(authenticatedUser);
        } else {
          setUser(null);
          setNeedsOnboarding(false);
        }
        setIsLoading(false);
      });
      return unsubscribe;
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert("Login Error", error.message);
    }
  };

  const handleSignUp = async (email, password, name) => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        name,
        email,
        vibes: [],
        createdAt: new Date(),
      });
      setNeedsOnboarding(true);
    } catch (error) {
      Alert.alert("Signup Error", error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.logo}>AMITY</Text>
        <Text style={[styles.logo, { color: THEME.accent }]}>CONNECT</Text>
        <ActivityIndicator size="small" color={THEME.accent} style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (!user) {
    if (currentScreen === "LANDING") {
      return <LandingScreen onGoSignup={() => setCurrentScreen("SIGNUP")} onGoLogin={() => setCurrentScreen("LOGIN")} />;
    }
    if (currentScreen === "LOGIN") {
      return <LoginScreen onLogin={handleLogin} onSignUp={() => setCurrentScreen("SIGNUP")} />;
    }
    if (currentScreen === "SIGNUP") {
      return <SignupScreen onSignUp={handleSignUp} onLogin={() => setCurrentScreen("LOGIN")} />;
    }
  }

  if (needsOnboarding) {
    return <VibeScreen onNext={() => setNeedsOnboarding(false)} />;
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

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    fontSize: 40,
    fontWeight: "900",
    color: "#FFF",
    letterSpacing: 5,
  },
});