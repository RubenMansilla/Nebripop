import './ProductStats.css';
import foto from '../../../assets/garden/conjunto.png';

export default function ProductStats() {
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
            {/* PRODUCT */}
            <div className="stats-row">
                <div className="stats-product-info">
                    <div className='product-image-price'>
                        <img
                            src={foto}
                            alt="producto"
                        />
                        <span className="price">3€</span>
                    </div>
                    <div className='product-stats-name'>
                        <p className="name"> Bikini Calvin Klein. Talla 42. Color liso turquesa</p>
                        <span className="price-mobile">3€</span>
                    </div>
                    <div className="date-mobile">14 sept 2019</div>
                </div>
                <span className="date">14 sept 2019</span>
                <span className="stat stat-views">4</span>
                <span className="stat stat-chats">0</span>
                <span className="stat stat-favs">0</span>
            </div>
            {/* PRODUCT */}
            <div className="stats-row">
                <div className="stats-product-info">
                    <div className='product-image-price'>
                        <img
                            src={foto}
                            alt="producto"
                        />
                        <span className="price">7,5€</span>
                    </div>
                    <div className='product-stats-name'>
                        <p className="name">Mini falda Rosalita Mc Gee</p>
                        <span className="price-mobile">7,5€</span>
                    </div>
                    <div className="date-mobile">14 sept 2019</div>
                </div>
                <span className="date">14 sept 2019</span>
                <span className="stat stat-views">1</span>
                <span className="stat stat-chats">0</span>
                <span className="stat stat-favs">0</span>
            </div>
        </>
    )
}
