// ProfileScreen.tsx
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, Pressable } from "react-native";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const { isLogged, signOut } = useAuth();
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    if (isFocused && !isLogged) {
      navigation.navigate("Login" as never);
    }
  }, [isFocused, isLogged, navigation]);

  if (!isLogged) {
    return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  // 🔽 EKLEDİĞİMİZ KISIM: çıkış + Home'a dönüş
  const handleLogout = async () => {
    await signOut();
    // Tabs kökünün altındaki Home'a git
    (navigation as any).navigate("Tabs", { screen: "Home" });
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
        My Profile
      </Text>

      {/* ⬇️ Burada onPress'i handleLogout yaptık */}
      <Pressable
        onPress={handleLogout}
        style={{
          backgroundColor: "#ef4444",
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>Log out</Text>
      </Pressable>
    </SafeAreaView>
  );
}
