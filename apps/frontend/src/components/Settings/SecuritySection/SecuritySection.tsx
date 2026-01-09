import './SecuritySection.css';
import { useState, useContext } from 'react';
import type { ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import { changePassword } from '../../../api/users.api';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from "react-toastify";
import { useNotificationSettings } from '../../../context/NotificationContext';
import { Link } from 'react-router-dom';

export default function SecuritySection() {

    const { notify } = useNotificationSettings();

    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { token } = useContext(AuthContext);

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Función para alternar la visibilidad
    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handlePassChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Validaciones Frontend
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setError('Por favor, rellena todos los campos.');
            return;
        }

        if (passwords.new !== passwords.confirm) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (passwords.new.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (passwords.current === passwords.new) {
            setError('La nueva contraseña debe ser diferente a la actual.');
            return;
        }

        try {
            setIsLoading(true);
            setError('');

            if (!token) {
                const msg = 'No estás autenticado';
                setError(msg);
                toast.error(msg);
                return;
            }

            // Llamada a la API
            await changePassword({
                oldPassword: passwords.current,
                newPassword: passwords.new
            });

            // Éxito
            notify('accountUpdates', "Contraseña actualizada correctamente");
            setPasswords({ current: '', new: '', confirm: '' });

        } catch (err: any) {
            const errorMsg = err.message || "Error al actualizar la contraseña";

            setError(errorMsg);

            if (errorMsg !== 'La contraseña actual es incorrecta') {
                toast.error(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='security-section'>
            <h2>Seguridad</h2>
            <p className="section-subtitle">Cambiar contraseña</p>

            <form className="security-form" onSubmit={handleSubmit}>
                <div className="password-row center-row">
                    <div className="material-textfield">
                        <input
                            type={showPasswords.current ? "text" : "password"}
                            name="current"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.current}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Contraseña actual</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('current')}
                        >
                            {showPasswords.current ? (
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
                <div className="password-row center-row forgot-password-row">
                    <div className="forgot-password-container">
                        <Link to="/auth/forgot-password" className="forgot-link">
                            ¿Has olvidado tu contraseña?
                        </Link>
                    </div>
                </div>

                <div className="password-row split-row">
                    <div className="material-textfield">
                        <input
                            type={showPasswords.new ? "text" : "password"}
                            name="new"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.new}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Nueva contraseña</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('new')}
                        >
                            {showPasswords.new ? (
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

                    <div className="material-textfield">
                        <input
                            type={showPasswords.confirm ? "text" : "password"}
                            name="confirm"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.confirm}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Repetir contraseña</label>
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => togglePasswordVisibility('confirm')}
                        >
                            {showPasswords.confirm ? (
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

                    {error && <p className="error-message">{error}</p>}
                </div>

                <button className="save-btn" disabled={isLoading}>
                    {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>

            </form>
        </div>
    );
}