import { useEffect, useState, useContext, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { getMyAuctionHistory, deleteAuction } from "../../../../api/auctions.api";
import { AuthContext } from "../../../../context/AuthContext";
import AuctionCard from "../../../../components/Auctions/AuctionCard/AuctionCard";
import noReviewsImg from "../../../../assets/profile/pop-nothing-for-sale.svg";
import AuctionSkeleton from "../../../../components/AuctionSkeleton/AuctionSkeleton";
import { toast } from "react-toastify";
import CreateAuctionModal from "../../../../components/Auctions/PopUpCreateAuction/CreateAuctionModal";
import { createAuction } from "../../../../api/auctions.api";
import { useNotificationSettings } from "../../../../context/NotificationContext";

export default function AuctionsHistory() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(false);
    const { notify } = useNotificationSettings();

    // Modal state for modify
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        productId?: number;
        price?: number;
        duration?: number;
    }>({});

    const [showDeletePopup, setShowDeletePopup] = useState(false);
    const [auctionToDelete, setAuctionToDelete] = useState<number | null>(null);

    // Filter state for payment status
    const [filterOpen, setFilterOpen] = useState(false);
    const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");
    const filterRef = useRef<HTMLDivElement>(null);
    const filterDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            loadHistory();
        }
    }, [user]);

    const loadHistory = () => {
        if (!user) return;

        setLoading(true);
        setShowSkeleton(false);
        const skeletonTimer = setTimeout(() => {
            setShowSkeleton(true);
        }, 300);

        getMyAuctionHistory(user.id)
            .then((data) => setAuctions(data))
            .catch(console.error)
            .finally(() => {
                clearTimeout(skeletonTimer);
                setLoading(false);
            });

        return () => clearTimeout(skeletonTimer);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node) &&
                filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
                setFilterOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Adjust dropdown width to match filter button
    useEffect(() => {
        if (filterRef.current && filterDropdownRef.current) {
            const filterWidth = filterRef.current.getBoundingClientRect().width;
            filterDropdownRef.current.style.width = `${filterWidth}px`;
        }
    }, [filterOpen]);


    const handleRepublish = async (auctionId: number) => {
        if ((user?.penaltyLevel || 0) >= 2) {
            toast.error(
                user?.penaltyLevel === 3
                    ? "No puedes republicar subastas: tienes un bloqueo permanente (Strike 3)"
                    : "No puedes republicar subastas: tienes un bloqueo temporal (Strike 2)"
            );
            return;
        }

        const auction = auctions.find(a => a.id === auctionId);
        if (!auction) return;

        try {
            // Calculate original duration in hours
            const createdAt = new Date(auction.created_at);
            const endTime = new Date(auction.end_time);
            const durationHours = Math.round((endTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

            await createAuction(
                auction.product.id,
                Number(auction.starting_price),
                durationHours
            );

            notify(
                "auctions",
                "Subasta republicada correctamente",
                "success"
            );

            loadHistory();
        } catch (error: any) {
            toast.error(error.message || "Error al republicar la subasta");
        }
    };

    const handleModify = (auctionId: number) => {
        if ((user?.penaltyLevel || 0) >= 2) {
            toast.error(
                user?.penaltyLevel === 3
                    ? "No puedes modificar subastas: tienes un bloqueo permanente (Strike 3)"
                    : "No puedes modificar subastas: tienes un bloqueo temporal (Strike 2)"
            );
            return;
        }

        const auction = auctions.find(a => a.id === auctionId);
        if (!auction) return;

        // Calculate original duration in hours
        const createdAt = new Date(auction.created_at);
        const endTime = new Date(auction.end_time);
        const durationHours = Math.round((endTime.getTime() - createdAt.getTime()) / (1000 * 60 * 60));

        setModalConfig({
            productId: auction.product.id,
            price: Number(auction.starting_price),
            duration: durationHours
        });
        setShowModal(true);
    };

    const handleCancel = (auctionId: number) => {
        setAuctionToDelete(auctionId);
        setShowDeletePopup(true);
    };

    const handleConfirmDelete = async () => {
        if (!auctionToDelete) return;

        try {
            await deleteAuction(auctionToDelete);
            setAuctions((prev) => prev.filter((a) => a.id !== auctionToDelete));
            notify(
                "auctions",
                "Subasta eliminada correctamente",
                "success"
            );
            setShowDeletePopup(false);
            setAuctionToDelete(null);
        } catch (error: any) {
            toast.error(error.message);
            setShowDeletePopup(false);
            setAuctionToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setShowDeletePopup(false);
        setAuctionToDelete(null);
    };

    const handleAuctionCreated = () => {
        loadHistory();
        setShowModal(false);
        setModalConfig({});
    };



    // Filter label mapping
    const filterLabels: Record<string, string> = {
        all: "Todas",
        paid: "Pagadas",
        unpaid: "Sin pagar"
    };

    const filterLabel = filterLabels[paymentFilter];

    const selectFilter = (filter: "all" | "paid" | "unpaid") => {
        setPaymentFilter(filter);
        setFilterOpen(false);
    };

    // Filter auctions by payment status
    const filteredAuctions = useMemo(() => {
        let filtered = auctions;

        if (paymentFilter === "paid") {
            // Paid = sold status with purchase data
            filtered = auctions.filter(a => a.status === "sold" && a.purchase);
        } else if (paymentFilter === "unpaid") {
            // Unpaid = expired status without purchase
            filtered = auctions.filter(a => a.status === "expired" || (a.status !== "sold"));
        }

        return filtered;
    }, [auctions, paymentFilter]);

    return (
        <>
            {showModal && createPortal(
                <div style={{ position: "fixed", zIndex: 1000 }}>
                    <CreateAuctionModal
                        onClose={() => {
                            setShowModal(false);
                            setModalConfig({});
                        }}
                        onAuctionCreated={handleAuctionCreated}
                        preselectedProductId={modalConfig.productId}
                        preselectedPrice={modalConfig.price}
                        preselectedDuration={modalConfig.duration}
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

            {loading && showSkeleton ? (
                <div className="product-container">
                    {[...Array(5)].map((_, i) => (
                        <AuctionSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <>
                    <div className="sort-by-container">
                        {/* Filter by payment status */}
                        <div
                            className={`sort-by ${(!loading && auctions.length === 0) ? "disabled" : ""}`}
                            ref={filterRef}
                            onClick={() => {
                                if (!loading && auctions.length === 0) return;
                                setFilterOpen(!filterOpen);
                            }}
                        >
                            <p>Filtrar: {filterLabel}</p>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
                                <path fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 10l5 5m0 0l5-5" />
                            </svg>
                        </div>
                        {filterOpen && (
                            <div className="sort-dropdown" ref={filterDropdownRef}>
                                <p className={paymentFilter === "all" ? "active" : ""} onClick={() => selectFilter("all")}>Todas</p>
                                <p className={paymentFilter === "paid" ? "active" : ""} onClick={() => selectFilter("paid")}>Pagadas</p>
                                <p className={paymentFilter === "unpaid" ? "active" : ""} onClick={() => selectFilter("unpaid")}>Sin pagar</p>
                            </div>
                        )}


                    </div>
                    {filteredAuctions.length === 0 && !loading ? (
                        <div className="no-reviews">
                            <img
                                src={noReviewsImg}
                                alt="Sin valoraciones"
                                className="no-reviews-img"
                            />
                            <h3>No hay subastas que coincidan con el filtro</h3>
                            <p>
                                {paymentFilter === "paid" ? "No tienes subastas pagadas" :
                                    paymentFilter === "unpaid" ? "No tienes subastas sin pagar" :
                                        "No tienes historial de subastas"}
                            </p>
                        </div>
                    ) : (
                        filteredAuctions.length > 0 && (
                            <div className="product-container">
                                {filteredAuctions.map((auction) => (
                                    <AuctionCard
                                        key={auction.id}
                                        auction={auction}
                                        user={user}
                                        mode="history"
                                        onRepublish={handleRepublish}
                                        onModify={handleModify}
                                        onCancel={handleCancel}
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
