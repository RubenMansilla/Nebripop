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

export default function Solds() {

    const navigate = useNavigate();
    const [selected, setSelected] = useState("sold");
    const { token } = useContext(AuthContext);
    const [Soldproducts, setSoldProducts] = useState<ProductType[]>([]);

    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = Soldproducts.slice(0, visibleCount);

    // 1. Loading controla la lógica, pero showSkeleton controla lo visual
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    const showMore = () => {
        setVisibleCount(prev => prev + 25);
    };

    const hasMore = visibleCount < Soldproducts.length;

    useEffect(() => {
        if (selected === "published") {
            navigate("/catalog/published");
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
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tus productos</h1>
                    </div>
                    <div className="description">
                        <p>Aquí podrás subir productos, gestionar los que ya tienes y eliminar los que ya no quieras vender</p>
                    </div>
                </div>
            </div>
            <div className="info-selector">
                <div className="info-items">
                    <div
                        className={`info-item ${selected === "published" ? "active" : ""}`}
                        onClick={() => setSelected("published")}
                    >
                        <p>En venta</p>
                    </div>
                    <div
                        className={`info-item ${selected === "sold" ? "active" : ""}`}
                        onClick={() => setSelected("sold")}
                    >
                        <p>Vendidos</p>
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
                            <p>Si quieres vender algo, simplemente súbelo.</p>
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
        </>
    )
}