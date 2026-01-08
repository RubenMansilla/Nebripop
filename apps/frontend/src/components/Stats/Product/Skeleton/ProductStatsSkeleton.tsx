import './ProductStatsSkeleton.css';

export default function StatsSkeleton() {

    const rows = Array(2).fill(0);

    return (
        <>
            <div className="stats-header">
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
                <span className="skeleton skeleton-text short"></span>
            </div>
            {rows.map((_, index) => (
                <div className="stats-row" key={index}>
                    {/* COL 1: Info Producto */}
                    <div className="stats-product-info">
                        <div className='product-image-price'>
                            <div className="skeleton skeleton-img"></div>
                            <div className="skeleton skeleton-text price"></div>
                        </div>

                        <div className='product-stats-name' style={{ width: '100%' }}>
                            <div className="skeleton skeleton-text"></div>
                            <div className="skeleton skeleton-text short"></div>
                            <div className="price-mobile">
                                <div className="skeleton skeleton-text price"></div>
                            </div>
                        </div>

                        <div className="date-mobile">
                            <div className="skeleton skeleton-text short" style={{ width: '80px' }}></div>
                        </div>
                    </div>

                    <span className="date">
                        <div className="skeleton skeleton-text short"></div>
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
