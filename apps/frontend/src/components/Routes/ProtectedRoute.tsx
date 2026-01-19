import { useContext } from "react";
import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
    const { user, token, loading } = useContext(AuthContext);

    if (loading) {
        return null;
    }

    if (!user || !token) {
        return <Navigate to="/" replace />;
    }

    return children;
}