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

export default function Solds() {

    const navigate = useNavigate();

    /* info item active */
    const [selected, setSelected] = useState("sold");

    const { token } = useContext(AuthContext);
    const [Soldproducts, setSoldProducts] = useState<ProductType[]>([]);

    const [visibleCount, setVisibleCount] = useState(25);
    const visibleProducts = Soldproducts.slice(0, visibleCount);

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

        getMySoldProducts(token)
            .then((data) => setSoldProducts(data))
            .catch((err) => console.error(err));
    }, [token]);

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
                    <ul className="product-container">
                        {Soldproducts.length === 0 ? (
                            [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
                        ) : (
                            visibleProducts.map((p) => (
                                <Product key={p.id} product={p} mode="sold" />
                            ))
                        )}
                    </ul>
                    {hasMore && (
                        <div className="btn-more-reviews-container" onClick={showMore}>
                            <div className='btn-more-reviews'>
                                Ver más productos
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}