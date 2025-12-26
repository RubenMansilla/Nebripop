import './TransactionCardSkeleton.css'; // Asegúrate de importar el CSS nuevo

export const TransactionCardSkeleton = () => {
    return (
        <div className="transaction-card skeleton-wrapper">
            <div className="t-left">
                <div className="t-icon skeleton-pulse"></div>
                <div className="t-info">
                    <div className="skeleton-card-line name skeleton-pulse"></div>
                    <div className="skeleton-card-line date skeleton-pulse"></div>
                </div>
            </div>
            <div className="t-right">
                <div className="skeleton-card-line amount skeleton-pulse"></div>
            </div>
        </div>
    );
};