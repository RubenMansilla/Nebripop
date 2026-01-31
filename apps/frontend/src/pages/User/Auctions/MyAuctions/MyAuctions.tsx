import { useEffect, useState, useContext } from "react";
import { createPortal } from "react-dom";
import { getMyAuctions, deleteAuction } from "../../../../api/auctions.api";
import { AuthContext } from "../../../../context/AuthContext";
import AuctionCard from "../../../../components/Auctions/AuctionCard/AuctionCard";
import CreateAuctionModal from "../../../../components/Auctions/PopUpCreateAuction/CreateAuctionModal";
import noReviewsImg from "../../../../assets/profile/pop-nothing-for-auction.svg";
import AuctionSkeleton from "../../../../components/AuctionSkeleton/AuctionSkeleton";
import { toast } from "react-toastify";
import "./MyAuctions.css";

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
            {showModal && createPortal(
                <div style={{ position: "fixed", zIndex: 1000 }}>
                    <CreateAuctionModal
                        onClose={() => setShowModal(false)}
                        onAuctionCreated={handleAuctionCreated}
                    />
                </div>,
                document.body
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
                            onClick={() => {
                                if ((user?.penaltyLevel || 0) >= 2) {
                                    toast.error(
                                        user?.penaltyLevel === 3
                                            ? "No puedes crear subastas: tienes un bloqueo permanente (Strike 3)"
                                            : "No puedes crear subastas: tienes un bloqueo temporal (Strike 2)"
                                    );
                                    return;
                                }
                                setShowModal(true);
                            }}
                            className="btn-new-auction"
                            style={{
                                cursor: (user?.penaltyLevel || 0) >= 2 ? "not-allowed" : "pointer",
                                opacity: (user?.penaltyLevel || 0) >= 2 ? 0.5 : 1
                            }}
                            title={(user?.penaltyLevel || 0) >= 2 ? "No puedes crear subastas debido a tus penalizaciones" : ""}
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
                                {(user?.penaltyLevel || 0) >= 2 ? (
                                    <div className="my-auctions-penalty-box">
                                        <h3 className="my-auctions-penalty-title">
                                            Subastas Bloqueadas
                                        </h3>

                                        {user?.penaltyLevel === 3 ? (
                                            <p className="my-auctions-penalty-text">
                                                Tu cuenta tiene un bloqueo permanente (Strike 3).
                                                <br />
                                                No puedes crear ni participar en subastas.
                                            </p>
                                        ) : (
                                            <div className="my-auctions-penalty-text">
                                                <p>Tu cuenta tiene un bloqueo temporal (Strike 2).</p>
                                                {user?.penaltyAssignedAt && (
                                                    <p className="my-auctions-timer-text">
                                                        Tiempo restante estimado:{" "}
                                                        <span className="my-auctions-timer-count">
                                                            {(() => {
                                                                const assignedDate = new Date(user.penaltyAssignedAt);
                                                                // Strike 2 base duration: 180 days * 2^recidivism
                                                                const daysDuration = 180 * Math.pow(2, user.recidivismCount || 0);
                                                                const endDate = new Date(assignedDate);
                                                                endDate.setDate(endDate.getDate() + daysDuration);

                                                                const now = new Date();
                                                                const diffTime = endDate.getTime() - now.getTime();
                                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                                return diffDays > 0 ? `${diffDays} días` : "Pendiente de revisión";
                                                            })()}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <img
                                            src={noReviewsImg}
                                            alt="Sin valoraciones"
                                            className="no-reviews-img"
                                        />
                                        <h3>Nada subastado todavía</h3>
                                        <button
                                            onClick={() => setShowModal(true)}
                                            className="create-auction-link"
                                        >
                                            ¡Crea tu primera subasta aquí!
                                        </button>
                                    </>
                                )}
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
