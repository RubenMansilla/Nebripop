import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../../context/AuthContext';
import { useNotificationSettings } from '../../context/NotificationContext';
import { addFavoriteAuction, removeFavoriteAuction } from '../../api/favorites.api';
import '../Product/Product.css';
import './AuctionCard.css';

interface AuctionCardProps {
    auction: any; // Type should ideally be AuctionType but using any to match List for now
}

export default function AuctionCard({ auction }: AuctionCardProps) {
    const navigate = useNavigate();
    const { token, user } = useContext(AuthContext);
    const { notify } = useNotificationSettings();

    // Product info
    const product = auction.product;

    // Heart logic (Favoriting the AUCTION, not just the product)
    // Backend should now return 'isFavorite' on the auction object
    const [isFavorite, setIsFavorite] = useState(auction.isFavorite ?? false);
    const [isAnimating, setIsAnimating] = useState(false);

    // Watch for prop changes if auction list refreshes
    useEffect(() => {
        setIsFavorite(auction.isFavorite ?? false);
    }, [auction.isFavorite]);

    useEffect(() => {
        if (isAnimating) {
            const timer = setTimeout(() => {
                setIsAnimating(false);
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [isAnimating]);

    const handleCardClick = () => {
        navigate(`/auction/${auction.id}`);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (!isFavorite) {
            setIsAnimating(true);
        }
        toggleFavorite();
    };

    const toggleFavorite = async () => {
        if (!token) {
            toast.error("Inicia sesión para guardar favoritos");
            return;
        }

        const previousState = isFavorite;
        setIsFavorite(!previousState);

        try {
            if (previousState) {
                await removeFavoriteAuction(auction.id);
                notify("addedToFavorites", "Subasta eliminada de favoritos", "info");
            } else {
                await addFavoriteAuction(auction.id);
                notify("addedToFavorites", "Subasta añadida a favoritos", "success");
            }
        } catch (err) {
            console.error("Error toggling favorite:", err);
            setIsFavorite(previousState);
            toast.error("Error al actualizar favoritos");
        }
    };

    // Helper: Calculate Time Left
    const calculateTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return 'Finalizada';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    };

    // Check if user is owner to hide heart (optional, matching Product logic)
    const isOwner = user && user.id === product?.owner_id;

    return (
        <div className="auction-card-public" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
            <div className="auction-card-img-wrapper" style={{ position: 'relative' }}>
                <img src={product?.images?.[0]?.image_url || "/no-image.webp"} alt={product?.name} />


            </div>
            <div className="auction-card-content">
                <div className="auction-card-header">
                    <h3 className="auction-name">{product?.name || "Producto sin nombre"}</h3>

                    {/* Heart Icon */}
                    {!isOwner && (
                        <div
                            className={`favorite favorite-icon-container ${isFavorite ? "liked" : ""} ${isAnimating ? "animating" : ""}`}
                            onClick={handleFavoriteClick}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                className="heart-svg"
                            >
                                <defs>
                                    <clipPath id={`heart-clip-${product?.id}`}>
                                        <path d="M12 21s-5.9-3.1-9-7.5S3 3 7.5 3C9.6 3 12 5 12 5s2.4-2 4.5-2C21 3 24 7.5 21 13.5S12 21 12 21z" />
                                    </clipPath>
                                </defs>
                                <g transform="translate(0.5, 0)">
                                    <path
                                        className="heart-outline-path"
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M8.411 3.75c1.216.004 2.4.385 3.373 1.09l.005.004q.093.069.211.072a.4.4 0 0 0 .225-.072l.005-.004a5.8 5.8 0 0 1 3.39-1.09h.011a6.37 6.37 0 0 1 4.304 1.737c1.148 1.096 1.804 2.581 1.815 4.142v.005c0 3.182-1.948 5.652-3.974 7.362-2.037 1.72-4.277 2.777-5.144 3.135l-.012.005a1.7 1.7 0 0 1-.609.113 1.6 1.6 0 0 1-.657-.124c-.838-.366-3.077-1.419-5.118-3.133-2.029-1.704-3.986-4.168-3.986-7.358v-.005c.01-1.566.672-3.056 1.827-4.152A6.38 6.38 0 0 1 8.4 3.75zm4.702 2.303c-.323.238-.719.36-1.108.363h-.01c-.4-.003-.778-.13-1.094-.363a4.3 4.3 0 0 0-2.49-.803A4.88 4.88 0 0 0 5.11 6.565a4.28 4.28 0 0 0-1.36 3.071c.001 2.536 1.56 4.619 3.45 6.207 1.868 1.569 3.94 2.551 4.738 2.9l.019.006h.048a.3.3 0 0 0 .066-.009c.793-.328 2.87-1.314 4.738-2.89 1.887-1.594 3.44-3.683 3.441-6.214a4.28 4.28 0 0 0-1.35-3.063 4.88 4.88 0 0 0-3.285-1.323 4.3 4.3 0 0 0-2.502.803"
                                    />
                                </g>
                                <g clipPath={`url(#heart-clip-${product?.id})`}>
                                    <circle
                                        className="heart-fill-circle"
                                        cx="12"
                                        cy="12"
                                        r="0"
                                    />
                                </g>
                            </svg>
                        </div>
                    )}
                </div>
                <div className="auction-status-row">
                    <div>
                        <p className="current-bid-label">Puja actual</p>
                        <p className="current-bid-amount">{auction.current_bid || auction.starting_price}€</p>
                    </div>
                    <div>
                        <div className="time-left-badge">
                            {calculateTimeLeft(auction.end_time)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
