import { useState, useContext } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLoginModal } from "../../context/LoginModalContext";
import { loginUser } from "../../api/auth.api"; // Asegúrate de actualizar este archivo también (ver abajo)
import { AuthContext } from "../../context/AuthContext";
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

    // Aquí obtenemos la función login actualizada
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false); // Añadí un estado de carga opcional

    if (!open) return null;

    const goRegister = () => {
        onClose();
        openRegister();
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            // 1. Llamada a la API
            const res = await loginUser({
                email,
                password,
            });

            console.log("Respuesta Login:", res);

            // 2. USAR LA NUEVA FIRMA DEL CONTEXTO
            // El backend ahora devuelve: { user, accessToken, refreshToken }
            login(res.user, res.accessToken, res.refreshToken);

            // alert("Inicio de sesión correcto"); // Opcional, a veces molesta al usuario
            onClose();

        } catch (err: any) {
            alert(err.message || "Error al iniciar sesión");
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
                            opacity: (captchaValue && email && password) ? 1 : 0.6,
                            cursor: (captchaValue && email && password) ? "pointer" : "not-allowed",
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