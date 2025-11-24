import { useState } from "react";
import "./Register.css";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <div className="page-wrapper">

      {/* HEADER (misma estructura temporal que Login) */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo-box">wallastock</div>
        </div>

        <div className="topbar-center">
          <input
            type="text"
            className="search-input"
            placeholder="Busca  nintendo"
          />
        </div>

        <div className="topbar-right">
          <button className="top-btn">Registrarte o Inicia sesión</button>
          <button className="sell-btn">Vender</button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="register-section">
        
        <div className="register-box">

          {/* Panel formulario */}
          <div className="register-left">
            <h2 className="register-title">Créate una cuenta en Wallastock</h2>

            <input
              className="register-input"
              placeholder="Nombre de Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <input
              className="register-input"
              placeholder="Dirección de e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              className="register-input"
              placeholder="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className="register-input"
              placeholder="Confirmar Contraseña"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            <button
              className="register-btn"
            >
              Registrarte en Wallastock
            </button>
          </div>

          {/* Panel derecho */}
          <div className="register-right">
            <h1 className="brand-title">Wallastock</h1>
            <p className="brand-subtitle">
              Compra y vende lo que ya no usas, fácil y cerca de ti.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <p className="privacy-footer">
          Sitio protegido por reCAPTCHA, la{" "}
          <a href="#">Política de privacidad</a> y los{" "}
          <a href="#">Términos de servicio</a> de Google se aplican
        </p>

      </section>
    </div>
  );
}
