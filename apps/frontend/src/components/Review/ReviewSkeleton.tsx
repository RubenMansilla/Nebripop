import './ReviewSkeleton.css';

export default function ReviewSkeleton() {
    return (
        <div className="review skeleton">
            <div className="review-header">
                <div className="reviewer-pic skeleton-circle"></div>
                <div className="reviewer-info">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line tiny"></div>
                </div>
            </div>
            <div className="review-body">
                {/* Stars */}
                <div className="review-note">
                    <div className="stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="skeleton-star"></div>
                        ))}
                    </div>
                    <div className="skeleton-line tiny"></div>
                </div>
                {/* Comment */}
                <div className="review-text">
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium"></div>
                </div>
                {/* Product card */}
                <div className="review-product skeleton-card">
                    <div className="review-product-img skeleton-square"></div>
                    <div className="review-product-info">
                        <div className="skeleton-line tiny"></div>
                        <div className="skeleton-line short"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
