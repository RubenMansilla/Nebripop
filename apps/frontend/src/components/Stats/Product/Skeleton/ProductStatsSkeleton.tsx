import { type JSX } from "react";
import './ProductStatsSkeleton.css';
// Importamos los estilos del componente real para heredar el GRID
import '../ProductStats.css';

export default function StatsSkeleton(): JSX.Element {
    const rows = Array(3).fill(0); // Muestra 3 filas de carga

    return (
        <>
            {/* HEADER - Headers estáticos para evitar saltos visuales */}
            <div className="stats-header">
                <span>PRODUCTO</span>
                <span>FECHA DE PUBLICACIÓN</span>
                <span>VISUALIZACIONES</span>
                <span>CHATS</span>
                <span>FAVORITOS</span>
            </div>

            {/* LISTADO */}
            {rows.map((_, index) => (
                <div className="product-stats-row" key={index}>
                    {/* COL 1: Info Producto */}
                    <div className="stats-product-info">
                        <div className='product-image-price'>
                            <div className="skeleton skeleton-img"></div>
                            <div className="price">
                                <div className="skeleton skeleton-text short" style={{ width: '40px', height: '12px', display: 'inline-block', verticalAlign: 'middle' }}></div>
                            </div>
                        </div>

                        <div className='product-stats-name'>
                            <p className="name">
                                <div className="skeleton skeleton-text name-skeleton" style={{ width: '120px' }}></div>
                            </p>
                            <span className="price-mobile">
                                <div className="skeleton skeleton-text short" style={{ width: '40px', display: 'inline-block' }}></div>
                            </span>
                            <div className="date-mobile">
                                <div className="skeleton skeleton-text short" style={{ width: '70px' }}></div>
                            </div>
                        </div>
                    </div>

                    <span className="date">
                        <div className="skeleton skeleton-text short" style={{ width: '90px' }}></div>
                    </span>
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