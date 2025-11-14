import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import { colors } from "../theme/colors";

export type RootStackParamList = {
  // Tabs içindeki hedef tab'ı seçebilmek için optional screen paramı
  Tabs: { screen?: "Home" | "Library" | "Radio" | "Search" } | undefined;
  // Login'e nereden geldiğimizi söylemek için optional redirect paramı
  Login: { redirectToTab?: "Home" | "Library" | "Radio" | "Search" } | undefined;
  Profile: undefined;
};


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.white,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {/* 1) Her zaman Tabs ilk ekran */}
      <Stack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />

      {/* 2) Login'i modal gibi üstte aç */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false, presentation: "modal" }}
      />

      {/* 3) (İstersen) Profile ayrı bir stack ekranı da kalsın */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
