import './ProductStats.css';
import foto from '../../../assets/garden/conjunto.png';
import type { ProductStatData } from '../../../types/productStatData';

export default function ProductStats({ data }: { data: ProductStatData[] }) {

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (data.length === 0) return <div className="stats-row">No hay productos top aún.</div>;

    return (
        <>
            {/* HEADER */}
            <div className="stats-header">
                <span>PRODUCTO</span>
                <span>FECHA DE PUBLICACIÓN</span>
                <span>VISUALIZACIONES</span>
                <span>CHATS</span>
                <span>FAVORITOS</span>
            </div>

            {/* LISTADO DE PRODUCTOS */}
            {data.map((product) => (
                <div className="product-stats-row" key={product.id}>
                    <div className="stats-product-info">
                        <div className='product-image-price'>
                            <img
                                src={product.first_img || foto}
                                alt={product.name}
                                onError={(e) => (e.currentTarget.src = foto)}
                            />
                            <span className="price">{product.price}€</span>
                        </div>

                        <div className='product-stats-name'>
                            <p className="name">{product.name}</p>
                            <span className="price-mobile">{product.price}€</span>
                            <div className="date-mobile">{formatDate(product.created_at)}</div>
                        </div>

                    </div>

                    <span className="date">{formatDate(product.created_at)}</span>
                    <span className="stat stat-views">{product.views_count}</span>
                    <span className="stat stat-chats">{product.total_chats}</span>
                    <span className="stat stat-favs">{product.total_favorites}</span>
                </div>
            ))}
        </>
    );
}