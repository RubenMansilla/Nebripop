import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";

import Profile from "./pages/Profile/Me";
import Home from "./pages/Home/Home";

export default function App() {
    return (
        <AuthProvider>
            <LoginModalProvider>
                <BrowserRouter>

                    <Routes>

                        {/* Rutas Públicas */}
                        <Route path="/" element={<Home />} />

                        {/* Rutas Protegidas */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>

                </BrowserRouter>
            </LoginModalProvider>
        </AuthProvider>
    );
}
