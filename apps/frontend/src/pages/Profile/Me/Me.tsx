import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import './Me.css'
import ProfileSideBar from '../../../components/ProfileSideBar/ProfileSideBar';

export default function Me() {

    return (
        <>
            <Navbar />
            <div className="navbar-line"></div>
            <CategoriesBar />
            <section className='sidebar-container'>
                <ProfileSideBar />
                <div className='sidebar-right'>
                    <div className='sidebar-content'>
                    </div>
                </div>
            </section>
        </>
    )
}
