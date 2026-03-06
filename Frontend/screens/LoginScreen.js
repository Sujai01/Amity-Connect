import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../constants/Color"; // Fixed path
import { THEME } from "../constants/Theme"; // Fixed path
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen({ onLogin, onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <View style={GlobalStyles.container}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View style={GlobalStyles.card}>
            <Ionicons
              name="people-circle-outline"
              size={80}
              color={THEME.accent}
              style={{ alignSelf: "center" }}
            />
            <Text style={[GlobalStyles.title, { textAlign: "center" }]}>
              Welcome Back
            </Text>
            <Text style={[GlobalStyles.subtitle, { textAlign: "center" }]}>
              Login to your community
            </Text>

            <View style={GlobalStyles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={THEME.textSub} />
              <TextInput
                style={GlobalStyles.inputText}
                placeholder="Email"
                placeholderTextColor={THEME.textSub}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <View style={GlobalStyles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={THEME.textSub}
              />
              <TextInput
                style={GlobalStyles.inputText}
                placeholder="Password"
                secureTextEntry
                placeholderTextColor={THEME.textSub}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={GlobalStyles.primaryButton}
              onPress={() => onLogin(email, password)}
            >
              <Text style={GlobalStyles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onSignUp} style={{ marginTop: 20 }}>
              <Text style={{ color: THEME.accent, textAlign: "center" }}>
                Don't have an account? Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}