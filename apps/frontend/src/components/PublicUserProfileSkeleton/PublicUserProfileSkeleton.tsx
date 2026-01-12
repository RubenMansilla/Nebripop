import "./PublicUserProfileSkeleton.css";

export default function PublicUserProfileSkeleton() {
    return (
        <section className="public-user-profile skeleton-profile">
            
            {/* HEADER */}
            <div className="public-user-header">
                <div className="public-user-avatar">
                    <div className="skeleton-box skeleton-circle" />
                </div>

                <div className="public-user-info">
                    <div className="skeleton-box skeleton-line-lg" />
                    <div className="skeleton-box skeleton-line-md" />
                </div>
            </div>

            {/* STATS */}
            <div className="public-user-stats">
                <div className="stat">
                    <div className="skeleton-box skeleton-line-md" />
                    <div className="skeleton-box skeleton-line-xs" />
                </div>

                <div className="stat">
                    <div className="skeleton-box skeleton-line-md" />
                    <div className="skeleton-box skeleton-line-xs" />
                </div>
            </div>

            {/* TABS */}
            <div className="public-user-tabs">
                <div className="skeleton-box skeleton-tab" />
                <div className="skeleton-box skeleton-tab" />
            </div>

            {/* GRID DE PRODUCTOS */}
            <div className="public-user-section">
                <ul className="public-user-products">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="product skeleton">
                            <div className="product-img skeleton-box" />
                            <div className="product-info">
                                <div className="product-price skeleton-box small" />
                                <div className="product-title skeleton-box medium" />
                                <div className="product-delivery skeleton-box small" />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
