import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons"; // 🔹 eklendi
import { Track } from "../lib/track";

export default function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const route = useRoute();
  const { redirectToTab, track } = (route.params ?? {}) as { redirectToTab?: "Home" | "Library" | "Radio" | "Search", track?: Track};

  const onSignIn = async () => {
    if (!email.includes("@") || password.length < 4) {
      Alert.alert("Hata", "Geçerli e-posta ve en az 4 karakter şifre girin.");
      return;
    }
    await signIn(email, true, 30);
    if (redirectToTab) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Tabs" as never, params: { screen: redirectToTab, params: track ? { track } : undefined } as never }],
      });
    } else {
        navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔹 Geri dönme butonu */}
      <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={26} color="#fff" />
      </Pressable>

      <Text style={styles.title}>Sign in</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable onPress={onSignIn} style={styles.button}>
        <Text style={styles.buttonText}>Sign in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
    justifyContent: "center",
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1f2937",
    color: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  button: {
    backgroundColor: colors.lilac,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // 🔹 Yeni back butonu stili
  backBtn: {
    position: "absolute",
    top: 40,
    left: 16,
    padding: 6,
    zIndex: 2,
  },
});
