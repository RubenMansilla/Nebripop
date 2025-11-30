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
                    <h1 className="brand-title">Wallastock</h1>
                    <p className="brand-subtitle">
                        Compra y vende lo que ya no usas, fácil y cerca de ti.
                    </p>
                </div>

                {/* Panel derecho */}
                <div className="popup-right">

                    <h2 className="welcome-title">Crea tu cuenta</h2>

                    <input
                        className="login-input"
                        placeholder="Nombre y apellidos"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                    />

                    <input
                        className="login-input"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        className="login-input"
                        placeholder="Contraseña"
                        type="password"
                        value={pass1}
                        onChange={(e) => setPass1(e.target.value)}
                        autoComplete="new-password"
                    />

                    <input
                        className="login-input"
                        placeholder="Confirmar contraseña"
                        type="password"
                        value={pass2}
                        onChange={(e) => setPass2(e.target.value)}
                        autoComplete="new-password"
                    />

                    {/* Validación mensajes */}
                    {bothFilled && (
                        <p
                            className="password-check"
                            style={{
                                color: passwordsEqual ? "green" : "red",
                            }}
                        >
                            {passTooShort
                                ? "✘ La contraseña debe tener al menos 6 caracteres"
                                : passwordsEqual
                                    ? "✔ Las contraseñas coinciden"
                                    : "✘ Las contraseñas no coinciden"}
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


                                alert("Cuenta creada con éxito");

                                onClose();
                                openLogin();

                            } catch (err: any) {
                                alert(err.message);
                            }
                        }}
                    >
                        Crear cuenta
                    </button>

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
