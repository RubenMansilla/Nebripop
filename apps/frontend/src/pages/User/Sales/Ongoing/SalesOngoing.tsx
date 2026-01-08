import Navbar from '../../../../components/Navbar/Navbar'
import CategoriesBar from '../../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useContext } from 'react';
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import noReviewsImg from '../../../../assets/profile/pop-no-sales-progress.png';
import { AuthContext } from "../../../../context/AuthContext";
import Product from '../../../../components/Product/Product';
import type { ProductType } from '../../../../types/product'
import { getMySellingProcessProducts } from "../../../../api/products.api";

export default function SalesOngoing() {

    const { token } = useContext(AuthContext);
    const [sellingProcessProducts, setSellingProcessProducts] = useState<ProductType[]>([]);

    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = sellingProcessProducts.slice(0, visibleCount);

    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    const showMore = () => {
        setVisibleCount(prev => prev + 25);
    };

    const hasMore = visibleCount < sellingProcessProducts.length;
    const navigate = useNavigate();
    /* info item active */
    const [selected, setSelected] = useState("ongoing");

    useEffect(() => {
        if (selected === "completed") {
            navigate("/sales/completed");
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

        // CAMBIO AQUÍ: Llamamos a la función de "En proceso de venta"
        getMySellingProcessProducts()
            .then((data) => {
                setSellingProcessProducts(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                // Si la carga fue rápida (menos de 300ms), cancelamos el timer
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        // Cleanup function por si el componente se desmonta
        return () => clearTimeout(skeletonTimer);

    }, [token]);

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tus ventas</h1>
                    </div>
                    <div className="description">
                        <p>Estos son los productos de Nebripop que estan en proceso de venta</p>
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
                    {sellingProcessProducts.length === 0 && !loading && (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>Sin ventas en curso todavía</h3>
                            <p>Empieza a vender en Nebripop. ¡Ya verás qué bien te sienta!</p>
                        </div>
                    )}

                    {/* Hay productos */}
                    {sellingProcessProducts.length > 0 && (
                        <>
                            <ul className="product-container">
                                {visibleProducts.map((p) => (
                                    <Product key={p.id} product={p} mode="active" />
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
        </>
    )
}
