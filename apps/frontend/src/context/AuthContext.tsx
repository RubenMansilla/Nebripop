import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

interface User {
    id: number;
    fullName: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    login: () => { },
    logout: () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true); //IMPORTANTE para que no renderice hasta cargar

    useEffect(() => {
        const savedUser = localStorage.getItem("user");
        const savedToken = localStorage.getItem("token");

        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }

        setLoading(false); // NO RENDERIZAR HASTA ACABAR DE CARGAR
    }, []);

    const login = (u: User, t: string) => {
        setUser(u);
        setToken(t);
        localStorage.setItem("user", JSON.stringify(u));
        localStorage.setItem("token", t);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    // Si no ha cargado, no renderiza nada
    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
