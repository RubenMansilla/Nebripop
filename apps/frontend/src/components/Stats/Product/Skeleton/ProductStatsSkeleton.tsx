import React, { type JSX } from "react";
import './ProductStatsSkeleton.css';
// Importamos los estilos del componente real para heredar el GRID
import '../ProductStats.css';

export default function StatsSkeleton(): JSX.Element {
    const rows = Array(3).fill(0); // Muestra 3 filas de carga

    return (
        <>
            {/* HEADER - Mismas clases que el real */}
            <div className="stats-header">
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
            </div>

            {/* LISTADO */}
            {rows.map((_, index) => (
                <div className="product-stats-row" key={index}>

                    {/* COL 1: Info Producto (Estructura idéntica al real) */}
                    <div className="stats-product-info">

                        {/* Imagen + Precio Desktop */}
                        <div className='product-image-price'>
                            <div className="skeleton skeleton-img"></div>
                            {/* Este precio solo se ve en desktop gracias a CSS */}
                            <div className="skeleton skeleton-price desktop-price-skeleton"></div>
                        </div>

                        {/* Nombre + Precio/Fecha Mobile */}
                        <div className='product-stats-name' style={{ width: '100%' }}>
                            <div className="skeleton skeleton-text name-skeleton"></div>
                            <div className="skeleton skeleton-text short"></div>

                            {/* Precio Mobile (visible < 900px) */}
                            <div className="price-mobile">
                                <div className="skeleton skeleton-price mobile-price-skeleton"></div>
                            </div>

                            {/* Fecha Mobile (visible < 900px) */}
                            <div className="date-mobile" style={{ width: '100%', alignItems: 'flex-end' }}>
                                <div className="skeleton skeleton-text short" style={{ width: '60px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* COL 2: Fecha Desktop */}
                    <span className="date">
                        <div className="skeleton skeleton-text short"></div>
                    </span>

                    {/* COLS 3-5: Stats */}
                    <span className="stat stat-views">
                        <div className="skeleton skeleton-stat"></div>
                    </span>
                    <span className="stat stat-chats">
                        <div className="skeleton skeleton-stat"></div>
                    </span>
                    <span className="stat stat-favs">
                        <div className="skeleton skeleton-stat"></div>
                    </span>
                </div>
            ))}
        </>
    );
}