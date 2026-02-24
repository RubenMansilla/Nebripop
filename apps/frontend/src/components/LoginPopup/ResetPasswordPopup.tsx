import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/auth.api";
import "../LoginPopup/LoginPopup.css"; // Reutilizamos los mismos estilos del login popup

export default function ResetPasswordPopup({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Cerrar con Escape
    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                navigate("/"); // Limpiamos la URL al cerrar el popup
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, onClose, navigate]);

    // Limpiar estados al abrir
    useEffect(() => {
        if (!open) return;
        setErrorMsg(null);
        setSuccessMsg(null);
        setPassword("");
        setConfirmPassword("");
    }, [open]);

    // Bloquear scroll
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    if (!open) return null;

    const handleClose = () => {
        onClose();
        navigate("/"); // Quitamos el token de la URL
    };

    const handleReset = async (e?: React.MouseEvent | React.KeyboardEvent) => {
        if (e && e.preventDefault) e.preventDefault();
        if (loading) return;

        if (!token) {
            setErrorMsg("Enlace inválido o expirado. Vuelve a solicitar el correo.");
            return;
        }

        if (!password || !confirmPassword) {
            setErrorMsg("Completa ambos campos.");
            return;
        }
        if (password !== confirmPassword) {
            setErrorMsg("Las contraseñas no coinciden.");
            return;
        }
        if (password.length < 6) {
            setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            await resetPassword({ token, newPassword: password });
            setSuccessMsg("¡Contraseña actualizada! Ya puedes iniciar sesión.");

            // Cerramos después de unos segundos
            setTimeout(() => {
                handleClose();
            }, 2500);
        } catch (err: any) {
            setErrorMsg(err.message || "No se pudo cambiar la contraseña.");
        } finally {
            setLoading(false);
        }
    };

    const onKeyDownReset = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            handleReset();
        }
    };

    return (
        <div className="popup-overlay" onClick={handleClose}>
            <div className="popup-box" onClick={(e) => e.stopPropagation()}>
                <button className="popup-close" onClick={handleClose} aria-label="Cerrar">
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
                        <h2 className="welcome-title">Crea una nueva contraseña</h2>
                    </div>

                    {successMsg && <div className="login-success">{successMsg}</div>}

                    {!token && !successMsg && (
                        <div className="login-error">Enlace inválido o caducado. Vuelve a pedir un correo de recuperación.</div>
                    )}

                    {!successMsg && token && (
                        <>
                            <div className="login-inputs-row">
                                <div className="login-material-textfield">
                                    <input
                                        className="login-material-input"
                                        placeholder=" "
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onKeyDown={onKeyDownReset}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            setErrorMsg(null);
                                        }}
                                        autoFocus
                                    />
                                    <label className="login-material-label">Nueva contraseña</label>
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
                                        value={confirmPassword}
                                        onKeyDown={onKeyDownReset}
                                        onChange={(e) => {
                                            setConfirmPassword(e.target.value);
                                            setErrorMsg(null);
                                        }}
                                    />
                                    <label className="login-material-label">Repite la contraseña</label>
                                </div>
                            </div>

                            {errorMsg && <div className="login-error">{errorMsg}</div>}

                            <button
                                type="button"
                                className="login-btn"
                                disabled={!password || !confirmPassword || loading}
                                onClick={handleReset}
                                style={{
                                    opacity: password && confirmPassword && !loading ? 1 : 0.6,
                                    cursor: password && confirmPassword && !loading ? "pointer" : "not-allowed",
                                }}
                            >
                                <p>{loading ? "Guardando..." : "Guardar contraseña"}</p>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
