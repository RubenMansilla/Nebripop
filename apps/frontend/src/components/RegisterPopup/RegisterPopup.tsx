import { useState } from "react";
import { useLoginModal } from "../../context/LoginModalContext";
import { registerUser } from "../../api/auth.api";
import "./RegisterPopup.css";

interface RegisterPopupProps {
  open: boolean;
  onClose: () => void;
}

export default function RegisterPopup({ open, onClose }: RegisterPopupProps) {
  const { openLogin } = useLoginModal();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const goToLogin = () => {
    onClose();
    openLogin();
  };

  // ---- VALIDACIONES ----
  const bothFilled = pass1.length > 0 && pass2.length > 0;
  const passTooShort = pass1.length > 0 && pass1.length < 6;
  const passwordsEqual = pass1 === pass2 && pass1.length >= 6;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        {/* Panel izquierdo */}
        <div className="popup-left">
          <h1 className="brand-title">Nebripop</h1>
          <p className="brand-subtitle">
            Compra y vende lo que ya no usas, fácil y cerca de ti.
          </p>
        </div>

        {/* Panel derecho */}
        <div className="popup-right">
          <div className="welcome-wrapper" style={{ marginBottom: "20px" }}>
            <h2 className="welcome-title">Crea tu cuenta</h2>
          </div>

          <div className="login-inputs-row">
            <div className="login-material-textfield">
              <input
                className="login-material-input"
                placeholder=" "
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrorMsg(null);
                }}
              />
              <label className="login-material-label">Nombre y apellidos</label>
            </div>

            <div className="login-material-textfield">
              <input
                className="login-material-input"
                placeholder=" "
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                }}
              />
              <label className="login-material-label">Correo electrónico</label>
            </div>
          </div>

          <div className="login-inputs-row">
            <div className="login-material-textfield">
              <input
                className="login-material-input"
                placeholder=" "
                type={showPassword ? "text" : "password"}
                value={pass1}
                onChange={(e) => {
                  setPass1(e.target.value);
                  setErrorMsg(null);
                }}
                autoComplete="new-password"
              />
              <label className="login-material-label">Contraseña</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>

            <div className="login-material-textfield">
              <input
                className="login-material-input"
                placeholder=" "
                type={showPassword ? "text" : "password"}
                value={pass2}
                onChange={(e) => {
                  setPass2(e.target.value);
                  setErrorMsg(null);
                }}
                autoComplete="new-password"
              />
              <label className="login-material-label">Confirmar contraseña</label>
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Validación mensajes */}
          {bothFilled && (
            <p
              className="password-check"
              style={{ color: passwordsEqual ? "green" : "red" }}
            >
              {passTooShort
                ? "La contraseña debe tener al menos 6 caracteres"
                : passwordsEqual
                  ? ""
                  : "Las contraseñas no coinciden"}
            </p>
          )}

          <button
            className="login-btn"
            disabled={!passwordsEqual || !email || !fullName}
            onClick={async () => {
              try {
                const res = await registerUser({
                  fullName,
                  email,
                  password: pass1,
                });

                console.log("Usuario registrado:", res);

                localStorage.setItem("user", JSON.stringify(res.user));
                localStorage.setItem("token", res.token);

                onClose();
                openLogin();
              } catch (err: any) {
                console.error("Error al registrar:", err);
                let message = err.response?.data?.message || err.message || "Error al registrar";

                // Traducciones de errores comunes del backend
                if (message === "email must be an email") {
                  message = "Por favor, introduce un correo electrónico válido";
                }

                setErrorMsg(message);
              }
            }}
          >
            Crear cuenta
          </button>

          {errorMsg && <p className="login-error" style={{ marginTop: "10px" }}>{errorMsg}</p>}

          {/* VOLVER A LOGIN */}
          <p className="login-text">
            ¿Ya tienes cuenta?{" "}
            <span className="login-link" onClick={goToLogin}>
              Inicia sesión aquí
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
