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

export default function SignupScreen({ onSignUp, onLogin }) {
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [nameFocus,  setNameFocus]  = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus,  setPassFocus]  = useState(false);

  const shake = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shake, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      triggerShake();
      Alert.alert("Almost there", "Fill in all fields. Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await onSignUp(email, password, name);
    } catch (e) {
      triggerShake();
      Alert.alert("Signup Failed", e.message || "Something went wrong.");
    }
    setLoading(false);
  };

  // Password strength indicator
  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;
  const strengthColor = ["transparent", THEME.danger, THEME.warm, THEME.live][strength];
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];

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
        <View style={styles.blob} />

        {/* Back button */}
        <TouchableOpacity onPress={onLogin} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={THEME.textSecondary} />
          <Text style={styles.backText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join 5,000+ students at Amity Greater Noida</Text>

        <Animated.View style={{ transform: [{ translateX: shake }] }}>

          {/* Name */}
          <View style={inputStyle(nameFocus)}>
            <Ionicons name="person-outline" size={20} color={nameFocus ? THEME.accent : THEME.textTertiary} />
            <TextInput
              style={styles.inputText}
              placeholder="Full Name"
              placeholderTextColor={THEME.textTertiary}
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
            />
          </View>

          {/* Email */}
          <View style={inputStyle(emailFocus)}>
            <Ionicons name="mail-outline" size={20} color={emailFocus ? THEME.accent : THEME.textTertiary} />
            <TextInput
              style={styles.inputText}
              placeholder="College Email"
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
              placeholder="Password (min 6 chars)"
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

          {/* Password strength bar */}
          {password.length > 0 && (
            <View style={styles.strengthRow}>
              <View style={styles.strengthTrack}>
                <View style={[styles.strengthFill, { flex: strength / 3, backgroundColor: strengthColor }]} />
                <View style={{ flex: 1 - strength / 3 }} />
              </View>
              <Text style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleSubmit} activeOpacity={0.85} disabled={loading} style={{ marginTop: THEME.space.md }}>
            <LinearGradient
              colors={THEME.gradientAccent}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Create Account</Text>
              }
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={onLogin} style={styles.switchBtn}>
          <Text style={styles.switchText}>
            Already a member?{" "}
            <Text style={{ color: THEME.accent, fontWeight: THEME.font.bold }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: THEME.energy,
    opacity: 0.06,
    bottom: 50,
    left: -80,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: THEME.space.xxxl,
    alignSelf: "flex-start",
  },
  backText: {
    color: THEME.textSecondary,
    fontSize: THEME.font.sm,
    fontWeight: THEME.font.medium,
  },
  title: {
    fontSize: THEME.font.display,
    fontWeight: THEME.font.black,
    color: THEME.textPrimary,
    letterSpacing: -0.8,
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
  strengthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: THEME.space.sm,
    marginTop: -THEME.space.xs,
  },
  strengthTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: THEME.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: THEME.font.xs,
    fontWeight: THEME.font.bold,
    width: 46,
    textAlign: "right",
  },
  primaryBtn: {
    borderRadius: THEME.radius.pill,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
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
  switchBtn: { alignItems: "center", marginTop: THEME.space.xxl },
  switchText: { color: THEME.textTertiary, fontSize: THEME.font.sm },
});