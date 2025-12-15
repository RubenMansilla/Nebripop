import "./FavoritesProducts.css";

import Navbar from "../../../../components/Navbar/Navbar";
import CategoriesBar from "../../../../components/CategoriesBar/CategoriesBar";
import ProfileSideBar from "../../../../components/Profile/ProfileSideBar/ProfileSideBar";

import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import Product from "../../../../components/Product/Product";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";

import { getMyFavoriteProducts } from "../../../../api/favorites.api";
import type { ProductType } from "../../../../types/product";
import { AuthContext } from "../../../../context/AuthContext";

export default function FavoritesProducts() {
    const { token } = useContext(AuthContext);
    const [FavoriteProducts, setFavoriteProducts] = useState<ProductType[]>([]);

    // PAGINACIÓN
    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = FavoriteProducts.slice(0, visibleCount);

    const showMore = () => {
        setVisibleCount((prev) => prev + 25);
    };

    const hasMore = visibleCount < FavoriteProducts.length;

    // CARGAR FAVORITOS DEL USUARIO
  useEffect(() => {
    if (!token) return;

    getMyFavoriteProducts(token)
        .then((data) => {
            console.log("FAVORITOS:", data); // <-- AQUÍ
            setFavoriteProducts(data);
        })
        .catch((err) => console.error(err));
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
            <Navbar />
            <div className="navbar-line"></div>
            <CategoriesBar />

            <section className="sidebar-container">
                <div className="hide-left-sidebar">
                    <ProfileSideBar />
                </div>

                <div className="sidebar-right">

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
                                className={`info-item ${
                                    selected === "products" ? "active" : ""
                                }`}
                                onClick={() => setSelected("products")}
                            >
                                <p>Productos</p>
                            </div>

                            <div
                                className={`info-item ${
                                    selected === "profiles" ? "active" : ""
                                }`}
                                onClick={() => setSelected("profiles")}
                            >
                                <p>Perfiles</p>
                            </div>
                        </div>
                    </div>

                    {/* LISTA DE PRODUCTOS */}
                    <ul className="product-container">
                        {FavoriteProducts.length === 0 ? (
                            [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
                        ) : (
                            visibleProducts.map((p) => (
                                <Product
                                    key={p.id}
                                    product={p}
                                    mode="public"
                                    onUnfavorite={(id) =>
                                        setFavoriteProducts((prev) =>
                                            prev.filter((prod) => prod.id !== id)
                                        )
                                    }
                                />
                            ))
                        )}
                    </ul>

                    {/* BOTÓN VER MÁS */}
                    {hasMore && (
                        <div
                            className="btn-more-reviews-container"
                            onClick={showMore}
                        >
                            <div className="btn-more-reviews">
                                Ver más productos
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
