import "./ProductSkeleton.css";

export default function ProductSkeleton() {
    return (
        <li className="product skeleton">
            <div className="product-img skeleton-box"></div>

            <div className="product-info">
                <div className="product-price skeleton-box small"></div>
                <div className="product-title skeleton-box medium"></div>
                <div className="product-delivery skeleton-box small"></div>
            </div>
        </li>
    );
}
