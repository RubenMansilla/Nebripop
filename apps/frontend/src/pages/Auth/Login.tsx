import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./Login.css";

export default function Login() {
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);

  const handleCaptcha = (value: string | null) => {
    console.log("Captcha completado:", value);
    setCaptchaValue(value);
  };

  return (
    <div className="page-wrapper">

      {/* HEADER */}
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

      {/* SECCIÓN LOGIN */}
      <section className="login-section">
        
        <div className="login-box">
          
          {/* Panel izquierdo */}
          <div className="login-left">
            <h1 className="brand-title">Wallastock</h1>
            <p className="brand-subtitle">
              Compra y vende lo que ya no usas, fácil y cerca de ti.
            </p>
          </div>

          {/* Panel derecho */}
          <div className="login-right">
            <h2 className="welcome-title">¡Te damos la bienvenida!</h2>

            <input className="login-input" placeholder="Dirección de e-mail" />
            <input className="login-input" placeholder="Contraseña" />

            {/* CAPTCHA REAL */}
            <ReCAPTCHA
              sitekey="6Lc7xBEsAAAAABor08U8tHoFYX0v4FgTDZEWpYBZ"
              onChange={handleCaptcha}
            />

            <a href="#" className="forgot-password">
              ¿Has olvidado tu contraseña?
            </a>

            <button
              className="login-btn"
              disabled={!captchaValue}
              style={{
                opacity: captchaValue ? 1 : 0.6,
                cursor: captchaValue ? "pointer" : "not-allowed"
              }}
            >
              Acceder a Wallastock
            </button>

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
