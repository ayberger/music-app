// auth.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_KEY = "auth_v1";

export type AuthData = {
  email: string;
  remember: boolean;
  expiresAt?: number; // eklendi
};

// Yardımcı: TTL’den bitiş zamanı üret
function makeExpiresAt(remember: boolean, ttlMinutes?: number) {
  // remember=true ise örn. 30 gün; değilse parametre (default 120 dk)
  const ttlMs = (ttlMinutes ?? 30) * 60 * 1000;
  return Date.now() + ttlMs;
}

export async function saveAuth(data: { email: string; remember: boolean; ttlMinutes?: number }) {
  const expiresAt = makeExpiresAt(data.remember, data.ttlMinutes);
  const payload: AuthData = { email: data.email, remember: data.remember, expiresAt };
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export async function getAuth(): Promise<AuthData | null> {
  const raw = await AsyncStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    const parsed: AuthData = JSON.parse(raw);
    // expiresAt yoksa (eski kayıt) ya da süresi dolduysa null döndür
    if (typeof parsed.expiresAt === "number" && parsed.expiresAt < Date.now()) {
      await AsyncStorage.removeItem(AUTH_KEY);
      return null;
    }
    return parsed;
  } catch {
    await AsyncStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export async function clearAuth() {
  await AsyncStorage.removeItem(AUTH_KEY);
}
