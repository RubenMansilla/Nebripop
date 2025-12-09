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
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;  // ← usamos esta API
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
    setUser: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [userState, setUserState] = useState<User | null>(null);
    const [tokenState, setTokenState] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
            setUserState(JSON.parse(savedUser));
            setTokenState(savedToken);
        }

        setLoading(false);
    }, []);

    const updateUserState = (newUser: User | null) => {
        setUserState(newUser);

        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            localStorage.removeItem("user");
        }
    };

    const login = (u: User, t: string) => {
        updateUserState(u);
        setTokenState(t);

        localStorage.setItem("token", t);
    };

    const logout = () => {
        updateUserState(null);
        setTokenState(null);

        localStorage.removeItem("token");
    };

    if (loading) return null;

    return (
        <AuthContext.Provider
            value={{
                user: userState,
                token: tokenState,
                login,
                logout,
                setUser: updateUserState, // ← exportamos la función correcta
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
