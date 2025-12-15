import "./Product.css";
import './Product.css'
import type { ProductType } from '../../types/product';
import { useState, useContext } from 'react';
import { addFavorite, removeFavorite } from '../../api/favorites.api';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { deleteProduct } from '../../api/products.api';
import { hideSoldTransaction, hidePurchasedTransaction } from '../../api/purchases.api';

export default function Product({ product, mode, onUnfavorite, onDelete }: { product: ProductType, mode: "public" | "active" | "sold" | "purchased", onUnfavorite?: (id: number) => void; onDelete?: (id: number) => void }) {

    const { token } = useContext(AuthContext);

    // Popup eliminar
    const [showPopup, setShowPopup] = useState(false);

    // Slider imágenes
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Favoritos
    const [isFavorite, setIsFavorite] = useState(product.isFavorite ?? false);

    /* ================= ELIMINAR PRODUCTO ================= */

    const handleDeleteClick = (productId: number) => {
        setShowPopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!token) {
            toast.error("Error de autenticación. Inicia sesión de nuevo.");
            return;
        }

        setShowPopup(false);

        if (onDelete) {
            onDelete(product.id);
        }

        try {
            // LÓGICA CONDICIONAL
            if (mode === "active") {
                // CASO 1: Producto en venta -> Borrado real (Soft/Hard Delete)
                await deleteProduct(product.id, token);
                toast.success("Producto eliminado correctamente.");
            }
            else if (mode === "sold") {
                // CASO 2: Producto vendido -> Ocultar del historial
                // NOTA: 'product.purchaseId' debe venir del backend en la lista de vendidos
                if (!product.purchaseId) {
                    throw new Error("No se encontró el ID de la transacción para ocultar.");
                }
                await hideSoldTransaction(product.purchaseId, token);
                toast.success("Venta ocultada del historial.");
            } else if (mode === "purchased") { // O el nombre que uses para la pestaña compras
                // Ocultar Compra
                if (!product.purchaseId) throw new Error("Falta ID de transacción");

                // Llamamos al endpoint de /buy/:id
                await hidePurchasedTransaction(product.purchaseId, token);
                toast.success("Compra ocultada del historial.");
            }

            // Actualizar la UI inmediatamente
            if (onDelete) {
                onDelete(product.id);
            }

        } catch (err: any) {
            console.error("Error en la acción:", err);
            // Mostramos el mensaje exacto que viene del backend o de la API
            toast.error(err.message || "Hubo un problema al procesar la solicitud.");

            // Opcional: Recargar si es un error crítico, pero mejor evitarlo si podemos manejar el estado
            // window.location.reload();
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
                    {/* MOSTRAR FRANJA SIEMPRE QUE ESTÉ VENDIDO */}
                    {product.sold && (
                        <div className="sold-banner">VENDIDO</div>
                    )}
                    {mode === "purchased" && (
                        <div className="sold-banner">COMPRADO</div>
                    )}
                    <div className="img-counter">
                        {totalImages > 0
                            ? `${currentImgIndex + 1} / ${totalImages}`
                            : "0 / 0"}
                    </div>

                    {
                        currentImgIndex > 0 && (
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
                        )
                    }

                    {
                        currentImgIndex < totalImages - 1 && (
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
                        )
                    }
                </div >

                {/* ================= INFO ================= */}
                < div className="product-info" >
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
                                <div className="delete-btn" onClick={() => handleDeleteClick(product.id)}>
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

                            {/* ELIMINAR SOLO EN ACTIVE, SOLD y PURCHASED */}
                            {(mode === "active" || mode === "sold" || mode === "purchased") && (
                                <div className="delete-btn" onClick={() => handleDeleteClick(product.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="#000000" stroke-width="1.5"><path d="M3.04 4.294a.5.5 0 0 1 .191-.479C3.927 3.32 6.314 2 12 2s8.073 1.32 8.769 1.815a.5.5 0 0 1 .192.479l-1.7 12.744a4 4 0 0 1-1.98 2.944l-.32.183a10 10 0 0 1-9.922 0l-.32-.183a4 4 0 0 1-1.98-2.944z" /><path d="M3 5c2.571 2.667 15.429 2.667 18 0" /></g></svg>                                </div>
                            )}

                        </div >
                    </div >

                    <div className="product-title">
                        <p>{product.name}</p>
                    </div>

                    {
                        (mode === "public" || mode === "active") && (
                            <div className="product-delivery">
                                {product.shipping_active ? (
                                    <p className="delivery-available">Envío disponible</p>
                                ) : (
                                    <p className="delivery-unavailable">
                                        Solo venta en persona
                                    </p>
                                )}
                            </div>
                        )
                    }
                </div >
            </li >

            {/* ================= POPUP ================= */}
            {
                showPopup && (
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
                )
            }
        </>
    );
}
