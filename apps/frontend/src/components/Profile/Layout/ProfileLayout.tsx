import { Outlet } from "react-router-dom";
import './ProfileLayout.css';
import Navbar from "../../Navbar/Navbar";
import CategoriesBar from "../../CategoriesBar/CategoriesBar";
import ProfileSideBar from "../ProfileSideBar/ProfileSideBar";
import { useLocation } from "react-router-dom";

export default function ProfileLayout() {

    const location = useLocation();

    const isChatPage = location.pathname.includes('/chat');

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
                <div className={`sidebar-right ${isChatPage ? 'chat-mode' : ''}`}>
                    <Outlet />
                </div>
            </section>
        </>

    );
}