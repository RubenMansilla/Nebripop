import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/Routes/ProtectedRoute";

// HOME
import Home from "./pages/Home/Home";
import Detail from "./pages/Product/Detail";

// USER PROFILE PAGES (NUEVA RUTA)
import ProfileLayout from "./components/Profile/Layout/ProfileLayout";
import User from "./pages/User/Me/Me";
import Published from "./pages/User/Catalog/Published/Published";
import Solds from "./pages/User/Catalog/Sold/Solds";
import Balance from "./pages/User/Wallet/Balance/Balance";
import BankDetails from "./pages/User/Wallet/BankDetails/BankDetails";
import History from "./pages/User/Wallet/History/History";
import Chat from "./pages/User/Chat/Chat";
import FavoritesProducts from "./pages/User/Favorites/Products/FavoritesProducts";
import FavoritesProfiles from "./pages/User/Favorites/Profiles/FavoritesProfiles";
import PurchasesOngoing from "./pages/User/Purchases/Ongoing/PurchasesOngoing";
import PurchasesCompleted from "./pages/User/Purchases/Completed/PurchasesCompleted";
import SalesOngoing from "./pages/User/Sales/Ongoing/SalesOngoing";
import SalesCompleted from "./pages/User/Sales/Completed/SalesCompleted";
import Stats from "./pages/User/Stats/Stats";
import Info from "./pages/User/Info/Info";
import Settings from "./pages/User/Settings/Settings";
import ReviewProfile from "./pages/User/ReviewProfile/ReviewProfile";
import HelpPage from "./pages/User/Help/Help";
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
import Filtro from "./pages/Filtro/Filtro";


// PERFIL PÚBLICO
import PublicUser from "./pages/PublicUser/PublicUser";

import Checkout from "./pages/Checkout/CheckoutPage";

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

            <Route path="/filtros" element={<Filtro />} />
            <Route path="/product/:productId" element={<Detail />} />

            <Route path="/you" element={<User />} />

            <Route element={<ProtectedRoute><ProfileLayout /></ProtectedRoute>}>

              {/* Perfil */}
              <Route path="/profile/info" element={<Info />} />
              <Route path="/profile/reviews" element={<ReviewProfile />} />
              <Route path="/profile/chat" element={<Chat />} />
              <Route path="/profile/stats" element={<Stats />} />

              {/* Catálogo */}
              <Route path="/catalog/published" element={<Published />} />
              <Route path="/catalog/sold" element={<Solds />} />

              {/* Monedero */}
              <Route path="/wallet/balance" element={<Balance />} />
              <Route path="/wallet/bank-details" element={<BankDetails />} />
              <Route path="/wallet/history" element={<History />} />

              {/* Favoritos */}
              <Route path="/favorites/products" element={<FavoritesProducts />} />
              <Route path="/favorites/profiles" element={<FavoritesProfiles />} />

              {/* Compras y Ventas */}
              <Route path="/purchases/ongoing" element={<PurchasesOngoing />} />
              <Route path="/purchases/completed" element={<PurchasesCompleted />} />
              <Route path="/sales/ongoing" element={<SalesOngoing />} />
              <Route path="/sales/completed" element={<SalesCompleted />} />

              {/* Configuración */}
              <Route path="/settings" element={<Settings />} />


              {/* Ayuda */}

            </Route>
            <Route path="/help" element={<HelpPage />} />

            <Route
              path="/sell-product"
              element={
                <ProtectedRoute>
                  <FormularioProducto />
                </ProtectedRoute>
              }
            />
            <Route path="/checkout" element={<Checkout />} />


            <Route path="/users/:userId" element={<PublicUser />} />



          </Routes>
        </BrowserRouter>
      </LoginModalProvider>
    </AuthProvider>
  );
}
