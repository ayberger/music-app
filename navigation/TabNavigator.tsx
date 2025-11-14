// src/navigation/TabNavigator.tsx
import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import LibraryScreen from "../screens/LibraryScreen";
import RadioScreen from "../screens/RadioScreen";
import SearchScreen from "../screens/SearchScreen";
import { useIsFocused } from "@react-navigation/native";
import { colors } from "../theme/colors";
import type { Track } from "../lib/track";
import MiniPlayer from "../components/MiniPlayer";
import { usePlayer } from "../context/PlayerContext";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetTextInput,
  type BottomSheetBackdropProps,   // ⬅️ EKLE
} from "@gorhom/bottom-sheet";
import { useAuth } from "../context/AuthContext";

export type TabParamList = {
  Home: undefined;
  Library: undefined;
  Radio: 
    | {
        track?: Track;        // tek parça ile geliyorsan
        queue?: Track[];      // liste olarak da gelebilsin
        selectedId?: string;  // hangi parçadan başlayacağını bilsin
      }
    | undefined;
  Search: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// --- Radio koruması: login yoksa bottom sheet aç, Radio render etme
type RadioProps = React.ComponentProps<typeof RadioScreen>;
function RadioGate(props: RadioProps & { openLogin: () => void }) {
  const { isLogged } = useAuth();
  const isFocused = useIsFocused(); // 🔹 sekme gerçekten odakta mı kontrol et

  useEffect(() => {
    // 🔹 sadece Radio sekmesi odaktayken ve login değilken sheet aç
    if (isFocused && !isLogged) {
      props.openLogin();
    }
  }, [isFocused, isLogged, props]);

  return isLogged ? <RadioScreen {...props} /> : null;
}


export default function TabNavigator() {
  const { isLogged, signIn } = useAuth();
  const { currentTrack } = usePlayer();
  const tabNav = useNavigation();

  // ---- Bottom sheet (login) ----
  const sheetRef = useRef<BottomSheetModal>(null);
  const rootHostRef = useRef<View>(null); // 👈 native host view
  const snapPoints = useMemo(() => ["55%"], []);
  const openLogin = useCallback(() => sheetRef.current?.present(), []);
  const closeLogin = useCallback(() => sheetRef.current?.dismiss(), []);

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}      // sheet açılınca görünür
      disappearsOnIndex={-1}  // kapanınca kaybolur
      opacity={0.6}           // karartma miktarı (0–1)
      pressBehavior="none"    // tıklamayı yut; arkaya tık geçmesin
    />
  ), []);

  // basit form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const onSheetLogin = useCallback(async () => {
    if (!email.includes("@") || password.length < 4) return;
    await signIn(email, true, 30); // 30 dk TTL
    closeLogin();
    (tabNav as any).navigate("Tabs", { screen: "Radio" });

  }, [email, password, signIn, closeLogin, tabNav]);

  return (
    // 👇 Fragment yerine TEK bir native host view kullan
    <View ref={rootHostRef} style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            height: 64,
            paddingBottom: 10,
            backgroundColor: "#0a0a0a",
            borderTopColor: "rgba(255,255,255,0.06)",
          },
          tabBarActiveTintColor: colors.lilac,
          tabBarInactiveTintColor: "#9ca3af",
          tabBarIcon: ({ color, size }) => {
            const map: Record<keyof TabParamList, string> = {
              Home: "play-circle",
              Library: "musical-notes",
              Radio: "radio",
              Search: "search",
            };
            const name = map[route.name as keyof TabParamList] as any;
            return <Ionicons name={name} size={size + 4} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Library" component={LibraryScreen} />
        <Tab.Screen
          name="Radio"
          children={(p) => <RadioGate {...p} openLogin={openLogin} />}
          listeners={{
            tabPress: (e) => {
              if (!isLogged) {
                e.preventDefault();
                openLogin();
              }
            },
          }}
        />
        <Tab.Screen name="Search" component={SearchScreen} />
      </Tab.Navigator>

      {/* Eski: <MiniPlayer /> */}
      {isLogged && currentTrack ? <MiniPlayer /> : null}


      {/* --- Login Bottom Sheet --- */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: "#1b103b" }}
        handleIndicatorStyle={{ backgroundColor: "#7c3aed" }}
        keyboardBehavior="interactive"     // ⬅️ klavye açıldığında sheet yukarı kayar
        keyboardBlurBehavior="restore"     // ⬅️ klavye kapanınca eski yerine iner
      >
        
        <BottomSheetScrollView 
          contentContainerStyle={{ padding: 16, gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18, marginBottom: 6 }}>
            Sign in to continue
          </Text>

          <BottomSheetTextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <BottomSheetTextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable onPress={onSheetLogin} style={styles.cta}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Sign in</Text>
          </Pressable>

          <Pressable
            onPress={closeLogin}
            style={[styles.cta, { backgroundColor: "rgba(255,255,255,0.12)" }]}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>Cancel</Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#1f2937",
    color: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  cta: {
    backgroundColor: colors.lilac,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
});
