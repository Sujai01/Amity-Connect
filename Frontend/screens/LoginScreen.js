// ============================================================
// LoginScreen.js
// ============================================================
import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../constants/Theme";
import { GlobalStyles } from "../constants/Color";

export default function LoginScreen({ onLogin, onSignUp }) {
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  // Micro-shake animation for errors
  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password) { triggerShake(); return; }
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (e) {
      triggerShake();
      Alert.alert("Login Failed", "Check your email and password.");
    }
    setLoading(false);
  };

  const inputStyle = (focused) => [
    styles.inputWrapper,
    focused && styles.inputFocused,
  ];

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Blob */}
        <View style={styles.blob} />

        {/* Logo mark */}
        <View style={styles.logoMark}>
          <LinearGradient colors={THEME.gradientAccent} style={styles.logoGradient}>
            <Ionicons name="people" size={28} color="#fff" />
          </LinearGradient>
          <Text style={styles.logoText}>Amity Connect</Text>
        </View>

        <Animated.View style={[styles.card, { transform: [{ translateX: shake }] }]}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your campus circle</Text>

          {/* Email */}
          <View style={inputStyle(emailFocus)}>
            <Ionicons name="mail-outline" size={20} color={emailFocus ? THEME.accent : THEME.textTertiary} />
            <TextInput
              style={styles.inputText}
              placeholder="Email"
              placeholderTextColor={THEME.textTertiary}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />
          </View>

          {/* Password */}
          <View style={inputStyle(passFocus)}>
            <Ionicons name="lock-closed-outline" size={20} color={passFocus ? THEME.accent : THEME.textTertiary} />
            <TextInput
              style={[styles.inputText, { flex: 1 }]}
              placeholder="Password"
              placeholderTextColor={THEME.textTertiary}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPassFocus(true)}
              onBlur={() => setPassFocus(false)}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-outline" : "eye-off-outline"} size={18} color={THEME.textTertiary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={loading}>
            <LinearGradient
              colors={THEME.gradientAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Sign In</Text>
              }
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity onPress={onSignUp} style={styles.switchBtn}>
            <Text style={styles.switchText}>
              New here?{" "}
              <Text style={{ color: THEME.accent, fontWeight: THEME.font.bold }}>
                Create an account
              </Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: THEME.space.xl,
    paddingBottom: 60,
  },
  blob: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: THEME.accent,
    opacity: 0.06,
    top: -60,
    right: -80,
  },
  logoMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: THEME.space.xxxl,
    alignSelf: "center",
  },
  logoGradient: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: THEME.font.lg,
    fontWeight: THEME.font.extrabold,
    color: THEME.textPrimary,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: THEME.surface,
    borderRadius: THEME.radius.xxl,
    padding: THEME.space.xxl,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  title: {
    fontSize: THEME.font.xxl,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -0.5,
    marginBottom: THEME.space.xs,
  },
  subtitle: {
    fontSize: THEME.font.sm,
    color: THEME.textTertiary,
    marginBottom: THEME.space.xxl,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: THEME.radius.lg,
    paddingHorizontal: THEME.space.lg,
    paddingVertical: 14,
    marginBottom: THEME.space.md,
    gap: 10,
  },
  inputFocused: {
    borderColor: THEME.accentBorder,
    backgroundColor: THEME.accentMuted,
  },
  inputText: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: THEME.font.md,
    fontWeight: THEME.font.medium,
  },
  primaryBtn: {
    borderRadius: THEME.radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: THEME.space.sm,
    shadowColor: THEME.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: THEME.font.md,
    fontWeight: THEME.font.bold,
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: THEME.space.xl,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
  },
  dividerText: {
    color: THEME.textTertiary,
    fontSize: THEME.font.sm,
    fontWeight: THEME.font.medium,
  },
  switchBtn: { alignItems: "center" },
  switchText: {
    color: THEME.textTertiary,
    fontSize: THEME.font.sm,
  },
});
