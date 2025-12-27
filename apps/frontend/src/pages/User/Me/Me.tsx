import './Me.css'
import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import MobileSideBar from '../../../components/Profile/ProfileSideBar/Mobile/MobileSideBar';
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Me() {

    const navigate = useNavigate();

    useEffect(() => {
        // Lógica de redirección al cargar el componente
        if (window.innerWidth > 990) {
            navigate('/catalog/published');
        }
    }, [navigate]);

    return (
        <>
            <Navbar />
            <div className="navbar-line"></div>
            <CategoriesBar />
            <section className='sidebar-container'>
                <div className='hide-left-sidebar'>
                    <ProfileSideBar />
                </div>
                <div className='sidebar-right-me'>
                    <MobileSideBar />
                </div>
            </section>
        </>
    )
}