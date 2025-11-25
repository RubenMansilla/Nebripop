import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLoginModal } from "../../context/LoginModalContext";
import "./LoginPopup.css";

export default function LoginPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const { openRegister } = useLoginModal();

  if (!open) return null;

  const goRegister = () => {
    onClose();        // cierra login
    openRegister();   // abre el registro
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>

        {/* Panel izquierdo */}
        <div className="popup-left">
          <h1 className="brand-title">Wallastock</h1>
          <p className="brand-subtitle">
            Compra y vende lo que ya no usas, fácil y cerca de ti.
          </p>
        </div>

        {/* Panel derecho */}
        <div className="popup-right">
          <h2 className="welcome-title">¡Te damos la bienvenida!</h2>

          <input className="login-input" placeholder="Dirección de e-mail" />
          <input className="login-input" placeholder="Contraseña" />

          <ReCAPTCHA
            sitekey="6Lc7xBEsAAAAABor08U8tHoFYX0v4FgTDZEWpYBZ"
            onChange={(value: string | null) => setCaptchaValue(value)}
          />

          <a className="forgot-password">¿Has olvidado tu contraseña?</a>

          <button
            className="login-btn"
            disabled={!captchaValue}
            style={{
              opacity: captchaValue ? 1 : 0.6,
              cursor: captchaValue ? "pointer" : "not-allowed",
            }}
          >
            Acceder a Wallastock
          </button>

          {/* 🔥 ENLACE A REGISTRO */}
          <p className="register-text">
            ¿No tienes cuenta?{" "}
            <span className="register-link" onClick={goRegister}>
              Regístrate aquí
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}
