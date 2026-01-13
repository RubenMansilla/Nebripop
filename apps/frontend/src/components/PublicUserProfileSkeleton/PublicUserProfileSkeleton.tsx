import "./PublicUserProfileSkeleton.css";
import ProductSkeleton from "../ProductSkeleton/ProductSkeleton";

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
                    {[...Array(4)].map((_, i) => <ProductSkeleton key={i} />)}
                </ul>
            </div>
        </section>
    );
}
