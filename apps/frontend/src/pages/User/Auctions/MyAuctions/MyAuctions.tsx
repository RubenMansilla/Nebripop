import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { getMyAuctions, deleteAuction } from "../../../../api/auctions.api";
import { AuthContext } from "../../../../context/AuthContext";
import AuctionCard from "../../../../components/Auctions/AuctionCard/AuctionCard";
import CreateAuctionModal from "../../../../components/Auctions/PopUpCreateAuction/CreateAuctionModal";
import noReviewsImg from "../../../../assets/profile/pop-nothing-for-auction.svg";
import AuctionSkeleton from "../../../../components/AuctionSkeleton/AuctionSkeleton";
import { toast } from "react-toastify";

export default function MyAuctions() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [auctionToDelete, setAuctionToDelete] = useState<string | number | null>(null);

    const loadAuctions = () => {
        if (!user) return;

        setLoading(true);
        setShowSkeleton(false);
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyAuctions(user.id)
            .then((data) => setAuctions(data))
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

    const handleDelete = (auctionId: string | number) => {
        setAuctionToDelete(auctionId);
        setShowDeletePopup(true);
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false);
        setAuctionToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!auctionToDelete) return;

        try {
            await deleteAuction(auctionToDelete);
            setAuctions((prev) => prev.filter((a) => a.id !== auctionToDelete));
            toast.success("Subasta eliminada correctamente");
            setShowDeletePopup(false);
            setAuctionToDelete(null);
        } catch (error: any) {
            toast.error(error.message);
            setShowDeletePopup(false);
            setAuctionToDelete(null);
        }
    };

    const handleAuctionCreated = () => {
        loadAuctions();
        setShowModal(false);
    };

    return (
        <>
            {showModal && (
                <div style={{ position: "fixed", zIndex: 1000 }}>
                    <CreateAuctionModal
                        onClose={() => setShowModal(false)}
                        onAuctionCreated={handleAuctionCreated}
                    />
                </div>
            )}

            {showDeletePopup && createPortal(
                <div className="popup-backdrop" onClick={handleCancelDelete}>
                    <div className="unsaved-changes-popup" onClick={(e) => e.stopPropagation()}>
                        <h3>¿Estás seguro que quieres eliminar esta subasta?</h3>
                        <p>
                            Esta acción no se puede deshacer. Si eliminas la subasta, se
                            perderá toda la información asociada.
                        </p>
                        <div className="popup-buttons-product">
                            <span className="popup-no" onClick={handleCancelDelete}>
                                No
                            </span>
                            <span className="divider"></span>
                            <span className="popup-yes" onClick={handleConfirmDelete}>
                                Sí, eliminar
                            </span>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <div className="my-auctions-content">
                {auctions.length > 0 && (
                    <div className="my-auctions-header">
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-new-auction"
                            style={{ cursor: "pointer" }}
                        >
                            Nueva Subasta
                        </button>
                    </div>
                )}

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
                                <h3>Nada subastado todavía</h3>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="create-auction-link"
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "inherit",
                                    }}
                                >
                                    ¡Crea tu primera subasta aquí!
                                </button>
                            </div>
                        ) : (
                            auctions.length > 0 && (
                                <div className="product-container">
                                    {auctions.map((auction) => (
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
