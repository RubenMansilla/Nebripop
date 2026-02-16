import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import './ProfileLayout.css';
import Navbar from "../../Navbar/Navbar";
import CategoriesBar from "../../CategoriesBar/CategoriesBar";
import ProfileSideBar from "../ProfileSideBar/ProfileSideBar";
import { useLocation } from "react-router-dom";

export default function ProfileLayout() {

    const location = useLocation();

    const isChatPage = location.pathname.includes('/chat');

    const sidebarRightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (sidebarRightRef.current) {
            sidebarRightRef.current.scrollTo(0, 0);
        }
    }, [location.pathname]);

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

    return (
        <>
            <div className='navbar-and-categoriesbar'>
                <Navbar />
                <CategoriesBar />
            </div>
            <section className='sidebar-container'>
                <div className='hide-left-sidebar'>
                    <ProfileSideBar />
                </div>
                <div ref={sidebarRightRef} className={`sidebar-right ${isChatPage ? 'chat-mode' : ''}`}>
                    <Outlet />
                </div>
            </section>
        </>

    );
}