import "./FavoritesAuctions.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import AuctionCard from "../../../../components/Auctions/AuctionCard/AuctionCard";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import { getMyFavoriteAuctions } from "../../../../api/favorites.api";
import { AuthContext } from "../../../../context/AuthContext";
import noReviewsImg from "../../../../assets/profile/pop-no-favorite-products.svg"; // Reuse or get new image

export default function FavoritesAuctions() {
    const { token } = useContext(AuthContext);
    const [FavoriteAuctions, setFavoriteAuctions] = useState<any[]>([]);

    // PAGINACIÓN
    const [visibleCount, setVisibleCount] = useState(25);
    const visibleAuctions = FavoriteAuctions.slice(0, visibleCount);

    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    const showMore = () => {
        setVisibleCount((prev) => prev + 25);
    };

    const hasMore = visibleCount < FavoriteAuctions.length;

    // CARGAR FAVORITOS DEL USUARIO
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setShowSkeleton(false);

        // Solo mostramos el skeleton si tarda más de 300ms
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyFavoriteAuctions()
            .then((data: any[]) => {
                setFavoriteAuctions(data);
            })
            .catch((err: any) => {
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

    // NAVEGAR ENTRE PRODUCTOS / PERFILES / SUBASTAS
    const navigate = useNavigate();
    const [selected, setSelected] = useState("auctions");

    useEffect(() => {
        if (selected === "products") {
            navigate("/favorites/products");
        } else if (selected === "profiles") {
            navigate("/favorites/profiles");
        }
    }, [selected, navigate]);

    return (
        <>
            {/* CABECERA (Reused styles from info-section) */}
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Tus favoritos</h1>
                    </div>
                    <div className="description">
                        <p>Estas son las subastas de Nebripop que más te gustan</p>
                    </div>
                </div>
            </div>

            {/* SELECTOR */}

            <div className="info-selector">
                <div className="info-items-wallet">
                    <div
                        className={`info-item-wallet ${selected === "products" ? "active" : ""}`}
                        onClick={() => setSelected("products")}
                    >
                        <p>Productos</p>
                    </div>
                    <div
                        className={`info-item-wallet ${selected === "profiles" ? "active" : ""}`}
                        onClick={() => setSelected("profiles")}
                    >
                        <p>Perfiles</p>
                    </div>
                    <div
                        className={`info-item-wallet ${selected === "auctions" ? "active" : ""}`}
                        onClick={() => setSelected("auctions")}
                    >
                        <p>Subastas</p>
                    </div>
                </div>
            </div>

            {/* Está cargando Y ha pasado suficiente tiempo -> Muestra Skeleton */}
            {loading && showSkeleton ? (
                <div className="product-container">
                    {[...Array(5)].map((_, i) => (
                        <ProductSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {/* No hay subastas */}
                    {FavoriteAuctions.length === 0 && !loading && (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin favoritos"
                                className="no-reviews-img"
                            />
                            <h3>Subastas que te gustan</h3>
                            <p>Para guardar una subasta, pulsa el icono de favorito (❤️).</p>
                        </div>
                    )}

                    {/* LISTA DE SUBASTAS */}
                    {FavoriteAuctions.length > 0 && (
                        <>
                            <div className="product-container">
                                {visibleAuctions.map((auction) => (
                                    <AuctionCard key={auction.id} auction={auction} />
                                ))}
                            </div>
                            {hasMore && (
                                <div className="btn-more-reviews-container" onClick={showMore}>
                                    <div className="btn-more-reviews">Ver más subastas</div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
}
