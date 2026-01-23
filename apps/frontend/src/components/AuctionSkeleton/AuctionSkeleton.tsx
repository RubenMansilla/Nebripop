import "./AuctionSkeleton.css";

export default function AuctionSkeleton() {
    return (
        <div className="auction-skeleton">
            <div className="skeleton-img skeleton-box"></div>
            <div className="skeleton-content">
                <div className="skeleton-title skeleton-box"></div>
                <div className="skeleton-row">
                    <div className="skeleton-price skeleton-box"></div>
                    <div className="skeleton-status skeleton-box"></div>
                </div>
                <div className="skeleton-actions skeleton-box"></div>
            </div>
        </div>
    );
}
