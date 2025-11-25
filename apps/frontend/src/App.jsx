import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginModalProvider } from "./context/LoginModalContext";

import Home from "./pages/Home/Home.jsx";


export default function App() {
  return (
    <LoginModalProvider>
      <BrowserRouter>
        <Routes>

          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* RUTA POR DEFECTO */}
          <Route
            path="*"
            element={
              <div
                style={{
                  width: "100%",
                  height: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "22px",
                  color: "#555",
                }}
              >
                Página no encontrada
              </div>
            }
          />

        </Routes>
      </BrowserRouter>
    </LoginModalProvider>
  );
}
