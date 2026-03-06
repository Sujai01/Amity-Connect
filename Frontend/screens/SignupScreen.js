import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GlobalStyles } from "../constants/Color";
import { THEME } from "../constants/Theme";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignupScreen({ onSignUp, onLogin }) {
  const [name, setName] = useState("");
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
          <Text style={GlobalStyles.title}>Create Account</Text>
          <Text style={GlobalStyles.subtitle}>Join your community today</Text>

          <View style={GlobalStyles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={THEME.textSub} />
            <TextInput
              style={GlobalStyles.inputText}
              placeholder="Full Name"
              placeholderTextColor={THEME.textSub}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={GlobalStyles.inputWrapper}>
            <Ionicons name="mail-outline" size={20} color={THEME.textSub} />
            <TextInput
              style={GlobalStyles.inputText}
              placeholder="Email"
              placeholderTextColor={THEME.textSub}
              value={email}
              onChangeText={setEmail}
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
            onPress={() => onSignUp(email, password, name)}
          >
            <Text style={GlobalStyles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onLogin} style={{ marginTop: 20 }}>
            <Text style={{ color: THEME.accent, textAlign: "center" }}>
              Already have an account? Log In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}