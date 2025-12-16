import './ProductStats.css';
import foto from '../../../assets/garden/conjunto.png';
import { getMostViewedProducts } from "../../../api/products.api";
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from "../../../context/AuthContext";

// 1. DEFINIMOS EL TIPO DE DATOS QUE VIENE DEL BACK
interface ProductStatData {
    id: number;
    name: string;
    price: number;
    created_at: string;
    views_count: number;
    first_img: string | null;
    total_chats: number;
    total_favorites: number;
}

export default function ProductStats() {

    // 2. AÑADIMOS EL TIPO AL STATE <ProductStatData[]>
    const [products, setProducts] = useState<ProductStatData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                if (!token) {
                    setLoading(false);
                    return;
                }

                const data = await getMostViewedProducts(token);
                setProducts(data);
            } catch (err) {
                console.error(err);
                setError("No se pudieron cargar las estadísticas.");
            } finally {
                setLoading(false);
            }
        };

        fetchTopProducts();
    }, [token]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) return <div className="stats-loading">Cargando estadísticas...</div>;
    if (error) return <div className="stats-error">{error}</div>;

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
            {products.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    No hay estadísticas disponibles aún.
                </div>
            ) : (
                products.map((product) => (
                    <div className="stats-row" key={product.id}>
                        {/* INFO PRINCIPAL */}
                        <div className="stats-product-info">
                            <div className='product-image-price'>
                                <img
                                    src={product.first_img || foto}
                                    alt={product.name}
                                    onError={(e) => (e.currentTarget.src = foto)} // Corrección TS para eventos
                                />
                                <span className="price">{product.price}€</span>
                            </div>

                            <div className='product-stats-name'>
                                <p className="name">{product.name}</p>
                                <span className="price-mobile">{product.price}€</span>
                            </div>

                            <div className="date-mobile">{formatDate(product.created_at)}</div>
                        </div>

                        {/* ESTADÍSTICAS */}
                        <span className="date">{formatDate(product.created_at)}</span>
                        <span className="stat stat-views">{product.views_count}</span>
                        <span className="stat stat-chats">{product.total_chats}</span>
                        <span className="stat stat-favs">{product.total_favorites}</span>
                    </div>
                ))
            )}
        </>
    );
}