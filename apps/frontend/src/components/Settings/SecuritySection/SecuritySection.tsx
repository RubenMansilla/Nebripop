import './SecuritySection.css';
import { useState, useContext } from 'react';
import type { ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import { changePassword } from '../../../api/users.api';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from "react-toastify";

export default function SecuritySection() {
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { token } = useContext(AuthContext);

    const successToastConfig = {
        style: {
            borderRadius: "14px",
            padding: "14px 18px",
            backgroundColor: "#f6fff8",
            color: "#114b2c",
            border: "1px solid #d5f3df",
            fontWeight: 500,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        },
        progressStyle: {
            background: "#28c76f",
        }
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
            }, token);

            // Éxito
            toast.success("Contraseña actualizada correctamente", successToastConfig); //
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
                            type="password"
                            name="current"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.current}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Contraseña actual</label>
                    </div>
                </div>

                <div className="password-row split-row">
                    <div className="material-textfield">
                        <input
                            type="password"
                            name="new"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.new}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Nueva contraseña</label>
                    </div>

                    <div className="material-textfield">
                        <input
                            type="password"
                            name="confirm"
                            className={`material-input ${error ? 'input-error' : ''}`}
                            placeholder=" "
                            value={passwords.confirm}
                            onChange={handlePassChange}
                            disabled={isLoading}
                        />
                        <label className="material-label">Repetir contraseña</label>
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