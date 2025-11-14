// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, saveAuth, clearAuth } from "../lib/auth";

type AuthCtx = {
  isLogged: boolean;
  signIn: (email: string, remember?: boolean, ttlMinutes?: number) => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLogged, setIsLogged] = useState(false);

  // Uygulama açılışında storage kontrolü
  useEffect(() => {
    (async () => {
      const auth = await getAuth(); // süresi dolduysa null döner
      setIsLogged(!!auth);
    })();
  }, []);

  const signIn = async (email: string, remember = false, ttlMinutes?: number) => {
    await saveAuth({ email, remember, ttlMinutes }); // süreyi burada belirliyorsun
    setIsLogged(true);
  };

  const signOut = async () => {
    await clearAuth();
    setIsLogged(false);
  };

  return (
    <Ctx.Provider value={{ isLogged, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  );
}
