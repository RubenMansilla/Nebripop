import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './Info.css'
import ProfileData from '../../../components/Profile/Data/ProfileData';
import { useNavigate } from 'react-router-dom';

export default function Info() {

    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    /* info item active */
    const [selected, setSelected] = useState("perfil");

    useEffect(() => {
        if (selected === "valoraciones") {
            navigate("/profile/reviews");
        }
    }, [selected, navigate]);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const pendingTabRef = useRef<string | null>(null);

    const handleTabChange = (tab: string) => {
        if (hasUnsavedChanges) {
            pendingTabRef.current = tab;
            setShowPopup(true);
        } else {
            setSelected(tab);
        }
    };

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tu perfil</h1>
                    </div>
                    <div className="description">
                        <p>Aquí podrás ver y editar los datos de tu perfil</p>
                    </div>
                </div>
                <div className="logout" onClick={logout}>
                    <p>Cerrar sesión</p>
                </div>
            </div>
            <div className="info-selector">
                <div className="info-items">
                    <div
                        className={`info-item ${selected === "perfil" ? "active" : ""}`}
                        onClick={() => setSelected("perfil")}
                    >
                        <p>Perfil</p>
                    </div>
                    <div
                        className={`info-item ${selected === "valoraciones" ? "active" : ""}`}
                        onClick={() => handleTabChange("valoraciones")}
                    >
                        <p>Valoraciones</p>
                    </div>
                </div>
            </div>
            {selected === "perfil" && <ProfileData setHasUnsavedChanges={setHasUnsavedChanges} />}

            {showPopup && (
                <div className="popup-backdrop">
                    <div className="unsaved-changes-popup">
                        <h3>¿Estás seguro que quieres abandonar esta página?</h3>
                        <p>Hay información que no has guardado. Si te vas sin guardar perderás los cambios que has hecho.</p>
                        <div className="popup-buttons-product">
                            <span className="popup-no" onClick={() => setShowPopup(false)}>
                                No
                            </span>
                            <span className="divider"></span>
                            <span
                                className="popup-yes"
                                onClick={() => {
                                    setHasUnsavedChanges(false);
                                    setSelected(pendingTabRef.current!);
                                    setShowPopup(false);
                                }}
                            >
                                Sí, me voy
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
