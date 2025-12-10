import Navbar from '../../../../components/Navbar/Navbar'
import CategoriesBar from '../../../../components/CategoriesBar/CategoriesBar'
import ProfileSideBar from '../../../../components/Profile/ProfileSideBar/ProfileSideBar';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function FavoritesProfiles() {

    const navigate = useNavigate();
    /* info item active */
    const [selected, setSelected] = useState("profiles");

    useEffect(() => {
        if (selected === "products") {
            navigate("/favorites/products");
        }
    }, [selected, navigate]);

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
                                <h1>Tus favoritos</h1>
                            </div>
                            <div className="description">
                                <p>Estos son los perfiles de Nebripop que más te gustan</p>
                            </div>
                        </div>
                    </div>
                    <div className="info-selector">
                        <div className="info-items">
                            <div
                                className={`info-item ${selected === "products" ? "active" : ""}`}
                                onClick={() => setSelected("products")}
                            >
                                <p>Productos</p>
                            </div>
                            <div
                                className={`info-item ${selected === "profiles" ? "active" : ""}`}
                                onClick={() => setSelected("profiles")}
                            >
                                <p>Perfiles</p>
                            </div>
                        </div>
                    </div>
                    {/* <ul className="product-container">
                        {Activeproducts.length === 0 ? (
                            [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
                        ) : (
                            visibleProducts.map((p) => (
                                <Product key={p.id} product={p} mode="active" />
                            ))
                        )}
                    </ul> */}
                    {/* {hasMore && (
                        <div className="btn-more-reviews-container" onClick={showMore}>
                            <div className='btn-more-reviews'>
                                Ver más productos
                            </div>
                        </div>
                    )} */}
                </div>
            </section>
        </>
    )
}
