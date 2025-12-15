import Navbar from '../../../../components/Navbar/Navbar'
import CategoriesBar from '../../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import { getMySoldProducts } from "../../../../api/products.api";
import { AuthContext } from "../../../../context/AuthContext";
import Product from '../../../../components/Product/Product';
import type { ProductType } from '../../../../types/product'
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import noReviewsImg from '../../../../assets/profile/pop-no-sales-completed.svg';

export default function SalesCompleted() {

    const navigate = useNavigate();
    /* info item active */
    const [selected, setSelected] = useState("completed");

    const { token } = useContext(AuthContext);
    const [Soldproducts, setSoldProducts] = useState<ProductType[]>([]);

    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = Soldproducts.slice(0, visibleCount);

    // Loading controla la lógica, pero showSkeleton controla lo visual
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    const showMore = () => {
        setVisibleCount(prev => prev + 25);
    };

    const hasMore = visibleCount < Soldproducts.length;

    useEffect(() => {
        if (selected === "ongoing") {
            navigate("/sales/ongoing");
        }
    }, [selected, navigate]);

    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setShowSkeleton(false); // Reseteamos al iniciar

        // Solo mostramos el skeleton si tarda más de 300ms
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMySoldProducts(token)
            .then((data) => {
                setSoldProducts(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                // Si la carga fue rápida (menos de 300ms), cancelamos el timer
                // El skeleton NUNCA habrá salido, y pasará directo a "Sin productos"
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        // Cleanup function por si el componente se desmonta
        return () => clearTimeout(skeletonTimer);

    }, [token]);

    const handleRemoveFromList = (deletedId: number) => {
        // Actualiza el estado local quitando el ID eliminado
        setSoldProducts(current => current.filter(p => p.id !== deletedId));
    };

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
                                <h1>Tus ventas</h1>
                            </div>
                            <div className="description">
                                <p>Estos son los productos de Nebripop que has vendido</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-selector">
                        <div className="info-items">
                            <div
                                className={`info-item ${selected === "ongoing" ? "active" : ""}`}
                                onClick={() => setSelected("ongoing")}
                            >
                                <p>En curso</p>
                            </div>
                            <div
                                className={`info-item ${selected === "completed" ? "active" : ""}`}
                                onClick={() => setSelected("completed")}
                            >
                                <p>Finalizadas</p>
                            </div>
                        </div>
                    </div>
                    {/* Está cargando Y ha pasado suficiente tiempo -> Muestra Skeleton */}
                    {loading && showSkeleton ? (
                        <ul className="product-container">
                            {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
                        </ul>
                    ) : (
                        /* Ya cargó (o cargó tan rápido que no salió skeleton) */
                        <>
                            {/* No hay productos */}
                            {Soldproducts.length === 0 && !loading && (
                                <div className="no-reviews">
                                    <img
                                        src={noReviewsImg}
                                        alt="Sin valoraciones"
                                        className="no-reviews-img"
                                    />
                                    <h3>Sin ventas finalizadas todavía</h3>
                                    <p>Cuando vendas un producto aparecerá aquí.</p>
                                </div>
                            )}

                            {/* Hay productos */}
                            {Soldproducts.length > 0 && (
                                <>
                                    <ul className="product-container">
                                        {visibleProducts.map((p) => (
                                            <Product key={p.id} product={p} mode="sold" onDelete={handleRemoveFromList} />
                                        ))}
                                    </ul>
                                    {hasMore && (
                                        <div className="btn-more-reviews-container" onClick={showMore}>
                                            <div className='btn-more-reviews'>Ver más productos</div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </section>
        </>
    )
}
