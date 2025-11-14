import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext"; // 🔹 ekledik

type Props = { onProfilePress: () => void };

export default function HomeHeader({ onProfilePress }: Props) {
  const { isLogged } = useAuth(); // 🔹 login durumu

  return (
    <View style={styles.header}>
      <Text style={styles.title}>New Drops</Text>

      <Pressable onPress={onProfilePress} hitSlop={8}>
        {isLogged ? (
          // 🔹 Giriş yapılmışsa: kişi ikonu
          <Ionicons name="person-circle" size={28} color={colors.lilac100} />
        ) : (
          // 🔹 Giriş yapılmamışsa: "Login" butonu
          <View style={styles.loginButton}>
            <Text style={styles.loginText}>Login</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.lilac100,
  },
  // 🔹 Eklenen stiller:
  loginButton: {
    backgroundColor: colors.lilac,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 60,
    minHeight: 30,
    alignItems: "center",       
    justifyContent: "center",
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
