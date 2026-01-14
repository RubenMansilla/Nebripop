import "./FavoritesProducts.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import Product from "../../../../components/Product/Product";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import { getMyFavoriteProducts } from "../../../../api/favorites.api";
import type { ProductType } from "../../../../types/product";
import { AuthContext } from "../../../../context/AuthContext";
import noReviewsImg from '../../../../assets/profile/pop-no-favorite-products.svg';

export default function FavoritesProducts() {
    const { token } = useContext(AuthContext);
    const [FavoriteProducts, setFavoriteProducts] = useState<ProductType[]>([]);

    // PAGINACIÓN
    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = FavoriteProducts.slice(0, visibleCount);

    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);


    const showMore = () => {
        setVisibleCount((prev) => prev + 25);
    };

    const hasMore = visibleCount < FavoriteProducts.length;

    // CARGAR FAVORITOS DEL USUARIO
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setShowSkeleton(false);

        // Solo mostramos el skeleton si tarda más de 300ms
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyFavoriteProducts()
            .then((data) => {
                setFavoriteProducts(data);
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


    // NAVEGAR ENTRE PRODUCTOS / PERFILES
    const navigate = useNavigate();
    const [selected, setSelected] = useState("products");

    useEffect(() => {
        if (selected === "profiles") {
            navigate("/favorites/profiles");
        }
    }, [selected, navigate]);

    return (
        <>
            {/* CABECERA */}
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tus favoritos</h1>
                    </div>
                    <div className="description">
                        <p>Estos son los productos de Nebripop que más te gustan</p>
                    </div>
                </div>
            </div>

            {/* SELECTOR */}
            <div className="info-selector">
                <div className="info-items">
                    <div
                        className={`info-item ${selected === "products" ? "active" : ""
                            }`}
                        onClick={() => setSelected("products")}
                    >
                        <p>Productos</p>
                    </div>

                    <div
                        className={`info-item ${selected === "profiles" ? "active" : ""
                            }`}
                        onClick={() => setSelected("profiles")}
                    >
                        <p>Perfiles</p>
                    </div>
                </div>
            </div>

            {/* Está cargando Y ha pasado suficiente tiempo -> Muestra Skeleton */}
            {loading && showSkeleton ? (
                <ul className="product-container">
                    {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
                </ul>
            ) : (
                <>
                    {/* No hay productos */}
                    {FavoriteProducts.length === 0 && !loading && (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>Productos que te gustan</h3>
                            <p>Para guardar un producto, pulsa el icono de producto favorito (❤️).</p>
                        </div>
                    )}

                    {/* LISTA DE PRODUCTOS */}
                    {FavoriteProducts.length > 0 && (
                        <>
                            <ul className="product-container">
                                {visibleProducts.map((p) => (
                                    <Product key={p.id} product={p} mode="public" onUnfavorite={(id) =>
                                        setFavoriteProducts((prev) =>
                                            prev.filter((prod) => prod.id !== id)
                                        )
                                    } />
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
    );
}
