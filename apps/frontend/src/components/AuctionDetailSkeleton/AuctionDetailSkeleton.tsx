import './AuctionDetailSkeleton.css';

const AuctionDetailSkeleton = () => {
    return (
        <div className="auction-detail-container skeleton-active">
            <div className="left-sidebar skeleton-item" style={{ height: "600px" }}></div>
            <div className="detail-main">
                <div className="image-wrapper skeleton-item" style={{ aspectRatio: "4/3" }}></div>
                <div className="skeleton-item" style={{ height: "40px", width: "70%", marginTop: "20px" }}></div>
                <div className="skeleton-item" style={{ height: "100px", width: "100%", marginTop: "10px" }}></div>
            </div>
            <div className="right-sidebar">
                <div className="bidding-box skeleton-item" style={{ height: "300px" }}></div>
                <div className="seller-card skeleton-item" style={{ height: "150px" }}></div>
            </div>
        </div>
    );
};

export default AuctionDetailSkeleton;
