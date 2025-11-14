import React, { useEffect, useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HomeHeader from "../components/HomeHeader";
import DropCard from "../components/DropCard";
import { fetchTopTracks } from "../lib/spotify";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { TabParamList } from "../navigation/TabNavigator";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { Track } from "../lib/track";

type TabNav = BottomTabNavigationProp<TabParamList>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

type DropItem = {
  id: string;
  title: string;
  subtitle: string;
  year?: string;
  url?: string;
  image: string; // DropCard'ın beklediği alan ismi "image"
};

export default function HomeScreen() {
  const tabNav = useNavigation<TabNav>();      // diğer tablara gitmek için
  const rootNav = useNavigation<RootNav>();    // Profile gibi root ekranlar için
  const { isLogged } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const toDropItem = (t: Track): DropItem => ({
    id: t.id,
    title: t.title,              // Track'taki başlık alanın
    subtitle: t.artist,          // sanatçı(lar)     // varsa yıl (yoksa boş bırak)
    image: t.artwork,             // Spotify'dan çektiğin kapak görseli URL’i
    url: t.url,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const tracks = await fetchTopTracks();
        if (mounted) setTracks(Array.isArray(tracks) ? tracks.slice(0, 20) : []);
      } catch (e) {
        if (mounted) setTracks([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
        ListHeaderComponent={
          <HomeHeader onProfilePress={() => rootNav.navigate(isLogged ? "Profile" : "Login")} />
        }
        data={tracks}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <DropCard
            item={toDropItem(item)}
            onPress={() =>
              tabNav.navigate("Radio", {
                queue: tracks,
                selectedId: item.id,
          })
            }

          />
        )}
      />
    </SafeAreaView>
  );
}
