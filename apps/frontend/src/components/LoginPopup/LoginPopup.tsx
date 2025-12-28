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
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const { openRegister } = useLoginModal();
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (!open) return null;

    const goRegister = () => {
        onClose();
        openRegister();
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
                        disabled={!captchaValue || !email || !password}
                        onClick={async () => {
                            try {
                                const res = await loginUser({
                                    email,
                                    password,
                                });

                                console.log("Usuario logueado:", res);

                                // GUARDAR SESIÓN GLOBAL
                                login(res.user, res.token);

                                alert("Inicio de sesión correcto");
                                onClose();

                            } catch (err: any) {
                                alert(err.message);
                            }
                        }}
                        style={{
                            opacity: captchaValue ? 1 : 0.6,
                            cursor: captchaValue ? "pointer" : "not-allowed",
                        }}
                    >
                        Acceder a Wallastock
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
