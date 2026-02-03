// apps/frontend/src/context/AuthContext.tsx
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
  // Penalty system fields
  activePenaltiesCount?: number;
  penaltyLevel?: number;
  penaltyAssignedAt?: string | null;
  recidivismCount?: number;
  totalPenaltiesReceived?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (u: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  setUser: (u: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => { },
  logout: () => { },
  setUser: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<User | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  // 🟦 RESTAURAR SESIÓN
  useEffect(() => {
    const restoreSession = () => {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");

      if (savedUser && savedToken) {
        try {
          const parsed = JSON.parse(savedUser);
          setUserState({
            ...parsed,
            id: Number(parsed.id),
          });
          setTokenState(savedToken);
        } catch (e) {
          console.error("Error parsing saved user:", e);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  // 🟩 LOGIN
  const login = (u: User, accessToken: string, refreshToken?: string) => {
    setUserState({ ...u, id: Number((u as any).id) });
    setTokenState(accessToken);

    localStorage.setItem("user", JSON.stringify({ ...u, id: Number((u as any).id) }));
    localStorage.setItem("token", accessToken);

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

  // ✅ setUser sincroniza localStorage
  const updateUserState = (newUser: User | null) => {
    setUserState(newUser ? ({ ...newUser, id: Number((newUser as any).id) }) : null);

    if (newUser) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...newUser, id: Number((newUser as any).id) })
      );
    } else {
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: userState,
        token: tokenState,
        loading,
        login,
        logout,
        setUser: updateUserState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}