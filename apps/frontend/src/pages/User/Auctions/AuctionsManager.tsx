import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './Auctions.css';

export default function AuctionsManager() {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab based on path
    const getActiveTab = () => {
        if (location.pathname.includes('/created')) return 'misSubastas';
        if (location.pathname.includes('/active')) return 'subastasActivas';
        if (location.pathname.includes('/history')) return 'historial';
        return 'misSubastas'; // default
    };

    const selected = getActiveTab();

    const getTitle = () => {
        if (selected === 'misSubastas') return 'Mis Subastas Creadas';
        if (selected === 'subastasActivas') return 'Subastas en las que participo';
        return 'Historial de Subastas';
    };

    const getDescription = () => {
        if (selected === 'misSubastas') return "Gestiona las subastas que has creado.";
        if (selected === 'subastasActivas') return "Consulta y sigue las subastas donde has pujado.";
        return "Consulta tus subastas finalizadas o canceladas.";
    };

    const handleTabClick = (tab: string) => {
        if (tab === 'misSubastas') navigate('created');
        if (tab === 'subastasActivas') navigate('active');
        if (tab === 'historial') navigate('history');
    };

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>{getTitle()}</h1>
                    </div>
                    <div className="description">
                        <p>{getDescription()}</p>
                    </div>
                </div>
                <div className="info-right-section">
                    {(user?.penaltyLevel || 0) > 0 && (
                        <div className="penalties-info-badge">
                            <div className="penalties-info-text">
                                <span className="penalties-info-count">{user?.penaltyLevel}</span>
                                <span className="penalties-info-label">Penalización{(user?.penaltyLevel || 0) !== 1 ? 'es' : ''}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="info-selector">
                <div className="info-items-wallet">
                    <div className={`info-item-wallet ${selected === "misSubastas" ? "active" : ""}`} onClick={() => handleTabClick("misSubastas")}><p>Mis Subastas</p></div>
                    <div className={`info-item-wallet ${selected === "subastasActivas" ? "active" : ""}`} onClick={() => handleTabClick("subastasActivas")}><p>Subastas Activas</p></div>
                    <div className={`info-item-wallet ${selected === "historial" ? "active" : ""}`} onClick={() => handleTabClick("historial")}><p>Historial</p></div>
                </div>
            </div>

            <Outlet />
        </>
    );
}

