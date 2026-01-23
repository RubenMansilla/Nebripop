import type React from "react";
import "./Product.css";
import type { ProductType } from "../../types/product";
import { useState, useContext, useEffect } from "react";
import { addFavorite, removeFavorite } from "../../api/favorites.api";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-toastify";
import { deleteProduct } from "../../api/products.api";
import { hideSoldTransaction, hidePurchasedTransaction } from "../../api/purchases.api";
import { useNavigate } from "react-router-dom";
import { useNotificationSettings } from "../../context/NotificationContext";

interface ProductProps {
    product: ProductType;
    mode: "public" | "active" | "sold" | "purchased" | "";
    onUnfavorite?: (id: number) => void;
    onDelete?: (id: number) => void;
}

export default function Product({ product, mode, onUnfavorite, onDelete }: ProductProps) {
    const { token, user } = useContext(AuthContext);
    const { notify } = useNotificationSettings();
    const navigate = useNavigate();

    const [showPopup, setShowPopup] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(product.isFavorite ?? false);

    const isOwner = user && user.id === product.owner_id;

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    const handleCardClick = () => {
        navigate(`/product/${product.id}`);
    };

    const handleDeleteClickWrapper = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        handleDeleteClick(id);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/product/edit/${product.id}`); // 🟣 Ruta de edición
    };

    const handleOptionsClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const willOpen = !showOptions;
        if (willOpen) {
            // Dispatch event to close other menus
            window.dispatchEvent(
                new CustomEvent("product-options-opened", {
                    detail: { id: product.id },
                })
            );
        }
        setShowOptions(willOpen);
    };

    useEffect(() => {
        const handleCloseMenu = () => setShowOptions(false);

        const handleOtherMenuOpened = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.id !== product.id) {
                setShowOptions(false);
            }
        };

        if (showOptions) {
            document.addEventListener("click", handleCloseMenu);
            window.addEventListener("product-options-opened", handleOtherMenuOpened);
        }

        return () => {
            document.removeEventListener("click", handleCloseMenu);
            window.removeEventListener("product-options-opened", handleOtherMenuOpened);
        };
    }, [showOptions, product.id]);

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
            if (mode === "active") {
                // Producto en venta -> eliminar (soft/hard en backend)
                await deleteProduct(product.id);
                notify("productActivity", "Producto eliminado correctamente", "success");
            } else if (mode === "sold") {
                // Producto vendido -> ocultar del historial de vendidos
                if (!product.purchaseId) {
                    throw new Error("No se encontró el ID de la transacción para ocultar");
                }
                await hideSoldTransaction(product.purchaseId);
                notify("productActivity", "Producto eliminado correctamente", "success");
            } else if (mode === "purchased") {
                // Compra realizada -> ocultar del historial de compras
                if (!product.purchaseId) throw new Error("Falta ID de transacción");
                await hidePurchasedTransaction(product.purchaseId);
                notify("productActivity", "Producto eliminado correctamente", "success");
            }

            if (onDelete) {
                onDelete(product.id);
            }
        } catch (err: any) {
            console.error("Error en la acción:", err);
            toast.error(err.message || "Hubo un problema al procesar la solicitud.");
        }
    };

    const handleCancelDelete = () => {
        setShowPopup(false);
    };

    /* ================= FAVORITOS ================= */
    const handleFavoriteClick = (e: React.MouseEvent) => {
        if (!isFavorite) {
            setIsAnimating(true);
        }
        toggleFavorite(e);
    };

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!token) {
            toast.error("Inicia sesión para guardar favoritos");
            return;
        }

        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            if (previousState) {
                await removeFavorite(product.id);
                if (onUnfavorite) onUnfavorite(product.id);
                notify("addedToFavorites", "Producto eliminado de favoritos", "info");
            } else {
                await addFavorite(product.id);
                notify("addedToFavorites", "Producto añadido a favoritos", "success");
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            setIsFavorite(previousState);
            toast.error("Error al actualizar favoritos");
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
            <li className="product" onClick={handleCardClick}>
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
                    {product.sold && <div className="sold-banner">VENDIDO</div>}
                    {mode === "purchased" && <div className="sold-banner">COMPRADO</div>}
                    <div className="img-counter">
                        {totalImages > 0
                            ? `${currentImgIndex + 1} / ${totalImages}`
                            : "0 / 0"}
                    </div>
                    {currentImgIndex > 0 && (
                        <button className="img-btn prev-btn" onClick={handlePrev}>
                            <svg
                                width="10"
                                height="16"
                                viewBox="0 0 10 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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
                            <svg
                                width="10"
                                height="16"
                                viewBox="0 0 10 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
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
                <div className="product-info">
                    <div className="product-price">
                        <p>{product.price} €</p>
                        <div className="product-actions">
                            {mode === "public" && !isOwner && (
                                <div
                                    className={`favorite favorite-icon-container ${isFavorite ? "liked" : ""
                                        } ${isAnimating ? "animating" : ""}`}
                                    onClick={handleFavoriteClick}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="28"
                                        height="28"
                                        viewBox="0 0 24 24"
                                        className="heart-svg"
                                    >
                                        <defs>
                                            <clipPath id={`heart-clip-${product.id}`}>
                                                <path d="M12 21s-5.9-3.1-9-7.5S3 3 7.5 3C9.6 3 12 5 12 5s2.4-2 4.5-2C21 3 24 7.5 21 13.5S12 21 12 21z" />
                                            </clipPath>
                                        </defs>
                                        <g transform="translate(0.5, 0)">
                                            <path
                                                className="heart-outline-path"
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M8.411 3.75c1.216.004 2.4.385 3.373 1.09l.005.004q.093.069.211.072a.4.4 0 0 0 .225-.072l.005-.004a5.8 5.8 0 0 1 3.39-1.09h.011a6.37 6.37 0 0 1 4.304 1.737c1.148 1.096 1.804 2.581 1.815 4.142v.005c0 3.182-1.948 5.652-3.974 7.362-2.037 1.72-4.277 2.777-5.144 3.135l-.012.005a1.7 1.7 0 0 1-.609.113 1.6 1.6 0 0 1-.657-.124c-.838-.366-3.077-1.419-5.118-3.133-2.029-1.704-3.986-4.168-3.986-7.358v-.005c.01-1.566.672-3.056 1.827-4.152A6.38 6.38 0 0 1 8.4 3.75zm4.702 2.303c-.323.238-.719.36-1.108.363h-.01c-.4-.003-.778-.13-1.094-.363a4.3 4.3 0 0 0-2.49-.803A4.88 4.88 0 0 0 5.11 6.565a4.28 4.28 0 0 0-1.36 3.071c.001 2.536 1.56 4.619 3.45 6.207 1.868 1.569 3.94 2.551 4.738 2.9l.019.006h.048a.3.3 0 0 0 .066-.009c.793-.328 2.87-1.314 4.738-2.89 1.887-1.594 3.44-3.683 3.441-6.214a4.28 4.28 0 0 0-1.35-3.063 4.88 4.88 0 0 0-3.285-1.323 4.3 4.3 0 0 0-2.502.803"
                                            />
                                        </g>
                                        <g clipPath={`url(#heart-clip-${product.id})`}>
                                            <circle
                                                className="heart-fill-circle"
                                                cx="12"
                                                cy="12"
                                                r="0"
                                            />
                                        </g>
                                    </svg>
                                </div>
                            )}
                            {(mode === "active" || mode === "sold" || mode === "purchased") && (
                                <div className="product-options-container">
                                    <div className="options-btn" onClick={handleOptionsClick}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="1" />
                                            <circle cx="19" cy="12" r="1" />
                                            <circle cx="5" cy="12" r="1" />
                                        </svg>
                                    </div>
                                    {showOptions && (
                                        <div className="popover-menu" onClick={(e) => e.stopPropagation()}>
                                            {mode === "active" && (
                                                <div
                                                    className="popover-option"
                                                    onClick={(e) => {
                                                        setShowOptions(false);
                                                        handleEditClick(e);
                                                    }}
                                                >
                                                    <span>Editar</span>
                                                </div>
                                            )}
                                            {(mode === "active" ||
                                                mode === "sold" ||
                                                mode === "purchased") && (
                                                    <div
                                                        className="popover-option delete"
                                                        onClick={(e) => {
                                                            setShowOptions(false);
                                                            handleDeleteClickWrapper(e, product.id);
                                                        }}
                                                    >
                                                        <span>Eliminar</span>
                                                    </div>
                                                )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="product-title">
                        <p>{product.name}</p>
                    </div>

                    <div className="product-delivery">
                        {product.shipping_active ? (
                            <>
                                <svg
                                    xmlns="http://wwwhttp://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="#86418a"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M3.75 5.25a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 .75.75V12H.75a.75.75 0 0 0 0 1.5h1.5v3a2.25 2.25 0 0 0 2.25 2.25h.02a3.375 3.375 0 0 0 6.71 0h3.79a3.375 3.375 0 0 0 6.71 0h.02A2.25 2.25 0 0 0 24 16.5v-2.062a2.25 2.25 0 0 0-.556-1.48l-1.924-2.202-.032-.034-.206-.235-1.093-3.006A2.25 2.25 0 0 0 18.074 6H16.5v-.75A2.25 2.25 0 0 0 14.25 3H4.5a2.25 2.25 0 0 0-2.25 2.25V9a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-6zm16.463 13.5a1.876 1.876 0 1 1-3.676-.751 1.876 1.876 0 0 1 3.675.751m-12.338 1.5a1.876 1.876 0 1 1 0-3.751 1.876 1.876 0 0 1 0 3.751M16.5 10.5h3.19l-.91-2.506a.75.75 0 0 0-.706-.494H16.5z"
                                        clipRule="evenodd"
                                    ></path>
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
                                    focusable="false"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M15 7.496a3 3 0 0 1-1.323 2.488A6.004 6.004 0 0 1 18 15.748a.75.75 0 1 1-1.5 0 4.5 4.5 0 1 0-9 0 .75.75 0 1 1-1.5 0 6.004 6.004 0 0 1 4.323-5.764A3 3 0 1 1 15 7.496m-3 1.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
                                        clipRule="evenodd"
                                    ></path>
                                    <path
                                        fillRule="evenodd"
                                        d="m12.54 23.816.075-.039C15 22.5 22.5 18 22.498 10.497 22.498 4.495 18 0 12 0S1.5 4.495 1.5 10.495C1.5 18 9 22.5 11.382 23.78l.016.008c.187.1.396.213.602.213.186 0 .367-.094.54-.184m-5.92-5.394c1.964 2.01 4.212 3.351 5.377 3.984 1.165-.63 3.416-1.973 5.382-3.984 2.018-2.064 3.62-4.709 3.62-7.925C20.996 5.324 17.171 1.5 12 1.5s-9 3.825-9 8.995c0 3.218 1.603 5.863 3.62 7.927"
                                        clipRule="evenodd"
                                    ></path>
                                </svg>
                                <p className="delivery-unavailable">Solo venta en persona</p>
                            </>
                        )}
                    </div>
                </div>
            </li>            {showPopup && (
                <div className="popup-backdrop">
                    <div className="unsaved-changes-popup">
                        <h3>¿Estás seguro que quieres eliminar este producto?</h3>
                        <p>
                            Esta acción no se puede deshacer. Si eliminas el producto, se
                            perderá toda la información asociada.
                        </p>
                        <div className="popup-buttons-product">
                            <span className="popup-no" onClick={handleCancelDelete}>
                                No
                            </span>
                            <span className="divider"></span>
                            <span className="popup-yes" onClick={handleConfirmDelete}>
                                Sí, eliminar
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
