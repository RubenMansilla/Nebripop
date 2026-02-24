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
  const [showPassword, setShowPassword] = useState(false);

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

  // Bloquear scroll del fondo cuando el popup está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup: restaurar scroll al desmontar o cerrar
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  if (!open) return null;

  const goRegister = () => {
    onClose();
    openRegister();
  };

  const handleLogin = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e && e.preventDefault) e.preventDefault();
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

      setTimeout(() => {
        onClose();
      }, 200);
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
        setSuccessMsg(null);
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
    <div className="popup-overlay" onClick={onClose}>
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
          <div className="welcome-wrapper">
            <h2 className="welcome-title">
              {isResetMode ? "Recuperar contraseña" : "¡Te damos la bienvenida!"}
            </h2>
          </div>


          {successMsg && <div className="login-success">{successMsg}</div>}

          {isResetMode ? (
            <>
              <div className="login-inputs-row">
                <div className="login-material-textfield">
                  <input
                    className="login-material-input"
                    placeholder=" "
                    value={resetEmail}
                    onKeyDown={onKeyDownLogin}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    autoFocus
                  />
                  <label className="login-material-label">Dirección de e-mail</label>
                </div>
              </div>

              {errorMsg && <div className="login-error">{errorMsg}</div>}

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
                <p>{loading ? "Enviando..." : "Enviar email de recuperación"}</p>
              </button>

              <p className="register-text" style={{ marginTop: "15px" }}>
                <span className="register-link" onClick={backToLogin}>
                  Volver a iniciar sesión
                </span>
              </p>
            </>
          ) : (
            <>

              <div className="login-inputs-row">

                <div className="login-material-textfield">
                  <input
                    className="login-material-input"
                    placeholder=" "
                    value={email}
                    onKeyDown={onKeyDownLogin}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    autoFocus
                  />
                  <label className="login-material-label">Dirección de e-mail</label>
                </div>

                <div className="login-material-textfield">
                  <input
                    className="login-material-input"
                    placeholder=" "
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onKeyDown={onKeyDownLogin}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
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
              </div>

              <div className="forgot-password-wrapper">

                <a
                  className="forgot-password"
                  href="#"
                  onClick={openForgotPassword}
                  style={{ pointerEvents: loading ? "none" : "auto", opacity: loading ? 0.6 : 1 }}
                >
                  ¿Has olvidado tu contraseña?
                </a>

              </div>

              <div className="recaptcha-wrapper">
                <ReCAPTCHA
                  sitekey="6Lc8ADksAAAAAASu-cd5qVoh8_wW_IceZNtCgFYr"
                  onChange={(value: string | null) => setCaptchaValue(value)}
                  onExpired={() => setCaptchaValue(null)}
                  onErrored={() => {
                    setCaptchaValue(null);
                    setErrorMsg("No se pudo cargar el captcha. Prueba a recargar.");
                  }}
                />
              </div>
              {errorMsg && <div className="login-error">{errorMsg}</div>}

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
                <p>{loading ? "Entrando..." : "Acceder a Nebripop"}</p>
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
