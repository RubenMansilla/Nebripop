import './Product.css'
import type { ProductType } from '../../types/product';
import { useState, useContext } from 'react';
import { addFavorite, removeFavorite } from '../../api/favorites.api';
import { AuthContext } from '../../context/AuthContext';

export default function Product({ product, mode, onUnfavorite }: { product: ProductType, mode: "public" | "active" | "sold" ; onUnfavorite?: (id: number) => void;}) {

    const { token } = useContext(AuthContext);

    // Estado para saber qué imagen del array mostrar (empieza en la 0)
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // Estado para controlar el esqueleto de carga
    const [imageLoaded, setImageLoaded] = useState(false);

    // Estado para favoritos ---
    const [isFavorite, setIsFavorite] = useState(product.isFavorite ?? false);

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

    // Guardamos las imágenes en una variable para acceso fácil (o array vacío si no hay)
    const images = product.images || [];
    const totalImages = images.length;

    // Funciones de navegación
    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation(); // Evita entrar al producto si haces click en la flecha
        if (currentImgIndex < totalImages - 1) {
            setImageLoaded(false); // Volvemos a mostrar el esqueleto mientras carga la nueva
            setCurrentImgIndex(prev => prev + 1);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImgIndex > 0) {
            setImageLoaded(false);
            setCurrentImgIndex(prev => prev - 1);
        }
    };

    return (
        <>
            <li className="product">
                <div className="product-img">
                    {/* Placeholder que se muestra SOLO si la imagen no ha cargado */}
                    {!imageLoaded && (
                        <div className="img-skeleton-loader"></div>
                    )}
                    <img
                        src={images[currentImgIndex]?.image_url}
                        alt={product.name}
                        onLoad={() => setImageLoaded(true)}
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                    />
                    {/* MOSTRAR FRANJA VENDIDO SOLO EN MODE=SOLD */}
                    {mode === "sold" && (
                        <div className="sold-banner">VENDIDO</div>
                    )}
                    <div className="img-counter">
                        {currentImgIndex + 1} / {totalImages}
                    </div>
                    {/* Mostrar el botón "Anterior" solo si no estamos en la primera imagen */}
                    {currentImgIndex > 0 && (
                        <button className="img-btn prev-btn" onClick={handlePrev}>
                            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8.5 15L1.5 8L8.5 1" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                    {/* Mostrar el botón "Siguiente" solo si no estamos en la última imagen */}
                    {currentImgIndex < totalImages - 1 && (
                        <button className="img-btn next-btn" onClick={handleNext}>
                            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.5 1L8.5 8L1.5 15" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    )}
                </div>
                <div className="product-info">
                    <div className="product-price">
                        <p>{product.price} €</p>
                        <div className='product-actions'>
                            {mode === "public" && (
                                <div className="favorite" onClick={toggleFavorite}>
                                    {isFavorite ? (
                                        // Favorito (relleno)
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="28"
                                            height="28"
                                            fill="#ce3528"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path d="M12 21s-5.9-3.1-9-7.5S3 3 7.5 3C9.6 3 12 5 12 5s2.4-2 4.5-2C21 3 24 7.5 21 13.5S12 21 12 21z" />
                                        </svg>
                                    ) : (
                                        // No favorito (contorno)
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="28"
                                            height="28"
                                            fill="#29363d"
                                            stroke='#29363d'
                                            viewBox="0 0 23 24"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path d="M8.411 3.75c1.216.004 2.4.385 3.373 1.09l.005.004q.093.069.211.072a.4.4 0 0 0 .225-.072l.005-.004a5.8 5.8 0 0 1 3.39-1.09h.011a6.37 6.37 0 0 1 4.304 1.737c1.148 1.096 1.804 2.581 1.815 4.142v.005c0 3.182-1.948 5.652-3.974 7.362-2.037 1.72-4.277 2.777-5.144 3.135l-.012.005a1.7 1.7 0 0 1-.609.113 1.6 1.6 0 0 1-.657-.124c-.838-.366-3.077-1.419-5.118-3.133-2.029-1.704-3.986-4.168-3.986-7.358v-.005c.01-1.566.672-3.056 1.827-4.152A6.38 6.38 0 0 1 8.4 3.75zm4.702 2.303c-.323.238-.719.36-1.108.363h-.01c-.4-.003-.778-.13-1.094-.363a4.3 4.3 0 0 0-2.49-.803A4.88 4.88 0 0 0 5.11 6.565a4.28 4.28 0 0 0-1.36 3.071c.001 2.536 1.56 4.619 3.45 6.207 1.868 1.569 3.94 2.551 4.738 2.9l.019.006h.048a.3.3 0 0 0 .066-.009c.793-.328 2.87-1.314 4.738-2.89 1.887-1.594 3.44-3.683 3.441-6.214a4.28 4.28 0 0 0-1.35-3.063 4.88 4.88 0 0 0-3.285-1.323 4.3 4.3 0 0 0-2.502.803" clip-rule="evenodd"></path> </svg>
                                    )}
                                </div>
                            )}
                            {/* EDITAR SOLO EN ACTIVE */}
                            {mode === "active" && (
                                <div className="edit-btn" onClick={() => console.log("EDITAR", product.id)}>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="32" height="32"
                                        viewBox="0 0 24 24"
                                    >
                                        <g fill="none"
                                            stroke="#000000"
                                            stroke-width="2"
                                        >
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.333 16.048L16.57 3.81a2.56 2.56 0 0 1 3.62 3.619L7.951 19.667a2 2 0 0 1-1.022.547L3 21l.786-3.93a2 2 0 0 1 .547-1.022" /><path d="m14.5 6.5l3 3" />
                                        </g>
                                    </svg>
                                </div>
                            )}

                            {/* ELIMINAR SOLO EN ACTIVE */}
                            {mode === "active" && (
                                <div className="delete-btn" onClick={() => console.log("BORRAR", product.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" stroke="#000000" stroke-width="1.5"><path d="M3.04 4.294a.5.5 0 0 1 .191-.479C3.927 3.32 6.314 2 12 2s8.073 1.32 8.769 1.815a.5.5 0 0 1 .192.479l-1.7 12.744a4 4 0 0 1-1.98 2.944l-.32.183a10 10 0 0 1-9.922 0l-.32-.183a4 4 0 0 1-1.98-2.944z" /><path d="M3 5c2.571 2.667 15.429 2.667 18 0" /></g></svg>                                </div>
                            )}
                        </div>
                    </div>
                    <div className="product-title">
                        <p>{product.name}</p>
                    </div>
                    {/* ENVÍO SOLO EN PUBLIC O ACTIVE */}
                    {(mode === "public" || mode === "active") && product.shipping_active && (
                        <div className='product-delivery'>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#86418a" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 .75.75V12H.75a.75.75 0 0 0 0 1.5h1.5v3a2.25 2.25 0 0 0 2.25 2.25h.02a3.375 3.375 0 0 0 6.71 0h3.79a3.375 3.375 0 0 0 6.71 0h.02A2.25 2.25 0 0 0 24 16.5v-2.062a2.25 2.25 0 0 0-.556-1.48l-1.924-2.202-.032-.034-.206-.235-1.093-3.006A2.25 2.25 0 0 0 18.074 6H16.5v-.75A2.25 2.25 0 0 0 14.25 3H4.5a2.25 2.25 0 0 0-2.25 2.25V9a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-6zm16.463 13.5a1.876 1.876 0 1 1-3.676-.751 1.876 1.876 0 0 1 3.675.751m-12.338 1.5a1.876 1.876 0 1 1 0-3.751 1.876 1.876 0 0 1 0 3.751M16.5 10.5h3.19l-.91-2.506a.75.75 0 0 0-.706-.494H16.5z" clip-rule="evenodd"></path></svg>
                            <p>Envío disponible</p>
                        </div>
                    )}
                </div>
            </li>
        </>
    )
}

<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#29363d" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M8.411 3.75c1.216.004 2.4.385 3.373 1.09l.005.004q.093.069.211.072a.4.4 0 0 0 .225-.072l.005-.004a5.8 5.8 0 0 1 3.39-1.09h.011a6.37 6.37 0 0 1 4.304 1.737c1.148 1.096 1.804 2.581 1.815 4.142v.005c0 3.182-1.948 5.652-3.974 7.362-2.037 1.72-4.277 2.777-5.144 3.135l-.012.005a1.7 1.7 0 0 1-.609.113 1.6 1.6 0 0 1-.657-.124c-.838-.366-3.077-1.419-5.118-3.133-2.029-1.704-3.986-4.168-3.986-7.358v-.005c.01-1.566.672-3.056 1.827-4.152A6.38 6.38 0 0 1 8.4 3.75zm4.702 2.303c-.323.238-.719.36-1.108.363h-.01c-.4-.003-.778-.13-1.094-.363a4.3 4.3 0 0 0-2.49-.803A4.88 4.88 0 0 0 5.11 6.565a4.28 4.28 0 0 0-1.36 3.071c.001 2.536 1.56 4.619 3.45 6.207 1.868 1.569 3.94 2.551 4.738 2.9l.019.006h.048a.3.3 0 0 0 .066-.009c.793-.328 2.87-1.314 4.738-2.89 1.887-1.594 3.44-3.683 3.441-6.214a4.28 4.28 0 0 0-1.35-3.063 4.88 4.88 0 0 0-3.285-1.323 4.3 4.3 0 0 0-2.502.803" clip-rule="evenodd"></path></svg>