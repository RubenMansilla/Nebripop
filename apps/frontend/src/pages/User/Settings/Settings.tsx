import React from 'react';
import './Settings.css';

// Importamos los componentes (asegúrate de ajustar la ruta si están en carpetas)
import SecuritySection from '../../../components/Settings/SecuritySection/SecuritySection';
import NotificationsSection from '../../../components/Settings/NotificationsSection/NotificationsSection';

export default function Settings() {
    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Configuración</h1>
                    </div>
                    <div className="description">
                        <p>Gestiona la seguridad de tu cuenta y tus preferencias de notificaciones.</p>
                    </div>
                </div>
            </div>

            <div className='settings-content'>
                <SecuritySection />

                <NotificationsSection />
            </div>
        </>
    );
}