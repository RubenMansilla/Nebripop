import { useEffect, useState, useContext, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { getProductById, incrementProductView } from "../../api/products.api";
import "./Detail.css";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import { getReviews, getUserReviewSummary } from "../../api/reviews.api";

// Íconos de categoría y subcategoría
import { getCategoryIcon } from "../../utils/categoryIcons";
import { getSubcategoryIcon } from "../../utils/subcategoryIcons";

import { getPublicUser } from "../../api/users.api";
import Review from "../../components/Review/Review";

// ✅ auth + modal login + popup chat
import { AuthContext } from "../../context/AuthContext";
import { useLoginModal } from "../../context/LoginModalContext";
import ChatPopup from "../../components/ChatPopup/ChatPopup";

type ChatPopupMode = "message" | "offer";

// COMPONENTE SKELETON PARA CARGA
const DetailSkeleton = () => (
  <div className="detail-container skeleton-active">
    <div className="left-sidebar skeleton-item" style={{ height: "600px" }}></div>
    <div className="detail-main">
      <div className="image-wrapper skeleton-item" style={{ aspectRatio: "4/3" }}></div>
      <div className="skeleton-item" style={{ height: "40px", width: "70%", marginTop: "20px" }}></div>
      <div className="skeleton-item" style={{ height: "100px", width: "100%", marginTop: "10px" }}></div>
    </div>
    <div className="right-sidebar">
      <div className="detail-buy-card skeleton-item" style={{ height: "300px" }}></div>
      <div className="seller-card skeleton-item" style={{ height: "150px" }}></div>
    </div>
  </div>
);

export default function Detail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // ✅ scroll top al cambiar de producto (main)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // ✅ incrementar vistas (tu lógica)
  useEffect(() => {
    if (productId) incrementProductView(productId);
  }, [productId]);

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [deliveryType, setDeliveryType] = useState<"shipping" | "person">("shipping");
  const [currentImage, setCurrentImage] = useState(0);

  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<{ average: number; total: number }>({
    average: 0,
    total: 0,
  });

  const [sellerPublic, setSellerPublic] = useState<any | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  // ✅ login + popup chat (tu lógica)
  const { user, token } = useContext(AuthContext);
  const { openLogin } = useLoginModal();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatPopupMode>("message");
  const [initialOffer, setInitialOffer] = useState<number | null>(null);

  // --- fallback para ID del usuario logueado (main) + preferencia AuthContext ---
  const currentUserId = useMemo(() => {
    const directFromContext = (user as any)?.id;
    if (directFromContext) return String(directFromContext);

    const directId = localStorage.getItem("user_id") || localStorage.getItem("id");
    if (directId) return String(directId);

    const userObj = localStorage.getItem("user") || localStorage.getItem("auth");
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        return String(parsed.id || parsed._id || parsed.user?.id);
      } catch {
        return null;
      }
    }
    return null;
  }, [user]);

  // ✅ Cargar producto
  useEffect(() => {
    if (!productId) return;

    setLoading(true);
    getProductById(productId)
      .then((data: any) => {
        setProduct(data);
      })
      .catch((err: Error) => {
        console.error("Error fetching product details:", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  // ✅ ID del vendedor robusto (TU DB: products.owner_id)
  const ownerId = useMemo(() => {
    const id =
      product?.owner_id ??
      product?.seller_id ??
      product?.seller?.id ??
      product?.owner?.id ??
      product?.user?.id;
    const n = Number(id);
    return Number.isFinite(n) && n > 0 ? n : null;
  }, [product]);

  // ✅ Cargar reviews y resumen del vendedor
  useEffect(() => {
    if (!ownerId) return;

    getReviews(ownerId, "newest").then(setReviews).catch(console.error);
    getUserReviewSummary(ownerId).then(setReviewSummary).catch(console.error);
  }, [ownerId]);

  // ✅ Cargar datos públicos del vendedor
  useEffect(() => {
    if (!ownerId) return;

    setSellerLoading(true);
    getPublicUser(ownerId)
      .then((data) => setSellerPublic(data))
      .catch((err) => console.error("Error obteniendo usuario público:", err))
      .finally(() => setSellerLoading(false));
  }, [ownerId]);

  // ✅ Owner check (main) pero con tu ownerId
  const isOwner = useMemo(() => {
    if (!currentUserId || !ownerId) return false;
    return String(currentUserId) === String(ownerId);
  }, [currentUserId, ownerId]);

  // Skeleton / errores
  if (loading) {
    return (
      <>
        <Navbar />
        <CategoriesBar />
        <DetailSkeleton />
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <CategoriesBar />
        <div className="error-message">Producto no encontrado</div>
        <Footer />
      </>
    );
  }

  const images = product?.images ?? [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev: number) => (prev < images.length - 1 ? prev + 1 : prev));
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImage((prev: number) => (prev > 0 ? prev - 1 : prev));
  };

  const formatPrice = (value: number) => {
    if (Number.isInteger(value)) return `${value}€`;
    return `${value.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€`;
  };

  const categoryName =
    typeof product.category === "object" ? product.category?.name : product.category;

  const subcategoryName =
    typeof product.subcategory === "object" ? product.subcategory?.name : product.subcategory;

  // ✅ NOMBRE DEL VENDEDOR (robusto)
  const sellerName =
    sellerPublic?.fullName ??
    sellerPublic?.name ??
    product?.seller?.fullName ??
    product?.seller?.name ??
    "Vendedor";

  // ✅ AVATAR DEL VENDEDOR (robusto)
  const rawAvatar =
    sellerPublic?.profilePicture ??
    sellerPublic?.profile_picture ??
    sellerPublic?.avatar ??
    sellerPublic?.avatarUrl ??
    product?.seller?.profilePicture ??
    product?.seller?.profile_picture ??
    "";

  const sellerAvatar = rawAvatar && rawAvatar !== "" ? rawAvatar : "/default-avatar.png";

  const sellerIdForChat = sellerPublic?.id ?? ownerId;

  const goToSellerProfile = () => {
    const id = sellerPublic?.id ?? ownerId;
    if (!id) return;
    navigate(`/users/${id}`);
  };

  // ✅ Abrir popup chat (normal)
  const openChatPopup = () => {
    if (!user || !token) {
      openLogin();
      return;
    }

    if (!sellerIdForChat) {
      alert("No se pudo obtener el vendedor (owner_id) para abrir el chat.");
      return;
    }

    setChatMode("message");
    setInitialOffer(null);
    setChatOpen(true);
  };

  // ✅ Abrir popup chat en modo oferta (con valor sugerido)
  const handleMakeOffer = () => {
    if (!user || !token) {
      openLogin();
      return;
    }

    if (!sellerIdForChat) {
      alert("No se pudo obtener el vendedor (owner_id) para abrir el chat.");
      return;
    }

    setChatMode("offer");
    setInitialOffer(null);
    setChatOpen(true);
  };

  const firstImage = images?.[currentImage]?.image_url || "/no-image.webp";

  return (
    <>
      <Navbar />
      <CategoriesBar />

      <div className="detail-container">
        <div className="left-sidebar">
          <img
            src="https://via.placeholder.com/300x600.png?text=Publicidad"
            alt="Publicidad"
            className="ad-image"
          />
        </div>

        <div className="detail-main">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            {categoryName && (
              <>
                <span>/</span>
                <Link to={`/filtros?categoryId=${product.category_id}`}>{categoryName}</Link>
              </>
            )}
            {subcategoryName && (
              <>
                <span>/</span>
                <Link to={`/filtros?categoryId=${product.category_id}&subcategoryId=${product.subcategory_id}`}>
                  {subcategoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>

          <div className="product-images">
            <div className="image-wrapper">
              <img src={firstImage} className="product-image" alt={product.name} />

              {hasMultipleImages && (
                <>
                  {currentImage > 0 && (
                    <button className="image-arrow left" onClick={prevImage} type="button">
                      ‹
                    </button>
                  )}
                  {currentImage < images.length - 1 && (
                    <button className="image-arrow right" onClick={nextImage} type="button">
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

          {/* ✅ Tags (main) */}
          <div className="product-tags">
            {categoryName && (
              <div className="product-tag">
                <img src={getCategoryIcon(categoryName)} alt={categoryName} />
                <span>{categoryName}</span>
              </div>
            )}
            {subcategoryName && (
              <div className="product-tag sub">
                <img
                  src={getSubcategoryIcon(categoryName, subcategoryName)}
                  alt={subcategoryName}
                />
                <span>{subcategoryName}</span>
              </div>
            )}
          </div>

          <div className="product-details">
            <h3 className="section-title">Detalles del producto</h3>

            {product.description && <p className="details-description">{product.description}</p>}

            <ul className="details-list">
              {product.features?.map((f: string, i: number) => (
                <li key={i}>– {f}</li>
              ))}
            </ul>

            <div className="details-grid">
              {product.color && (
                <div>
                  <span>Color</span>
                  <strong>{product.color}</strong>
                </div>
              )}
              {product.material && (
                <div>
                  <span>Material</span>
                  <strong>{product.material}</strong>
                </div>
              )}
            </div>

            <div className="bundle-card">
              <div className="bundle-left">📦 Compra más productos a este vendedor y paga un solo envío</div>
              <button className="bundle-btn" type="button">
                Crear un lote
              </button>
            </div>

            {product.location && <div className="product-location">📍 {product.location}</div>}

            <div className="seller-reviews">
              <h3 className="section-title">
                ⭐ {reviewSummary.average.toFixed(1)} · {sellerName} – {reviewSummary.total} valoraciones
              </h3>

              {reviews.length === 0 ? (
                <p className="no-reviews">Este vendedor aún no tiene valoraciones</p>
              ) : (
                reviews.map((rev) => (
                  <Review
                    key={rev.id}
                    mode="public"
                    review={{
                      ...rev,
                      reviewer: {
                        ...rev.reviewer,
                        fullName: rev.reviewer?.full_name || rev.reviewer?.fullName || "Usuario",
                        profilePicture: rev.reviewer?.profile_picture || rev.reviewer?.profilePicture,
                      },
                      product: rev.product || { id: product.id, name: product.name, images: product.images },
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Derecha */}
        <div className="right-sidebar">
          <div className="detail-buy-card">
            <h3 className="buy-title">{product.name}</h3>

            <p className="buy-subtitle">
              {product.condition}
              {product.color ? ` - ${product.color}` : ""}
              {product.material ? ` - ${product.material}` : ""}
            </p>

            <p className="buy-price">{formatPrice(Number(product.price))}</p>

            <div className="buy-payments">
              <div className="apple-pay"> Apple Pay</div>
              <div className="apple-info">
                <span>3 Pagos al 0% con Apple Pay</span>
                <a href="#">Más información</a>
              </div>
            </div>

            <div className="buy-divider"></div>

            {/* --- LÓGICA DE BOTONES (main + tu oferta/chat) --- */}
            {isOwner ? (
              <div
                style={{
                  background: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "8px",
                  textAlign: "center",
                  color: "#6c757d",
                  border: "1px solid #e9ecef",
                  marginTop: "15px",
                }}
              >
                <p style={{ margin: 0, fontWeight: "500" }}>Este producto es tuyo</p>
              </div>
            ) : (
              <>
                <div className="buy-shipping">🚚 Envío disponible</div>

                {product.sold ? (
                  <button className="buy-main-btn disabled" disabled>
                    Vendido
                  </button>
                ) : Number(product.active_negotiation) > 0 ? (

                  <button className="buy-main-btn disabled" disabled>
                    Producto en proceso de negociación
                  </button>

                ) : (
                  <Link to={`/checkout?productId=${product.id}`}>
                    <button className="buy-main-btn" type="button">
                      Comprar
                    </button>
                  </Link>
                )}

                {!product.sold && (
                  <button
                    className="buy-offer-btn"
                    type="button"
                    onClick={handleMakeOffer}
                  >
                    Hacer oferta
                  </button>
                )}
              </>
            )}
          </div>

          <div className="seller-card">
            <div className="seller-main" onClick={goToSellerProfile} style={{ cursor: "pointer" }}>
              <img src={sellerAvatar} alt={sellerName} className="seller-avatar" loading="lazy" />
              <div className="seller-info">
                <p className="seller-name">{sellerName}</p>
                <div className="seller-rating-row">
                  <span className="star">⭐</span>
                  <span className="rating">{reviewSummary.average.toFixed(1)}</span>
                </div>
                <p className="seller-meta">
                  {(sellerPublic as any)?.totalSales ?? 0} ventas · {reviewSummary.total} valoraciones
                </p>
              </div>
            </div>

            <div className="seller-actions">
              <button className="seller-profile-btn" onClick={goToSellerProfile} disabled={sellerLoading}>
                {sellerLoading ? "Cargando..." : "Ver perfil"}
              </button>

              {/* ✅ Chat solo si NO es el dueño */}
              {!isOwner && (
                <button className="seller-chat-btn" type="button" onClick={openChatPopup}>
                  Chat
                </button>
              )}
            </div>
          </div>

          <div className="shipping-card">
            <div className="shipping-tabs">
              <span
                className={`shipping-tab ${deliveryType === "shipping" ? "active" : ""}`}
                onClick={() => setDeliveryType("shipping")}
              >
                Con envío
              </span>

              <span
                className={`shipping-tab ${deliveryType === "person" ? "active" : ""}`}
                onClick={() => setDeliveryType("person")}
              >
                Venta en persona
              </span>
            </div>

            {deliveryType === "shipping" ? (
              <>
                <div className="shipping-row">
                  <div className="shipping-icon">🚚</div>
                  <div className="shipping-info">
                    <p className="shipping-title">Entrega de 3 - 7 días</p>
                    <p className="shipping-desc">En punto de recogida o a domicilio</p>
                  </div>
                  <div className="shipping-price">Desde 1,99 €</div>
                </div>

                <div className="shipping-row">
                  <div className="shipping-icon">🛡</div>
                  <div className="shipping-info">
                    <p className="shipping-title">Protección de Wallastock</p>
                    <p className="shipping-desc">
                      Envío protegido: reembolso fácil y ayuda cuando lo necesites
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="shipping-row">
                  <div className="shipping-icon">🤝</div>
                  <div className="shipping-info">
                    <p className="shipping-title">Venta en persona</p>
                    <p className="shipping-desc">Queda con el vendedor y paga en mano</p>
                  </div>
                </div>

                <div className="shipping-row">
                  <div className="shipping-icon">📍</div>
                  <div className="shipping-info">
                    <p className="shipping-title">Punto de encuentro</p>
                    <p className="shipping-desc">Lugar acordado entre comprador y vendedor</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div >

      {/* ✅ Popup del chat (TU CAMBIO) */}
      {
        chatOpen && sellerIdForChat && (
          <ChatPopup
            open={chatOpen}
            onClose={() => setChatOpen(false)}
            seller={{
              id: sellerIdForChat,
              fullName: sellerName,
              profilePicture: sellerAvatar,
            }}
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              images: product.images ?? [],
            }}
            mode={chatMode}
            initialOffer={initialOffer}
          />
        )
      }

      <Footer />
    </>
  );
}
