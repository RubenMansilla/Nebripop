import { useEffect, useState, useContext } from 'react';
import { getParticipatingAuctions } from '../../../../api/auctions.api';
import { AuthContext } from '../../../../context/AuthContext';
import AuctionCard from './AuctionCard';
import noReviewsImg from '../../../../assets/profile/pop-nothing-for-sale.svg';

export default function ActiveAuctions() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getParticipatingAuctions(user.id)
                .then(data => setAuctions(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (loading) return <div className="loading-container">Cargando...</div>;

    return (
        <>
            {auctions.length === 0 ? (
                <div className="no-reviews">
                    <div className="empty-state-container">
                        <p className="empty-state-text">No estás participando en ninguna subasta activa.</p>
                    </div>
                </div>
            ) : (
                <div className="product-container auctions-grid-internal">
                    {auctions.map(auction => (
                        <AuctionCard
                            key={auction.id}
                            auction={auction}
                            user={user}
                            mode="active_auctions"
                        />
                    ))}
                </div>
            )}
        </>
    );
}
