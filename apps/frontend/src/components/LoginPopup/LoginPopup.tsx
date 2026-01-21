// apps/frontend/src/components/LoginPopup/LoginPopup.tsx
import { useEffect, useState, useContext } from "react";
import type React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLoginModal } from "../../context/LoginModalContext";
import { loginUser, requestPasswordReset } from "../../api/auth.api";
import { AuthContext } from "../../context/AuthContext";
import "./LoginPopup.css";

export default function LoginPopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { openRegister } = useLoginModal();
  const { login } = useContext(AuthContext);

  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ✅ modo recuperación
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Limpia mensajes cuando se abre
  useEffect(() => {
    if (!open) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsResetMode(false);
    setResetEmail("");
  }, [open]);

  if (!open) return null;

  const goRegister = () => {
    onClose();
    openRegister();
  };

  const handleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res: any = await loginUser({ email, password });

      const accessToken = res?.accessToken ?? res?.token;
      const refreshToken = res?.refreshToken;

      if (!accessToken || !res?.user) {
        throw new Error("Respuesta inválida del servidor");
      }

      login(res.user, accessToken, refreshToken);
      setSuccessMsg("Has iniciado sesión correctamente");

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Credenciales incorrectas";

      setErrorMsg(typeof msg === "string" ? msg : "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (loading) return;

    const mail = (resetEmail || "").trim().toLowerCase();
    if (!mail) {
      setErrorMsg("Introduce tu email para recuperar la contraseña");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await requestPasswordReset({ email: mail });

      setSuccessMsg(
        "Si el email existe, te enviaremos un correo con instrucciones para recuperar la contraseña."
      );

      // volver a login después de 2s (opcional)
      setTimeout(() => {
        setIsResetMode(false);
        setResetEmail("");
      }, 2000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo solicitar el cambio de contraseña";

      setErrorMsg(typeof msg === "string" ? msg : "No se pudo solicitar el cambio de contraseña");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Enter: según modo
  const onKeyDownLogin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (loading) return;
      if (isResetMode) handleRequestReset();
      else handleLogin();
    }
  };

  const openForgotPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    setIsResetMode(true);
    setResetEmail(email?.trim()); // rellena con lo que ya escribió
    setPassword(""); // ✅ limpiamos password por UX
    setCaptchaValue(null); // opcional: resetea captcha en el modo reset
  };

  const backToLogin = () => {
    if (loading) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsResetMode(false);
    setCaptchaValue(null); // ✅ cuando vuelves, que vuelva a validar captcha
  };

  return (
    <div className="popup-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="popup-left">
          <h1 className="brand-title">Nebripop</h1>
          <p className="brand-subtitle">
            Compra y vende lo que ya no usas, fácil y cerca de ti.
          </p>
        </div>

        <div className="popup-right">
          <h2 className="welcome-title">
            {isResetMode ? "Recuperar contraseña" : "¡Te damos la bienvenida!"}
          </h2>

          {errorMsg && <div className="login-error">{errorMsg}</div>}
          {successMsg && <div className="login-success">{successMsg}</div>}

          {isResetMode ? (
            <>
              <input
                className="login-input"
                placeholder="Tu email"
                value={resetEmail}
                onKeyDown={onKeyDownLogin}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                autoFocus
              />

              <button
                type="button"
                className="login-btn"
                disabled={!resetEmail.trim() || loading}
                onClick={handleRequestReset}
                style={{
                  opacity: resetEmail.trim() && !loading ? 1 : 0.6,
                  cursor: resetEmail.trim() && !loading ? "pointer" : "not-allowed",
                }}
              >
                {loading ? "Enviando..." : "Enviar email de recuperación"}
              </button>

              <button
                type="button"
                className="login-btn secondary"
                onClick={backToLogin}
                disabled={loading}
              >
                Volver a iniciar sesión
              </button>
            </>
          ) : (
            <>
              <input
                className="login-input"
                placeholder="Dirección de e-mail"
                value={email}
                onKeyDown={onKeyDownLogin}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                autoFocus
              />

              <input
                className="login-input"
                placeholder="Contraseña"
                type="password"
                value={password}
                onKeyDown={onKeyDownLogin}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
              />

              <ReCAPTCHA
                sitekey="6Lc8ADksAAAAAASu-cd5qVoh8_wW_IceZNtCgFYr"
                onChange={(value: string | null) => setCaptchaValue(value)}
                onExpired={() => setCaptchaValue(null)}
                onErrored={() => {
                  setCaptchaValue(null);
                  setErrorMsg("No se pudo cargar el captcha. Prueba a recargar.");
                }}
              />

              <a
                className="forgot-password"
                href="#"
                onClick={openForgotPassword}
                style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}
              >
                ¿Has olvidado tu contraseña?
              </a>

              <button
                type="button"
                className="login-btn"
                disabled={!captchaValue || !email || !password || loading}
                onClick={handleLogin}
                style={{
                  opacity: captchaValue && email && password && !loading ? 1 : 0.6,
                  cursor:
                    captchaValue && email && password && !loading
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                {loading ? "Entrando..." : "Acceder a Nebripop"}
              </button>

              <p className="register-text">
                ¿No tienes cuenta?{" "}
                <span className="register-link" onClick={goRegister}>
                  Regístrate aquí
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
