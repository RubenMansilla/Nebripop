import './Stats.css'
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from "../../../context/AuthContext";
import Navbar from '../../../components/Navbar/Navbar'
import CategoriesBar from '../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../components/Profile/ProfileSideBar/ProfileSideBar';
import ProductStats from '../../../components/Stats/Product/ProductStats';
import FinanceStats from '../../../components/Stats/Finance/FinanceStats';
import { getMostViewedProducts, getFinancialStats } from "../../../api/products.api";
import noReviewsImg from '../../../assets/profile/pop-no-stats.svg';
import ProductStatsSkeleton from '../../../components/Stats/Product/Skeleton/ProductStatsSkeleton';
import FinanceStatsSkeleton from '../../../components/Stats/Finance/Skeleton/FinanceSkeleton';
import type { FinancialDataPoint } from '../../../types/financialDataPoint';


export default function Stats() {

    const { token } = useContext(AuthContext);

    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [products, setProducts] = useState([]);

    const [financeRange, setFinanceRange] = useState('year');
    const [financeData, setFinanceData] = useState<FinancialDataPoint[]>([]);
    const [globalViews, setGlobalViews] = useState(0);

    useEffect(() => {

        if (!token) return;

        setLoading(true);
        setShowSkeleton(false);

        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 400);

        const loadAllStats = async () => {
            try {
                const [productsRes, financeRes] = await Promise.all([
                    getMostViewedProducts(token),
                    getFinancialStats(token, financeRange)
                ]);

                setProducts(productsRes || []);
                setFinanceData(financeRes.chartData || []);
                setGlobalViews(financeRes.meta?.totalViews || 0);

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                clearTimeout(skeletonTimer);
                setLoading(false);
            }
        };

        loadAllStats();

        // Limpieza si el componente se desmonta antes de terminar
        return () => clearTimeout(skeletonTimer);

    }, [token, financeRange]);

    // LÓGICA PARA SABER SI ESTÁ VACÍO
    const hasProducts = products.length > 0;

    // Para finanzas, comprobar si hay algún ingreso, gasto o venta en el array
    const hasFinanceActivity = financeData.some(item =>
        (item.ingresos > 0) || (item.gastos > 0) || (item.ventas > 0) || (item.reviews > 0)
    ) || globalViews > 0;

    const isEmpty = !hasProducts && !hasFinanceActivity;

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
                                <h1>Estadísticas</h1>
                            </div>
                            <div className="description">
                                <p>Echemos cuentas... Controla cuáles de tus productos tienen más éxito para mejorar tus ventas</p>
                            </div>
                        </div>
                    </div>
                    {loading && showSkeleton ? (
                        <div className="stats-container">
                            <ProductStatsSkeleton />
                            <div className="finance-stats">
                                <FinanceStatsSkeleton />
                            </div>
                        </div>
                    ) : loading && !showSkeleton ? (
                        <div style={{ minHeight: '600px' }}></div>
                    ) : isEmpty ? (
                        <div className="no-stats">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>Sin estadísticas todavía</h3>
                            <p>
                                Para ver estadísticas, primero dale vidilla a tu catálogo: sube, destaca... ¡esas cosas que hacemos aquí en Nebripop!
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="stats-container">
                                <ProductStats data={products} />
                                <div className="finance-stats">
                                    <FinanceStats
                                        data={financeData}
                                        globalViews={globalViews}
                                        range={financeRange}
                                        setRange={setFinanceRange}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </section>
        </>
    )
}