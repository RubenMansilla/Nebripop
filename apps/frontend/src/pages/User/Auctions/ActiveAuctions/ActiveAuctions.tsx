import { useEffect, useState, useContext } from "react";
import { getParticipatingAuctions } from "../../../../api/auctions.api";
import { AuthContext } from "../../../../context/AuthContext";
import AuctionCard from "../../../../components/Auctions/AuctionCard/AuctionCard";
import noReviewsImg from "../../../../assets/profile/pop-nothing-for-sale.svg";
import AuctionSkeleton from "../../../../components/AuctionSkeleton/AuctionSkeleton";

export default function ActiveAuctions() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);

    useEffect(() => {
        if (user) {
            setLoading(true);
            setShowSkeleton(false);
            const skeletonTimer = setTimeout(() => {
                setShowSkeleton(true);
            }, 300);

            getParticipatingAuctions(user.id)
                .then((data) => setAuctions(data))
                .catch(console.error)
                .finally(() => {
                    clearTimeout(skeletonTimer);
                    setLoading(false);
                });

            return () => clearTimeout(skeletonTimer);
        }
    }, [user]);

    return (
        <>
            {loading && showSkeleton ? (
                <div className="product-container">
                    {[...Array(5)].map((_, i) => (
                        <AuctionSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    {auctions.length === 0 && !loading ? (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>No participas en ninguna subasta</h3>
                            <p>Tus pujas activas aparecerán aquí</p>
                        </div>
                    ) : (
                        auctions.length > 0 && (
                            <div className="product-container">
                                {auctions.map((auction) => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        user={user}
                                        mode="active_auctions"
                                    />
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </>
    );
}
