import { Outlet } from "react-router-dom";
import './ProfileLayout.css';
import Navbar from "../../Navbar/Navbar";
import CategoriesBar from "../../CategoriesBar/CategoriesBar";
import ProfileSideBar from "../ProfileSideBar/ProfileSideBar";

export default function ProfileLayout() {
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
                <div className='sidebar-right'>
                    <Outlet />
                </div>
            </section>
        </>

    );
}