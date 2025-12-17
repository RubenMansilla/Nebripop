import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Wallet() {

    const navigate = useNavigate();
    const [selected, setSelected] = useState("monedero");

    useEffect(() => {
        if (selected === "ongoing") {
            navigate("/purchases/ongoing");
        }
    }, [selected, navigate]);

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
                                <h1>Monedero</h1>
                            </div>
                            <div className="description">
                                <p>Gestiona tu monedero y controla tus finanzas personales de manera sencilla y segura.</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-selector">
                        <div className="info-items">
                            <div
                                className={`info-item ${selected === "monedero" ? "active" : ""}`}
                                onClick={() => setSelected("monedero")}
                            >
                                <p>Monedero</p>
                            </div>
                            <div
                                className={`info-item ${selected === "datos" ? "active" : ""}`}
                                onClick={() => setSelected("datos")}
                            >
                                <p>Datos</p>
                            </div>
                            <div
                                className={`info-item ${selected === "historial" ? "active" : ""}`}
                                onClick={() => setSelected("historial")}
                            >
                                <p>Historial</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
