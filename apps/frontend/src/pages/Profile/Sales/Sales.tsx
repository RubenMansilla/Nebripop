import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/ProfileSideBar/ProfileSideBar';

export default function Sales() {

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
                    <div className='sidebar-content'>
                    </div>
                </div>
            </section>
        </>
    )
}
