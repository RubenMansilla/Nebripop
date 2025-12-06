import './Product.css'
import type { ProductType } from '../../types/product';
import { useState } from 'react';

export default function Product({ product }: { product: ProductType }) {

    // 1. Estado para saber qué imagen del array mostrar (empieza en la 0)
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    // 2. Estado para controlar el esqueleto de carga
    const [imageLoaded, setImageLoaded] = useState(false);

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
                        <div className="favorite">
                            <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M24.1434 12.9098L13.5184 23.4328L2.89341 12.9098C2.19259 12.2279 1.64057 11.4082 1.2721 10.5024C0.903637 9.59661 0.726707 8.62434 0.752456 7.64682C0.778205 6.66929 1.00608 5.70769 1.42172 4.82255C1.83736 3.93742 2.43177 3.14794 3.16752 2.50381C3.90326 1.85969 4.76441 1.37489 5.69673 1.07992C6.62904 0.784964 7.61234 0.686238 8.58468 0.789962C9.55703 0.893687 10.4974 1.19762 11.3465 1.68261C12.1956 2.16761 12.9351 2.82316 13.5184 3.60799C14.1043 2.82886 14.8446 2.17903 15.6931 1.69918C16.5417 1.21934 17.4801 0.919797 18.4497 0.819314C19.4194 0.71883 20.3993 0.819566 21.3282 1.11522C22.2571 1.41086 23.1149 1.89506 23.8481 2.53751C24.5813 3.17995 25.1739 3.96681 25.589 4.84884C26.0041 5.73087 26.2326 6.68908 26.2603 7.6635C26.2881 8.63792 26.1144 9.60757 25.7501 10.5118C25.3858 11.416 24.8389 12.2352 24.1434 12.9183" stroke="#253238" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div className="product-title">
                        <p>{product.name}</p>
                    </div>
                    <div className='product-delivery'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#86418a" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M3.75 5.25a.75.75 0 0 1 .75-.75h9.75a.75.75 0 0 1 .75.75V12H.75a.75.75 0 0 0 0 1.5h1.5v3a2.25 2.25 0 0 0 2.25 2.25h.02a3.375 3.375 0 0 0 6.71 0h3.79a3.375 3.375 0 0 0 6.71 0h.02A2.25 2.25 0 0 0 24 16.5v-2.062a2.25 2.25 0 0 0-.556-1.48l-1.924-2.202-.032-.034-.206-.235-1.093-3.006A2.25 2.25 0 0 0 18.074 6H16.5v-.75A2.25 2.25 0 0 0 14.25 3H4.5a2.25 2.25 0 0 0-2.25 2.25V9a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-6zm16.463 13.5a1.876 1.876 0 1 1-3.676-.751 1.876 1.876 0 0 1 3.675.751m-12.338 1.5a1.876 1.876 0 1 1 0-3.751 1.876 1.876 0 0 1 0 3.751M16.5 10.5h3.19l-.91-2.506a.75.75 0 0 0-.706-.494H16.5z" clip-rule="evenodd"></path></svg>
                        <p>Envío disponible</p>
                    </div>
                </div>
            </li>
        </>
    )
}
