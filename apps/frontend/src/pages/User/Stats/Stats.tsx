import './Stats.css'
import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';
import ProductStats from '../../../components/Stats/Product/ProductStats';
import FinanceStats from '../../../components/Stats/Finance/FinanceStats';

export default function Stats() {

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
                                <h1>Tus estadísticas</h1>
                            </div>
                            <div className="description">
                                <p>Echemos cuentas... Controla cuáles de tus productos tienen más exito para mejorar tus ventas</p>
                            </div>
                        </div>
                    </div>
                    <div className="stats-container">
                        <ProductStats />
                        <div className="finance-stats">
                            <FinanceStats />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
