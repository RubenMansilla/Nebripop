import { useEffect, useState, useContext } from 'react';
import { getMyAuctions, deleteAuction } from '../../../../api/auctions.api';
import { AuthContext } from '../../../../context/AuthContext';
import AuctionCard from './AuctionCard';
import CreateAuctionModal from './CreateAuctionModal';
import noReviewsImg from '../../../../assets/profile/pop-nothing-for-auction.png';
import AuctionSkeleton from '../../../../components/AuctionSkeleton/AuctionSkeleton';

export default function MyAuctions() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const loadAuctions = () => {
        if (!user) return;

        setLoading(true);
        setShowSkeleton(false);
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyAuctions(user.id)
            .then(data => setAuctions(data))
            .catch(console.error)
            .finally(() => {
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        return () => clearTimeout(skeletonTimer);
    };

    useEffect(() => {
        loadAuctions();
    }, [user]);

    const handleDelete = async (auctionId: string | number) => {
        if (!window.confirm("¿Estás seguro de querer eliminar esta subasta? Esta acción no se puede deshacer.")) return;

        try {
            await deleteAuction(auctionId);
            setAuctions(prev => prev.filter(a => a.id !== auctionId));
            alert("Subasta eliminada correctamente");
        } catch (error: any) {
            alert(error.message);
        }
    };

    const handleAuctionCreated = () => {
        loadAuctions();
        setShowModal(false);
    };

    return (
        <>
            {showModal && (
                <div style={{ position: 'fixed', zIndex: 1000 }}>
                    <CreateAuctionModal
                        onClose={() => setShowModal(false)}
                        onAuctionCreated={handleAuctionCreated}
                    />
                </div>
            )}

            <div className="my-auctions-content">
                <div className="my-auctions-header">
                    <button onClick={() => setShowModal(true)} className="btn-new-auction" style={{ cursor: 'pointer' }}>
                        Nueva Subasta
                    </button>
                </div>

                {loading && showSkeleton ? (
                    <div className="product-container auctions-grid-internal">
                        {[...Array(5)].map((_, i) => <AuctionSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {auctions.length === 0 && !loading ? (
                            <div className="no-reviews" style={{ marginTop: '15px' }}>
                                <img
                                    src={noReviewsImg}
                                    alt="Sin valoraciones"
                                    className="no-reviews-img"
                                />
                                <h3>Nada subastado todavía</h3>
                                <button onClick={() => setShowModal(true)} className="create-auction-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'inherit' }}>
                                    ¡Crea tu primera subasta aquí!
                                </button>
                            </div>
                        ) : (
                            auctions.length > 0 && (
                                <div className="product-container auctions-grid-internal">
                                    {auctions.map(auction => (
                                        <AuctionCard
                                            key={auction.id}
                                            auction={auction}
                                            user={user}
                                            mode="my_auctions"
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </>
    );
}
