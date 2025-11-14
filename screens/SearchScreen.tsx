import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, StyleSheet, FlatList, Text, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { colors } from "../theme/colors";
import { drops } from "../data/drops";
import DropCard from "../components/DropCard";
import { toTrack } from "../lib/track";
import type { TabParamList } from "../navigation/TabNavigator";

type Drop = (typeof drops)[number];
type TabNav = BottomTabNavigationProp<TabParamList>;

export default function SearchScreen() {
  const nav = useNavigation<TabNav>();

  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");

  // debounce: 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const results: Drop[] = useMemo(() => {
    if (!debounced) return [];
    const s = debounced.toLowerCase();
    return drops.filter((d) => {
      const title = (d as any).title ?? (d as any).name ?? "";
      const artist = (d as any).artist ?? (d as any).subtitle ?? "";
      return String(title).toLowerCase().includes(s) || String(artist).toLowerCase().includes(s);
    });
  }, [debounced]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={20} color="#9ca3af" style={{ marginHorizontal: 10 }} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search songs, artists…"
          placeholderTextColor="#9ca3af"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {q.length > 0 && (
          <Pressable onPress={() => setQ("")} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#cbd5e1" />
          </Pressable>
        )}
      </View>

      {/* Results / empty states */}
      {debounced.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={36} color="#6b7280" />
          <Text style={styles.emptyText}>Start typing to search…</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="alert-circle-outline" size={36} color="#6b7280" />
          <Text style={styles.emptyText}>No results for “{debounced}”</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          data={results}
          keyExtractor={(i) => String((i as any).id)}
          renderItem={({ item }) => (
            <DropCard
              item={item}
              onPress={() => nav.navigate("Radio", { track: toTrack(item) })}
              onPlayPress={() => nav.navigate("Radio", { track: toTrack(item) })}
            />
          )}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    marginTop: 8,
    marginHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  input: {
    flex: 1,
    color: "#fff",
    paddingVertical: 12,
    fontSize: 16,
  },
  clearBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyText: { color: "#9ca3af" },
});
