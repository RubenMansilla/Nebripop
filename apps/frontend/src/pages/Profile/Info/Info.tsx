import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/ProfileSideBar/ProfileSideBar';
import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import './Info.css'
import ProfileData from '../../../components/Profile/Data/ProfileData';
import ReviewProfile from '../../../components/ReviewProfile/ReviewProfile';
import picture from '../../../assets/logos/image.png';

export default function Info() {

    const { logout } = useContext(AuthContext);

    /* info item active */
    const [selected, setSelected] = useState("perfil");

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
                                onClick={() => setSelected("perfil")}
                            >
                                <p>Perfil</p>
                            </div>
                            <div
                                className={`info-item ${selected === "valoraciones" ? "active" : ""}`}
                                onClick={() => setSelected("valoraciones")}
                            >
                                <p>Valoraciones</p>
                            </div>
                        </div>
                    </div>
                    {selected === "perfil" && <ProfileData />}
                    {selected === "valoraciones" && <ReviewProfile />}
                </div>
            </section>
        </>
    )
}
