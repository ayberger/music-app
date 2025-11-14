import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import AppNavigator from "./navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { colors } from "./theme/colors";
import { AuthProvider } from "./context/AuthContext";
import { hideSplash } from "react-native-splash-view"; // ✅ named import, default değil
import { PlayerProvider } from "./context/PlayerContext";

export default function App() {

  // App.tsx (geçici)
  useEffect(() => {
  // Hermes?
  // @ts-ignore
    console.log('JS engine:', global.HermesInternal ? 'Hermes' : 'JSC');
  // Fabric?
  // @ts-ignore
    console.log('Fabric:', global.nativeFabricUIManager ? 'ON' : 'OFF');
  }, []);

  useEffect(() => {
    hideSplash(); // ✅ JS hazır olunca splash'ı kapat
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: colors.bg },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <NavigationContainer theme={theme}>
            <AuthProvider>
              <PlayerProvider>
                <AppNavigator />
              </PlayerProvider>
            </AuthProvider>
          </NavigationContainer>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
