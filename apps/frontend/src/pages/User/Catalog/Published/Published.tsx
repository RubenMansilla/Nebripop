import './Published.css'
import Navbar from '../../../../components/Navbar/Navbar'
import CategoriesBar from '../../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useContext, useRef } from 'react';
import Product from '../../../../components/Product/Product';
import { getMyActiveProducts } from "../../../../api/products.api";
import type { ProductType } from '../../../../types/product';
import { AuthContext } from "../../../../context/AuthContext";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import { toast } from "react-toastify";
import noReviewsImg from '../../../../assets/profile/pop-nothing-for-sale.svg';

export default function Published() {

    const location = useLocation();
    const navigate = useNavigate();
    const hasShownToast = useRef(false);

    // --- State para la lógica de carga ---
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false); // Controla visualmente el skeleton

    const { token } = useContext(AuthContext);
    const [Activeproducts, setActiveProducts] = useState<ProductType[]>([]);

    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = Activeproducts.slice(0, visibleCount);

    const [selected, setSelected] = useState("published");

    const showMore = () => {
        setVisibleCount(prev => prev + 25);
    };

    const hasMore = visibleCount < Activeproducts.length;

    const handleRemoveFromList = (deletedId: number) => {
        setActiveProducts(current => current.filter(p => p.id !== deletedId));
    };


    useEffect(() => {
        if (location.state?.success && !hasShownToast.current) {
            hasShownToast.current = true;
            toast.success("Producto publicado correctamente", {
                style: {
                    borderRadius: "14px",
                    padding: "14px 18px",
                    backgroundColor: "#f6fff8",
                    color: "#114b2c",
                    border: "1px solid #d5f3df",
                    fontWeight: 500,
                    boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
                },
                progressStyle: {
                    background: "#28c76f",
                }
            });
            navigate(location.pathname, { replace: true });
        }
    }, [location.state, navigate, location.pathname]);

    useEffect(() => {
        if (selected === "sold") {
            navigate("/catalog/sold");
        }
    }, [selected, navigate]);
    useEffect(() => {
        if (!token) return;

        setLoading(true);
        setShowSkeleton(false);
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyActiveProducts(token)
            .then((data) => {
                setActiveProducts(data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        return () => clearTimeout(skeletonTimer);
    }, [token]);

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
            {loading && showSkeleton ? (
                <ul className="product-container">
                    {[...Array(5)].map((_, i) => <ProductSkeleton key={i} />)}
                </ul>
            ) : (
                <>
                    {Activeproducts.length === 0 && !loading && (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>Nada en venta todavía</h3>
                            <p>
                                Cuando publiques un producto aparecerá aquí.
                            </p>
                        </div>
                    )}
                    {Activeproducts.length > 0 && (
                        <>
                            <ul className="product-container">
                                {visibleProducts.map((p) => (
                                    <Product key={p.id} product={p} mode="active" onDelete={handleRemoveFromList} />
                                ))}
                            </ul>
                            {hasMore && (
                                <div className="btn-more-reviews-container" onClick={showMore}>
                                    <div className='btn-more-reviews'>
                                        Ver más productos
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    )
}