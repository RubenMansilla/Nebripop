import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../utils/axiosConfig";

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
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    setUser: (user: User | null) => void;
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
        const savedAccessToken = localStorage.getItem("token");
        // No necesitamos cargar el refreshToken en el estado de React, 
        // basta con que esté en localStorage para que Axios lo lea.

        if (savedUser && savedAccessToken) {
            setUserState(JSON.parse(savedUser));
            setTokenState(savedAccessToken);
        }
        setLoading(false);
    }, []);

    // --- FUNCIÓN LOGIN ACTUALIZADA ---
    const login = (u: User, accessToken: string, refreshToken: string) => {
        setUserState(u);
        setTokenState(accessToken);

        localStorage.setItem("user", JSON.stringify(u));
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken); // <--- Guardamos el segundo token
    };

    const logout = () => {
        setUserState(null);
        setTokenState(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken"); // <--- Borramos ambos

    };

    const updateUserState = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem("user", JSON.stringify(newUser));
        } else {
            localStorage.removeItem("user");
        }
    };

    if (loading) return null;

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
