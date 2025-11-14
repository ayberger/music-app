import React, { useMemo } from "react";
import { View, Text, StyleSheet, ImageBackground, Dimensions, Image, Pressable, FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Carousel from "react-native-reanimated-carousel";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { colors } from "../theme/colors";
import type { TabParamList } from "../navigation/TabNavigator";
import type { RootStackParamList } from "../navigation/AppNavigator";

const { width } = Dimensions.get("window");

const categories = [
  { id: "1", title: "Hip-Hop", img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop" },
  { id: "2", title: "Pop",     img: "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?q=80&w=1200&auto=format&fit=crop" },
  { id: "3", title: "Rock",    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1200&auto=format&fit=crop" },
  { id: "4", title: "Jazz",    img: "https://images.unsplash.com/photo-1483412033650-1015ddeb83d1?q=80&w=1200&auto=format&fit=crop" },
];

const trending = [
  { id: "t1", title: "Jim Sings",   subtitle: "Dreaming",  img: "https://images.unsplash.com/photo-1497032205916-ac775f0649ae?q=80&w=800&auto=format&fit=crop" },
  { id: "t2", title: "Mila Morano", subtitle: "La Questa",  img: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop" },
  { id: "t3", title: "Aria Moon",   subtitle: "Shimmer",   img: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=2070" },
];

type TabNav = BottomTabNavigationProp<TabParamList>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export default function LibraryScreen() {
  const carouselWidth = useMemo(() => width - 32, []);
  const cardHeight = 350;

  // Tab nav (gerekirse diğer tablara geçiş için), Root nav (Profile için)
  const tabNav = useNavigation<TabNav>();
  const rootNav = useNavigation<RootNav>();
   const { isLogged } = useAuth();

   return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>

        {/* ↓ değişti */}
        <Pressable
          style={styles.profileBtn}
          onPress={() => rootNav.navigate(isLogged ? "Profile" : "Login")}
        >
          {isLogged ? (
            <Ionicons name="person-circle" size={28} color={colors.lilac100} />
          ) : (
            <View
              style={{
                backgroundColor: colors.lilac,
                borderRadius: 10,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                Login
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Dikey scroll içerik */}
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 16 }}>
          {/* Categories */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>

          <Carousel
            width={carouselWidth}
            height={cardHeight}
            style={{ width: carouselWidth, alignSelf: "center", marginTop: 8, marginBottom: 18 }}
            loop
            autoPlay
            autoPlayInterval={2600}
            data={categories}
            pagingEnabled
            renderItem={({ item }) => <CategoryCard item={item} height={cardHeight} />}
          />

          {/* Trending */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Trending Right Now</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>

          <FlatList
            horizontal
            data={trending}
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => <TrendingCard item={item} />}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({ item, height }: { item: { title: string; img: string }; height: number }) {
  return (
    <ImageBackground
      source={{ uri: item.img }}
      resizeMode="cover"
      style={[styles.catCard, { height }]}
      imageStyle={styles.catImg}
    >
      <View style={styles.catOverlay} />
      <Text style={styles.catText}>{item.title}</Text>
    </ImageBackground>
  );
}

function TrendingCard({ item }: { item: { title: string; subtitle: string; img: string } }) {
  return (
    <View style={styles.trendCard}>
      <Image source={{ uri: item.img }} style={styles.trendImg} />
      <Text style={styles.trendTitle}>{item.title}</Text>
      <Text style={styles.trendSub}>{item.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 32, fontWeight: "800", color: "#c4b5fd" },
  profileBtn: { padding: 4 },

  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },

  catCard: { width: "100%", borderRadius: 16, overflow: "hidden", justifyContent: "flex-end", padding: 16, backgroundColor: "#111" },
  catImg: { borderRadius: 16 },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  catText: { color: "#fff", fontSize: 32, fontWeight: "900" },

  trendCard: { width: 160, marginTop: 8 },
  trendImg: { width: 160, height: 120, borderRadius: 12, marginBottom: 6, backgroundColor: "#111" },
  trendTitle: { color: "#fff", fontWeight: "700" },
  trendSub: { color: "#cbd5e1", marginTop: 2, fontSize: 12 },
});
