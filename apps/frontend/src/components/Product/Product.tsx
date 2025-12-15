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
                                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8.5 15L1.5 8L8.5 1" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        )
                    }
                    {
                        currentImgIndex < totalImages - 1 && (
                            <button className="img-btn next-btn" onClick={handleNext}>
                                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.5 1L8.5 8L1.5 15" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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

                    {(mode === "public" || mode === "active") && (
                        <div className="product-delivery">
                            {product.shipping_active ? (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="#86418a"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        focusable="false">
                                        <path fill-rule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 .75.75V12H.75a.75.75 0 0 0 0 1.5h1.5v3a2.25 2.25 0 0 0 2.25 2.25h.02a3.375 3.375 0 0 0 6.71 0h3.79a3.375 3.375 0 0 0 6.71 0h.02A2.25 2.25 0 0 0 24 16.5v-2.062a2.25 2.25 0 0 0-.556-1.48l-1.924-2.202-.032-.034-.206-.235-1.093-3.006A2.25 2.25 0 0 0 18.074 6H16.5v-.75A2.25 2.25 0 0 0 14.25 3H4.5a2.25 2.25 0 0 0-2.25 2.25V9a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-6zm16.463 13.5a1.876 1.876 0 1 1-3.676-.751 1.876 1.876 0 0 1 3.675.751m-12.338 1.5a1.876 1.876 0 1 1 0-3.751 1.876 1.876 0 0 1 0 3.751M16.5 10.5h3.19l-.91-2.506a.75.75 0 0 0-.706-.494H16.5z" clip-rule="evenodd"></path>
                                    </svg>
                                    <p className="delivery-available">Envío disponible</p>
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        fill="#5c7a89"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                        focusable="false">
                                        <path fill-rule="evenodd" d="M15 7.496a3 3 0 0 1-1.323 2.488A6.004 6.004 0 0 1 18 15.748a.75.75 0 1 1-1.5 0 4.5 4.5 0 1 0-9 0 .75.75 0 1 1-1.5 0 6.004 6.004 0 0 1 4.323-5.764A3 3 0 1 1 15 7.496m-3 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3" clip-rule="evenodd"></path><path fill-rule="evenodd" d="m12.54 23.816.075-.039C15 22.5 22.5 18 22.498 10.497 22.498 4.495 18 0 12 0S1.5 4.495 1.5 10.495C1.5 18 9 22.5 11.382 23.78l.016.008c.187.1.396.213.602.213.186 0 .367-.094.54-.184m-5.92-5.394c1.964 2.01 4.212 3.351 5.377 3.984 1.165-.63 3.416-1.973 5.382-3.984 2.018-2.064 3.62-4.709 3.62-7.925C20.996 5.324 17.171 1.5 12 1.5s-9 3.825-9 8.995c0 3.218 1.603 5.863 3.62 7.927" clip-rule="evenodd"></path></svg>
                                    <p className="delivery-unavailable">
                                        Solo venta en persona
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div >
            </li >

            {/* ================= POPUP ================= */}
            {showPopup && (
                <div className="popup-backdrop">
                    <div className="unsaved-changes-popup">
                        <h3>¿Estás seguro que quieres eliminar este producto?</h3>
                        <p>Esta acción no se puede deshacer. Si eliminas el producto, se perderá toda la información asociada.</p>
                        <div className="popup-buttons">
                            <span className="popup-no" onClick={handleCancelDelete}>No</span>
                            <span className="divider"></span>
                            <span className="popup-yes" onClick={handleConfirmDelete}>Sí, eliminar</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
