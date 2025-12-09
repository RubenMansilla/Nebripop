import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";

// HOME
import Home from "./pages/Home/Home";

// USER PROFILE PAGES (NUEVA RUTA)
import User from "./pages/User/Me/Me";
import Published from "./pages/User/Catalog/Published/Published";
import Solds from "./pages/User/Catalog/Sold/Solds";
import Wallet from "./pages/User/Wallet/Wallet";
import Chat from "./pages/User/Chat/Chat";
import Favorites from "./pages/User/Favorites/Favorites";
import Purchases from "./pages/User/Purchases/Purchases";
import Sales from "./pages/User/Sales/Sales";
import Stats from "./pages/User/Stats/Stats";
import Info from "./pages/User/Info/Info";
import ReviewProfile from "./pages/User/ReviewProfile/ReviewProfile";
import FormularioProducto from "./pages/SellProduct";

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

            {/* PUBLIC ROUTES */}
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

            {/* PROTECTED ROUTES */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <User />
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
              path="/profile/reviews"
              element={
                <ProtectedRoute>
                  <ReviewProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/catalog/published"
              element={
                <ProtectedRoute>
                  <Published />
                </ProtectedRoute>
              }
            />

            <Route
              path="/catalog/sold"
              element={
                <ProtectedRoute>
                  <Solds />
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

            <Route
              path="/sell-product"
              element={
                <ProtectedRoute>
                  <FormularioProducto />
                </ProtectedRoute>
              }
            />

          </Routes>
        </BrowserRouter>
      </LoginModalProvider>
    </AuthProvider>
  );
}
