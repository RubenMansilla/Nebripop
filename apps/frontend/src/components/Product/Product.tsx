import "./Product.css";
import type { ProductType } from "../../types/product";
import { useState, useContext } from "react";
import { addFavorite, removeFavorite } from "../../api/favorites.api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { deleteProduct } from "../../api/products.api";

export default function Product({
    product,
    mode,
    onUnfavorite,
    onDelete,
}: {
    product: ProductType;
    mode: "public" | "active" | "sold";
    onUnfavorite?: (id: number) => void;
    onDelete?: (id: number) => void;
}) {
    const { token } = useContext(AuthContext);

    // Popup eliminar
    const [showPopup, setShowPopup] = useState(false);

    // Slider imágenes
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Favoritos
    const [isFavorite, setIsFavorite] = useState(product.isFavorite ?? false);

    /* ================= ELIMINAR PRODUCTO ================= */

    const handleDeleteClick = () => {
        setShowPopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!token) {
            toast.error("Error de autenticación. Inicia sesión de nuevo.");
            return;
        }

        setShowPopup(false);

        try {
            await deleteProduct(product.id, token);
            toast.success("Producto eliminado correctamente.");

            if (onDelete) onDelete(product.id);
        } catch (err) {
            console.error("Error eliminando producto:", err);
            toast.error("Hubo un problema al eliminar el producto.");
        }
    };

    const handleCancelDelete = () => {
        setShowPopup(false);
    };

    /* ================= FAVORITOS ================= */

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) return;

        try {
            if (isFavorite) {
                await removeFavorite(product.id, token);
                setIsFavorite(false);

                if (onUnfavorite) onUnfavorite(product.id);
            } else {
                await addFavorite(product.id, token);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
        }
    };

    /* ================= IMÁGENES ================= */

    const images = product.images || [];
    const totalImages = images.length;

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImgIndex < totalImages - 1) {
            setCurrentImgIndex((prev) => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImgIndex > 0) {
            setCurrentImgIndex((prev) => prev - 1);
        }
    };

    return (
        <>
            <li className="product">
                {/* ================= IMAGEN ================= */}
                <div className="product-img">
                    <div
                        className="slider-track"
                        style={{ transform: `translateX(-${currentImgIndex * 100}%)` }}
                    >
                        {images.length > 0 ? (
                            images.map((img, index) => (
                                <img
                                    key={index}
                                    src={img.image_url}
                                    alt={`${product.name} - ${index + 1}`}
                                />
                            ))
                        ) : (
                            <img src="/placeholder-image.png" alt="Sin imagen" />
                        )}
                    </div>

                    {mode === "sold" && (
                        <div className="sold-banner">VENDIDO</div>
                    )}

                    <div className="img-counter">
                        {totalImages > 0
                            ? `${currentImgIndex + 1} / ${totalImages}`
                            : "0 / 0"}
                    </div>

                    {currentImgIndex > 0 && (
                        <button className="img-btn prev-btn" onClick={handlePrev}>
                            <svg width="10" height="16" viewBox="0 0 10 16">
                                <path
                                    d="M8.5 15L1.5 8L8.5 1"
                                    stroke="#222"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}

                    {currentImgIndex < totalImages - 1 && (
                        <button className="img-btn next-btn" onClick={handleNext}>
                            <svg width="10" height="16" viewBox="0 0 10 16">
                                <path
                                    d="M1.5 1L8.5 8L1.5 15"
                                    stroke="#222"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ================= INFO ================= */}
                <div className="product-info">
                    <div className="product-price">
                        <p>{product.price} €</p>

                        <div className="product-actions">
                            {mode === "public" && (
                                <div className="favorite" onClick={toggleFavorite}>
                                    {isFavorite ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="28"
                                            height="28"
                                            fill="#ce3528"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M12 21s-5.9-3.1-9-7.5S3 3 7.5 3C9.6 3 12 5 12 5s2.4-2 4.5-2C21 3 24 7.5 21 13.5S12 21 12 21z" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="28"
                                            height="28"
                                            fill="#29363d"
                                            viewBox="0 0 23 24"
                                        >
                                            <path d="M8.411 3.75c1.216.004 2.4.385 3.373 1.09..." />
                                        </svg>
                                    )}
                                </div>
                            )}

                            {(mode === "active" || mode === "sold") && (
                                <div className="delete-btn" onClick={handleDeleteClick}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                    >
                                        <g fill="none" stroke="#000" strokeWidth="1.5">
                                            <path d="M3.04 4.294..." />
                                        </g>
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="product-title">
                        <p>{product.name}</p>
                    </div>

                    {(mode === "public" || mode === "active") && (
                        <div className="product-delivery">
                            {product.shipping_active ? (
                                <p className="delivery-available">Envío disponible</p>
                            ) : (
                                <p className="delivery-unavailable">
                                    Solo venta en persona
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </li>

            {/* ================= POPUP ================= */}
            {showPopup && (
                <div className="popup-backdrop">
                    <div className="unsaved-changes-popup">
                        <h3>¿Eliminar producto?</h3>
                        <p>Esta acción no se puede deshacer.</p>
                        <div className="popup-buttons">
                            <span onClick={handleCancelDelete}>No</span>
                            <span onClick={handleConfirmDelete}>Sí, eliminar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
