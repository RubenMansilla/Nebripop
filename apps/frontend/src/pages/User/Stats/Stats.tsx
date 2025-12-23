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

    // Estado de carga global (para la primera vez que entras)
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    // Estado de carga específico solo para cuando cambias el rango
    const [isUpdatingFinance, setIsUpdatingFinance] = useState(false);

    const [products, setProducts] = useState([]);
    const [financeRange, setFinanceRange] = useState('year');
    const [financeData, setFinanceData] = useState<FinancialDataPoint[]>([]);
    const [globalViews, setGlobalViews] = useState(0);

    // 1. EFECTO DE CARGA INICIAL (Productos y configuración inicial)
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setShowSkeleton(false);

        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 400);

        const loadInitialData = async () => {
            try {
                // Cargamos productos solo una vez al inicio
                const productsRes = await getMostViewedProducts(token);
                setProducts(productsRes || []);

                // También cargamos las finanzas iniciales aquí para que todo aparezca junto
                const financeRes = await getFinancialStats(token, financeRange);
                setFinanceData(financeRes.chartData || []);
                setGlobalViews(financeRes.meta?.totalViews || 0);

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                clearTimeout(skeletonTimer);
                setLoading(false);
            }
        };

        loadInitialData();

        return () => clearTimeout(skeletonTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]); // Quitamos 'financeRange' de aquí para que no recargue todo


    // 2. EFECTO SOLO PARA FINANZAS (Cuando cambia el rango)
    useEffect(() => {
        if (!token || loading) return; // Si está cargando el inicial, no hacemos nada

        const updateFinance = async () => {
            setIsUpdatingFinance(true); // Opcional: podrías usar esto para poner un spinner pequeño en la gráfica
            try {
                const financeRes = await getFinancialStats(token, financeRange);
                setFinanceData(financeRes.chartData || []);
                setGlobalViews(financeRes.meta?.totalViews || 0);
            } catch (error) {
                console.error("Error actualizando finanzas:", error);
            } finally {
                setIsUpdatingFinance(false);
            }
        };

        updateFinance();

    }, [financeRange, token]); // Este sí depende del rango


    // LÓGICA PARA SABER SI ESTÁ VACÍO
    const hasProducts = products.length > 0;
    const hasFinanceActivity = financeData.some(item =>
        (item.ingresos > 0) || (item.gastos > 0) || (item.ventas > 0) || (item.reviews > 0)
    ) || globalViews > 0;

    const isEmpty = !hasProducts && !hasFinanceActivity;
    return (
        <>

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
                        <div className="finance-stats" style={{ opacity: isUpdatingFinance ? 0.6 : 1, transition: 'opacity 0.2s' }}>
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
        </>
    )
}