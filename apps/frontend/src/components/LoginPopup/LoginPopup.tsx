import { useState, useContext } from "react";
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

  if (!open) return null; // Evita overlay fantasma

  const goRegister = () => {
    onClose();
    openRegister();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res: any = await loginUser({ email, password });

      console.log("Respuesta Login:", res);

      // ✅ Compatibilidad: puede venir token antiguo o access/refresh nuevos
      const accessToken = res?.accessToken ?? res?.token;
      const refreshToken = res?.refreshToken;

      // Si el AuthContext ahora espera 3 params, se los pasamos.
      // Si todavía espera 2, JS ignora el tercero sin romper.
      login(res.user, accessToken, refreshToken);

      onClose();
    } catch (err: any) {
      alert(err?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
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

          <input
            className="login-input"
            placeholder="Dirección de e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="login-input"
            placeholder="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <ReCAPTCHA
            sitekey="6Lc8ADksAAAAAASu-cd5qVoh8_wW_IceZNtCgFYr"
            onChange={(value: string | null) => setCaptchaValue(value)}
          />

          <a className="forgot-password">¿Has olvidado tu contraseña?</a>

          <button
            className="login-btn"
            disabled={!captchaValue || !email || !password || loading}
            onClick={handleLogin}
            style={{
              opacity: captchaValue && email && password && !loading ? 1 : 0.6,
              cursor: captchaValue && email && password && !loading ? "pointer" : "not-allowed",
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
