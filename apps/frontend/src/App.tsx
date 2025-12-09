import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";

// HOME
import Home from "./pages/Home/Home";

// PROFILE PAGES
import Profile from "./pages/Profile/Me/Me";
import Catalog from "./pages/Profile/Catalog/Catalog";
import Wallet from "./pages/Profile/Wallet/Wallet";
import Chat from "./pages/Profile/Chat/Chat";
import Favorites from "./pages/Profile/Favorites/Favorites";
import Purchases from "./pages/Profile/Purchases/Purchases";
import Sales from "./pages/Profile/Sales/Sales";
import Stats from "./pages/Profile/Stats/Stats";
import Info from "./pages/Profile/Info/Info";

// FOOTER SCREENS
import About from "./components/PantallasFooter/About";
import HowItWorks from "./components/PantallasFooter/HowItWorks";
import Jobs from "./components/PantallasFooter/Jobs";
import Sustainability from "./components/PantallasFooter/Sustainability";
import Help from "./components/PantallasFooter/Help";
import Safety from "./components/PantallasFooter/Safety";
import Community from "./components/PantallasFooter/Community";
import Privacy from "./components/PantallasFooter/Privacy";
import Terms from "./components/PantallasFooter/Terms";

export default function App() {
    return (
        <AuthProvider>
            <LoginModalProvider>
                <BrowserRouter>

                    <Routes>

                        {/* ========================= */}
                        {/*        RUTAS PÚBLICAS     */}
                        {/* ========================= */}

                        <Route path="/" element={<Home />} />

                        {/* Footer pages */}
                        <Route path="/quienes-somos" element={<About />} />
                        <Route path="/como-funciona" element={<HowItWorks />} />
                        <Route path="/empleo" element={<Jobs />} />
                        <Route path="/sostenibilidad" element={<Sustainability />} />

                        <Route path="/ayuda" element={<Help />} />
                        <Route path="/seguridad" element={<Safety />} />
                        <Route path="/normas" element={<Community />} />

                        <Route path="/privacidad" element={<Privacy />} />
                        <Route path="/condiciones" element={<Terms />} />

                        {/* ========================= */}
                        {/*      RUTAS PROTEGIDAS     */}
                        {/* ========================= */}

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
