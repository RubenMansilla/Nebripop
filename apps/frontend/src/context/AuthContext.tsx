import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface User {
  id: number;
  fullName: string;
  email: string;
  createdAt: string;
  birthDate?: string | null;
  gender?: string | null;
  profilePicture?: string;
  walletBalance?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  /**
   * ✅ Compatible:
   * - Antes: login(user, token)
   * - Ahora: login(user, accessToken, refreshToken)
   */
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(null);

  // 🟦 RESTAURAR SESIÓN
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token"); // accessToken (o token antiguo)

    if (savedUser && savedToken) {
      try {
        setUserState(JSON.parse(savedUser));
        setTokenState(savedToken);
      } catch (e) {
        console.error("Error parsing saved user:", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  // 🟩 LOGIN (nuevo + compatible)
  const login = (u: User, accessToken: string, refreshToken?: string) => {
    setUserState(u);
    setTokenState(accessToken);

    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", accessToken);

    // Si viene refreshToken, lo guardamos (nuevo backend)
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }
  };

  // 🟥 LOGOUT
  const logout = () => {
    setUserState(null);
    setTokenState(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  };

  // ✅ setUser sincroniza localStorage (como quería main)
  const updateUserState = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userState,
        token: tokenState,
        login,
        logout,
        setUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
