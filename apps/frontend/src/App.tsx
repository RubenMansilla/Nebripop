import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";

import Profile from "./pages/Profile/Me/Me";
import Home from "./pages/Home/Home";
import Catalog from "./pages/Profile/Catalog/Catalog";
import Wallet from "./pages/Profile/Wallet/Wallet";
import Chat from "./pages/Profile/Chat/Chat";
import Favorites from "./pages/Profile/Favorites/Favorites";
import Purchases from "./pages/Profile/Purchases/Purchases";
import Sales from "./pages/Profile/Sales/Sales";
import Stats from "./pages/Profile/Stats/Stats";
import Info from "./pages/Profile/Info/Info";

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
                        <Route
                            path="/profile/info"
                            element={
                                <ProtectedRoute>
                                    <Info />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/catalog"
                            element={
                                <ProtectedRoute>
                                    <Catalog />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/wallet"
                            element={
                                <ProtectedRoute>
                                    <Wallet />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/chat"
                            element={
                                <ProtectedRoute>
                                    <Chat />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/favorites"
                            element={
                                <ProtectedRoute>
                                    <Favorites />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/purchases"
                            element={
                                <ProtectedRoute>
                                    <Purchases />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/sales"
                            element={
                                <ProtectedRoute>
                                    <Sales />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/stats"
                            element={
                                <ProtectedRoute>
                                    <Stats />
                                </ProtectedRoute>
                            }
                        />

                    </Routes>

                </BrowserRouter>
            </LoginModalProvider>
        </AuthProvider>
    );
}
