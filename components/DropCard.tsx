import React from "react";
import { View, Text, Image, StyleSheet, Pressable, GestureResponderEvent } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../theme/colors";
import { useNavigation, TabActions } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { Track, toTrack } from "../lib/track";


export type DropItem = {
  id: string;
  title: string;
  subtitle: string;
  year?: string;
  image: string;
  url?: string;
  artist?: string;
  artwork?: string;
  cover?: string;
  img?: string;
};

type Props = {
  item: DropItem;
  onPress?: () => void;          // Kartın tamamına tıklandığında
  onPlayPress?: () => void;      // Play ikonuna tıklandığında
};

export default function DropCard({ item, onPress, onPlayPress }: Props) {
  const navigation = useNavigation<any>();
  const { isLogged } = useAuth();
  const cover =
    (item as any).artwork ??
    (item as any).img ??
    (item as any).image ??
    (item as any).cover ??
    null;
  const subtitle = (item as any).subtitle ?? (item as any).artist ?? "";
  const handlePlay = (e: GestureResponderEvent) => {
    // içteki tıklama dıştaki Pressable'ı tetiklemesin
    // (RN sürümüne göre stopPropagation olmayabilir; opsiyonel zincir var)
    (e.stopPropagation as any)?.();
    onPlayPress?.();
  };

  const handleCardPress = () => {
    if (onPress) return onPress();  // ❗ props.onPress değil, destructured onPress

    if (!isLogged) {
      const tabNav = navigation.getParent();               // bottom tabs
      const radioRoute = tabNav?.getState()?.routes?.find((r: any) => r.name === "Radio");
      if (radioRoute) {
        tabNav?.emit({
          type: "tabPress",
          target: radioRoute.key,
          canPreventDefault: true,
        });
      } else {
        navigation.navigate("Radio", { askLogin: true });  // emniyet supabı
      }
      return;
    }

    navigation.navigate("Radio");  // girişliyse normal geçiş
  };

  return (
    <Pressable style={styles.card} onPress={handleCardPress} android_ripple={{ color: "rgba(255,255,255,0.08)" }}>
      
      {cover ? (
        <Image source={{ uri: cover }} style={styles.img} />
      ) : (
      // placeholder istersen buraya local görsel ya da boş View koy
      <View style={[styles.img, { backgroundColor: "#111" }]} />
      )}
      <View style={styles.footer}>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
          <Text style={styles.meta}>{item.year}</Text>
        </View>

        <Pressable onPress={handlePlay} hitSlop={8} style={styles.play}>
          <Ionicons name="play" size={22} color={colors.lilac} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  img: { width: "100%", height: 160 },
  footer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.lilac,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { color: colors.white, fontWeight: "800", fontSize: 16 },
  subtitle: { color: colors.lilac50, fontSize: 13, marginTop: 2 },
  meta: { color: colors.lilac100, fontSize: 11, marginTop: 2, opacity: 0.9 },
  play: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#ede9fe",
    alignItems: "center", justifyContent: "center",
  },
});
