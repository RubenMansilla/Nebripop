import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* REGISTER */}
        <Route path="/register" element={<Register />} />

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
  );
}
