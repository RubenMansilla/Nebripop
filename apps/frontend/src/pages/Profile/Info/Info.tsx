import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/ProfileSideBar/ProfileSideBar';
import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './Info.css'
import ProfileData from '../../../components/Profile/Data/ProfileData';
import ReviewProfile from '../../../components/ReviewProfile/ReviewProfile';

export default function Info() {

    const { logout } = useContext(AuthContext);

    /* info item active */
    const [selected, setSelected] = useState("perfil");
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showPopup, setShowPopup] = useState(false);

    const pendingTabRef = useRef<string | null>(null);

    const handleTabChange = (tab: string) => {
        if (hasUnsavedChanges) {
            pendingTabRef.current = tab;
            setShowPopup(true);          // mostrar pop up
        } else {
            setSelected(tab);            // nada que guardar → ir directo
        }
    };

    return (
        <>
            <Navbar />
            <div className="navbar-line"></div>
            <CategoriesBar />
            <section className='sidebar-container'>
                <div className='hide-left-sidebar'>
                    <ProfileSideBar />
                </div>
                <div className='sidebar-right'>
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
                                onClick={() => handleTabChange("perfil")}
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
                    {selected === "valoraciones" && <ReviewProfile />}
                </div>
            </section>
            {showPopup && (
                <div className="popup-backdrop">
                    <div className="unsaved-changes-popup">
                        <h3>¿Estás seguro que quieres abandonar esta página?</h3>
                        <p>Hay información que no has guardado. Si te vas sin guardar perderás los cambios que has hecho.</p>
                        <div className="popup-buttons">
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
