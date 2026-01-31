import "../User/Auctions/Auctions.css";
import { toast } from "react-toastify";

import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuctionById, placeBid, payAuction } from "../../api/auctions.api";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";
import "./AuctionDetail.css";

// Additional Imports (Seller, Reviews)
import { getReviews, getUserReviewSummary } from "../../api/reviews.api";
import { getPublicUser } from "../../api/users.api";
import Review from "../../components/Review/Review";
import { getCategories } from "../../api/categories.api";
import { getSubcategoriesByCategory } from "../../api/subcategories.api";
import { getCategoryIcon } from "../../utils/categoryIcons";
import { getSubcategoryIcon } from "../../utils/subcategoryIcons";
import AuctionDetailSkeleton from "../../components/AuctionDetailSkeleton/AuctionDetailSkeleton";

export default function AuctionDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { openLogin } = useLoginModal();

    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState("");
    const [bidError, setBidError] = useState("");

    // Seller & Reviews State
    const [sellerPublic, setSellerPublic] = useState<any | null>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewSummary, setReviewSummary] = useState<{
        average: number;
        total: number;
    }>({
        average: 0,
        total: 0,
    });
    const [sellerLoading, setSellerLoading] = useState(false);

    // Category Fallback State
    const [fetchedCategoryName, setFetchedCategoryName] = useState<string>("");
    const [fetchedSubcategoryName, setFetchedSubcategoryName] =
        useState<string>("");

    // Image Gallery State
    const [currentImage, setCurrentImage] = useState(0);

    // Initial Load
    useEffect(() => {
        if (id) {
            loadAuction();
        }
    }, [id]);

    const loadAuction = (isBackground = false) => {
        if (!isBackground) setLoading(true);
        getAuctionById(id!)
            .then((data) => setAuction(data))
            .catch((err) => console.error(err))
            .finally(() => {
                if (!isBackground) setLoading(false);
            });
    };

    // Derived Owner ID
    const ownerId = useMemo(() => {
        const product = auction?.product;
        return product?.owner_id ?? product?.seller_id ?? product?.user?.id;
    }, [auction]);

    // Check if current user is owner
    const isOwner = useMemo(() => {
        if (!user || !ownerId) return false;
        // Ensure comparison works with strings/numbers
        return String(user.id) === String(ownerId);
    }, [user, ownerId]);

    // Fetch Seller Info & Reviews
    useEffect(() => {
        if (!ownerId) return;

        setSellerLoading(true);
        // Parallel fetching
        Promise.all([
            getPublicUser(ownerId),
            getReviews(ownerId, "newest"),
            getUserReviewSummary(ownerId),
        ])
            .then(([userData, reviewsData, summaryData]) => {
                setSellerPublic(userData);
                setReviews(reviewsData);
                setReviewSummary(summaryData);
            })
            .catch(console.error)
            .finally(() => setSellerLoading(false));
    }, [ownerId]);

    // Fetch Category Names Fallback
    useEffect(() => {
        if (!auction || !auction.product) return;
        const product = auction.product;

        // 1. Try to get names from object
        const catName =
            typeof product.category === "object"
                ? product.category?.name
                : product.category;
        const subName =
            typeof product.subcategory === "object"
                ? product.subcategory?.name
                : product.subcategory;

        if (catName) setFetchedCategoryName(catName);
        if (subName) setFetchedSubcategoryName(subName);

        // 2. If missing and we have IDs, fetch them
        if (!catName && product.category_id) {
            getCategories()
                .then((cats) => {
                    const found = cats.find(
                        (c: any) => c.id === Number(product.category_id),
                    );
                    if (found) {
                        setFetchedCategoryName(found.name);
                        // Fetch subcategory only if category found
                        if (!subName && product.subcategory_id) {
                            getSubcategoriesByCategory(found.id).then((subs) => {
                                const foundSub = subs.find(
                                    (s: any) => s.id === Number(product.subcategory_id),
                                );
                                if (foundSub) setFetchedSubcategoryName(foundSub.name);
                            });
                        }
                    }
                })
                .catch((err) =>
                    console.error("Error fetching categories for breadcrumb", err),
                );
        }
    }, [auction]);

    // Calculate Dynamic Bid Increment based on current price
    const getBidIncrement = (currentPrice: number): number => {
        if (currentPrice < 50) return 1;
        if (currentPrice < 200) return 2;
        if (currentPrice < 1000) return 5;
        if (currentPrice < 5000) return 25;
        return 50;
    };

    // Bid Logic
    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setBidError("");

        if (!user) {
            openLogin();
            return;
        }

        if ((user?.penaltyLevel || 0) >= 2) {
            toast.error(
                user?.penaltyLevel === 3
                    ? "No puedes pujar: tienes un bloqueo permanente (Strike 3)"
                    : "No puedes pujar: tienes un bloqueo temporal (Strike 2)"
            );
            return;
        }

        const currentVal = Number(auction.current_bid || auction.starting_price);
        const amount = Number(bidAmount);
        const minIncrement = getBidIncrement(currentVal);
        const minBidRequired = currentVal + minIncrement;

        if (amount < minBidRequired) {
            setBidError(`La puja mínima debe ser ${minBidRequired}€ (incremento de ${minIncrement}€)`);
            return;
        }

        try {
            await placeBid(auction.id, amount, user);
            setBidAmount("");
            loadAuction(true); // Refresh data silently
        } catch (error: any) {
            setBidError(error.message || "Error al realizar la puja");
        }
    };

    const handlePayment = async () => {
        if (!confirm("¿Confirmar pago de la subasta?")) return;
        try {
            await payAuction(auction.id);
            loadAuction(true);
        } catch (error: any) {
            console.error(error.message || "Error al procesar el pago");
        }
    };

    // Helpers
    const calculateTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;
        if (diff <= 0) return "Finalizada";
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    // Navigation
    const goToSellerProfile = () => {
        if (!ownerId) return;
        navigate(`/users/${ownerId}`);
    };

    // Gallery Logic
    const nextImage = () => {
        const images = auction?.product?.images || [];
        if (images.length === 0) return;
        setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    };

    const prevImage = () => {
        const images = auction?.product?.images || [];
        if (images.length === 0) return;
        setCurrentImage((prev) => (prev > 0 ? prev - 1 : prev));
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <CategoriesBar />
                <AuctionDetailSkeleton />
                <Footer />
            </>
        );
    }
    if (!auction) return <div>Subasta no encontrada</div>;

    // Derived Variables
    const product = auction.product;
    const currentPrice =
        auction.current_bid > 0 ? auction.current_bid : auction.starting_price;
    const bidIncrement = getBidIncrement(currentPrice);
    const minBid = Number(currentPrice) + bidIncrement;

    // Seller Display Info
    const sellerName = sellerPublic?.fullName ?? sellerPublic?.name ?? "Vendedor";
    const sellerAvatar =
        sellerPublic?.profilePicture ??
        sellerPublic?.avatar ??
        "/default-avatar.png";

    const images = product?.images ?? [];
    const firstImage = images?.[currentImage]?.image_url || "/no-image.webp";
    const hasMultipleImages = images.length > 1;

    // Category & Subcategory Names
    const categoryName =
        typeof product?.category === "object"
            ? product.category?.name
            : product?.category;
    const subcategoryName =
        typeof product?.subcategory === "object"
            ? product.subcategory?.name
            : product?.subcategory;

    return (
        <>
            <Navbar />
            <CategoriesBar />

            <div className="auction-detail-container">
                {/* 1. LEFT SIDEBAR (Ad) */}
                <div className="left-sidebar">
                    <img
                        src="https://via.placeholder.com/300x600.png?text=Publicidad"
                        alt="Publicidad"
                        className="ad-image"
                    />
                </div>

                {/* 2. MAIN CONTENT */}
                <div className="detail-main">
                    <div className="breadcrumb">
                        <Link to="/">Inicio</Link>
                        {(categoryName || fetchedCategoryName) && (
                            <>
                                <span>/</span>
                                <Link to={`/auctions?categoryId=${product.category_id}`}>
                                    {categoryName || fetchedCategoryName}
                                </Link>
                            </>
                        )}
                        {(subcategoryName || fetchedSubcategoryName) && (
                            <>
                                <span>/</span>
                                <Link
                                    to={`/auctions?categoryId=${product.category_id}&subcategoryId=${product.subcategory_id}`}
                                >
                                    {subcategoryName || fetchedSubcategoryName}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="breadcrumb-current">{product?.name}</span>
                    </div>

                    <div className="product-images">
                        <div className="image-wrapper">
                            <img
                                src={firstImage}
                                className="product-image"
                                alt={product?.name}
                            />

                            {hasMultipleImages && (
                                <>
                                    {currentImage > 0 && (
                                        <button className="image-arrow left" onClick={prevImage}>
                                            ‹
                                        </button>
                                    )}
                                    {currentImage < images.length - 1 && (
                                        <button className="image-arrow right" onClick={nextImage}>
                                            ›
                                        </button>
                                    )}
                                    <div className="image-dots">
                                        {images.map((_: any, index: number) => (
                                            <span
                                                key={index}
                                                className={`dot ${index === currentImage ? "active" : ""}`}
                                                onClick={() => setCurrentImage(index)}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tags Section */}
                    <div className="product-tags">
                        {(categoryName || fetchedCategoryName) && (
                            <div className="product-tag">
                                <img
                                    src={getCategoryIcon(categoryName || fetchedCategoryName)}
                                    alt={categoryName || fetchedCategoryName}
                                />
                                <span>{categoryName || fetchedCategoryName}</span>
                            </div>
                        )}
                        {(subcategoryName || fetchedSubcategoryName) && (
                            <div className="product-tag sub">
                                <img
                                    src={getSubcategoryIcon(
                                        categoryName || fetchedCategoryName,
                                        subcategoryName || fetchedSubcategoryName,
                                    )}
                                    alt={subcategoryName || fetchedSubcategoryName}
                                />
                                <span>{subcategoryName || fetchedSubcategoryName}</span>
                            </div>
                        )}
                    </div>

                    <div className="product-details">
                        <h3 className="section-title">Detalles del producto</h3>
                        {product?.description && (
                            <p className="details-description">{product.description}</p>
                        )}

                        {product?.location && (
                            <div className="product-location">📍 {product.location}</div>
                        )}

                        <div className="seller-reviews">
                            <h3 className="section-title">
                                ⭐ {reviewSummary.average.toFixed(1)} · {sellerName} –{" "}
                                {reviewSummary.total} valoraciones
                            </h3>
                            {reviews.length === 0 ? (
                                <p className="no-reviews">
                                    Este vendedor aún no tiene valoraciones
                                </p>
                            ) : (
                                reviews.map((rev) => (
                                    <Review
                                        key={rev.id}
                                        mode="public"
                                        review={{
                                            ...rev,
                                            reviewer: {
                                                ...rev.reviewer,
                                                fullName:
                                                    rev.reviewer?.full_name ||
                                                    rev.reviewer?.fullName ||
                                                    "Usuario",
                                                profilePicture:
                                                    rev.reviewer?.profile_picture ||
                                                    rev.reviewer?.profilePicture,
                                            },
                                        }}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT SIDEBAR */}
                <div className="right-sidebar">
                    {/* Bidding Box */}
                    <div className="bidding-box">
                        <h3 className="buy-title">{product?.name}</h3>

                        <div className="bid-header">
                            <div>
                                <p className="auction-bid-label">Oferta actual</p>
                                <p className={currentPrice >= 1000 ? "bid-value bid-value-large" : "bid-value"}>
                                    {currentPrice}€
                                </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p className="auction-bid-label">
                                    {auction.status === "active" ? "Tiempo restante" : "Estado"}
                                </p>
                                <div className="auction-time-badge">
                                    {auction.status === "active"
                                        ? calculateTimeLeft(auction.end_time)
                                        : auction.status === "awaiting_payment"
                                            ? "Esperando Pago"
                                            : auction.status === "sold"
                                                ? "VENDIDO"
                                                : "EXPIRADO"}
                                </div>
                            </div>
                        </div>

                        {auction.status === "active" && (
                            <>
                                {isOwner ? (
                                    <div
                                        style={{
                                            background: "#f8f9fa",
                                            padding: "15px",
                                            borderRadius: "8px",
                                            textAlign: "center",
                                            color: "#6c757d",
                                            border: "1px solid #e9ecef",
                                            marginBottom: "15px",
                                        }}
                                    >
                                        <p style={{ margin: 0, fontWeight: "500" }}>
                                            Esta es tu subasta
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {(user?.penaltyLevel || 0) >= 2 ? (
                                            <div className="penalty-blocked-box">
                                                <h4 className="penalty-blocked-header">Puja Bloqueada</h4>
                                                {user?.penaltyLevel === 3 ? (
                                                    <p className="penalty-blocked-desc">
                                                        Bloqueo permanente (Strike 3).
                                                    </p>
                                                ) : (
                                                    <div className="penalty-blocked-temp-container">
                                                        <p className="penalty-blocked-temp-text">Bloqueo temporal (Strike 2).</p>
                                                        {user?.penaltyAssignedAt && (
                                                            <p className="penalty-blocked-timer">
                                                                Fin estimado: {(() => {
                                                                    const assignedDate = new Date(user.penaltyAssignedAt);
                                                                    const daysDuration = 180 * Math.pow(2, user.recidivismCount || 0);
                                                                    const endDate = new Date(assignedDate);
                                                                    endDate.setDate(endDate.getDate() + daysDuration);
                                                                    const now = new Date();
                                                                    const diffTime = endDate.getTime() - now.getTime();
                                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                    if (diffDays <= 0) return "Pronto";
                                                                    return `${diffDays} días`;
                                                                })()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <form className="bid-form" onSubmit={handleBid}>
                                                    <input
                                                        className="bid-input"
                                                        type="number"
                                                        step="0.01"
                                                        placeholder={`min ${minBid}€`}
                                                        value={bidAmount}
                                                        onChange={(e) => setBidAmount(e.target.value)}
                                                        min={minBid}
                                                    />
                                                    <button className="bid-btn" type="submit">
                                                        Pujar
                                                    </button>
                                                </form>
                                                <p className="bid-increment-info">
                                                    Incremento mínimo: {bidIncrement}€
                                                </p>
                                            </>
                                        )}
                                    </>
                                )}
                                {bidError && (
                                    <p
                                        style={{
                                            color: "#e53935",
                                            marginTop: "10px",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        {bidError}
                                    </p>
                                )}
                            </>
                        )}

                        {auction.status === "awaiting_payment" && (
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                {user && auction.winner_id === user.id ? (
                                    <>
                                        <p
                                            style={{
                                                color: "#00a0a0",
                                                fontWeight: "bold",
                                                marginBottom: "10px",
                                            }}
                                        >
                                            ¡Has ganado la subasta!
                                        </p>
                                        <button className="bid-btn" onClick={handlePayment}>
                                            Pagar Ahora
                                        </button>
                                    </>
                                ) : (
                                    <p style={{ color: "#666" }}>
                                        El ganador está procesando el pago.
                                    </p>
                                )}
                            </div>
                        )}

                        {auction.status === "sold" && (
                            <div style={{ marginTop: "20px", textAlign: "center" }}>
                                <p
                                    style={{
                                        color: "#2e7d32",
                                        fontWeight: "bold",
                                        fontSize: "1.2rem",
                                    }}
                                >
                                    ¡Vendido!
                                </p>
                            </div>
                        )}

                        <div className="bid-history-list">
                            <h3 className="history-title">
                                Historial de pujas ({auction.bids?.length || 0})
                            </h3>
                            {!auction.bids || auction.bids.length === 0 ? (
                                <p style={{ color: "#888", fontSize: "0.9rem" }}>
                                    Sé el primero en pujar.
                                </p>
                            ) : (
                                <div>
                                    {auction.bids.slice(0, 5).map((bid: any) => (
                                        <div key={bid.id} className="history-item">
                                            <span className="history-user">
                                                {bid.bidder?.fullName || bid.bidder?.name || "Usuario"}
                                            </span>
                                            <span className="history-amount">{bid.amount}€</span>
                                        </div>
                                    ))}
                                    {auction.bids.length > 5 && (
                                        <p
                                            style={{
                                                fontSize: "0.8rem",
                                                color: "#888",
                                                textAlign: "center",
                                                marginTop: "5px",
                                            }}
                                        >
                                            ...
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Seller Card */}
                    <div className="seller-card">
                        <div className="seller-main" onClick={goToSellerProfile}>
                            <img
                                src={sellerAvatar}
                                alt={sellerName}
                                className="seller-avatar"
                            />
                            <div className="seller-info">
                                <p className="seller-name">{sellerName}</p>
                                <div className="seller-rating-row">
                                    <span className="star">⭐</span>
                                    <span className="rating">
                                        {reviewSummary.average.toFixed(1)}
                                    </span>
                                </div>
                                <p className="seller-meta">
                                    {reviewSummary.total} valoraciones
                                </p>
                            </div>
                        </div>
                        <div className="seller-actions">
                            <button
                                className="seller-profile-btn"
                                onClick={goToSellerProfile}
                                disabled={sellerLoading}
                            >
                                {sellerLoading ? "Cargando..." : "Ver perfil"}
                            </button>
                        </div>
                    </div>

                    {/* Shipping Card */}
                    <div className="shipping-card">
                        <div className="shipping-row">
                            <div className="shipping-icon">🚚</div>
                            <div className="shipping-info">
                                <p className="shipping-title">Entrega de 3 - 7 días</p>
                                <p className="shipping-desc">
                                    En punto de recogida o a domicilio
                                </p>
                            </div>
                        </div>
                        <div className="shipping-row">
                            <div className="shipping-icon">🛡</div>
                            <div className="shipping-info">
                                <p className="shipping-title">Protección de Wallastock</p>
                                <p className="shipping-desc">
                                    Envío protegido: reembolso fácil
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
