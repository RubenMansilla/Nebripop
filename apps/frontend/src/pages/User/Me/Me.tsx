import './Me.css'
import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import MobileSideBar from '../../../components/Profile/ProfileSideBar/Mobile/MobileSideBar';
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function Me() {

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // Lógica de redirección al cargar el componente
        if (window.innerWidth > 990) {
            navigate('/catalog/published');
        }
    }, [navigate]);

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    useEffect(() => {
        const navbar = document.querySelector('.header-block-container');
        const catBar = document.querySelector('.category-block-container');
        if (!navbar || !catBar) return;

        const update = () => {
            const total = navbar.getBoundingClientRect().height + catBar.getBoundingClientRect().height;
            document.documentElement.style.setProperty('--header-total-height', `${total}px`);
        };

        const ro = new ResizeObserver(update);
        ro.observe(navbar);
        ro.observe(catBar);
        update();

        return () => ro.disconnect();
    }, []);

    if (!user) return null;

    return (
        <>
            <Navbar />
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