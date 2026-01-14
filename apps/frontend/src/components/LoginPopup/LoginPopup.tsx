// apps/frontend/src/components/LoginPopup/LoginPopup.tsx
import { useEffect, useState, useContext } from "react";
import type React from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLoginModal } from "../../context/LoginModalContext";
import { loginUser } from "../../api/auth.api";
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
        onClose(); // ✅ solo cerramos si fue bien
      }, 1200);
    } catch (err: any) {
      // ✅ mensaje robusto
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Credenciales incorrectas";

      setErrorMsg(typeof msg === "string" ? msg : "Credenciales incorrectas");
      // ❌ NO cerramos aquí
    } finally {
      setLoading(false);
    }
  };

  // ✅ evita submit oculto / Enter en forms de arriba
  const onKeyDownLogin = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleLogin();
    }
  };

  return (
    <div className="popup-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="popup-box" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>

        <div className="popup-left">
          <h1 className="brand-title">Wallastock</h1>
          <p className="brand-subtitle">
            Compra y vende lo que ya no usas, fácil y cerca de ti.
          </p>
        </div>

        <div className="popup-right">
          <h2 className="welcome-title">¡Te damos la bienvenida!</h2>

          {errorMsg && <div className="login-error">{errorMsg}</div>}
          {successMsg && <div className="login-success">{successMsg}</div>}

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

          <a className="forgot-password" href="#" onClick={(e) => e.preventDefault()}>
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
            {loading ? "Entrando..." : "Acceder a Wallastock"}
          </button>

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
