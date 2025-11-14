// components/MiniPlayer.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { usePlayer } from "../context/PlayerContext";
import { colors } from "../theme/colors";

export default function MiniPlayer() {
  const { currentTrack, isPlaying, controls, position, duration } = usePlayer();
  const nav = useNavigation<any>();

  // Radio sekmesindeyken mini player görünmesin
  const isOnRadio = useNavigationState((state: any) => {
    const root = state.routes[state.index];
    if (root?.name !== "Tabs") return false;
    const tabState = root.state ?? root.params?.state;
    if (!tabState) return false;
    const activeTab = tabState.routes[tabState.index]?.name;
    return activeTab === "Radio";
  });

  if (!currentTrack || isOnRadio) return null;

  const progress =
    duration > 0 ? Math.min(Math.max(position / duration, 0), 1) : 0;

  const openRadio = () =>
    (nav as any).navigate("Tabs", { screen: "Radio" });

  const onToggle = (e: any) => {
    e.stopPropagation(); // üstteki Pressable'a gitmesin
    controls?.toggle?.();
  };

  return (
    <Pressable style={styles.container} onPress={openRadio}>
      {/* Şarkı bilgisi */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {currentTrack.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {currentTrack.artist}
        </Text>
      </View>

      {/* Play / Pause */}
      <Pressable
        onPress={onToggle}
        hitSlop={10}
        style={styles.iconWrapper}
      >
        <Ionicons
          name={isPlaying ? "pause-circle" : "play-circle"}
          size={30}
          color={colors.lilac}
        />
      </Pressable>

      {/* Alttaki ince progress bar */}
      <View pointerEvents="none" style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 60, // tab bar'ın biraz üstünde kalsın
    backgroundColor: "#1b103b",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: "#ffffff",
    fontWeight: "700",
  },
  artist: {
    color: "#9ca3af",
    fontSize: 12,
    marginTop: 2,
  },
  iconWrapper: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  progressTrack: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.lilac,
  },
});
