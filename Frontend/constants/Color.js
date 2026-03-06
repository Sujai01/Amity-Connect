import { StyleSheet, Platform } from "react-native";
import { THEME } from "./Theme";

export const COLORS = {
  background: THEME.background,
  card: THEME.card,
  accent: THEME.accent,
  textMain: THEME.textMain,
  textSub: THEME.textSub,
  chipBorder: "#334155",
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: THEME.radius,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: THEME.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textSub,
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === "ios" ? 15 : 12,
    marginBottom: 15,
  },
  inputText: {
    flex: 1,
    color: THEME.textMain,
    marginLeft: 10,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: THEME.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  mainButton: {
    backgroundColor: THEME.accent,
    borderRadius: 30,
    paddingVertical: 18,
    alignItems: "center",
    width: "100%",
  },
});