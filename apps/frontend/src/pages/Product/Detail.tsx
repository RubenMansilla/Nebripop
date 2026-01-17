import { useEffect, useState } from "react";
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

// COMPONENTE SKELETON PARA CARGA
const DetailSkeleton = () => (
  <div className="detail-container skeleton-active">
    <div className="left-sidebar skeleton-item" style={{ height: '600px' }}></div>
    <div className="detail-main">
      <div className="image-wrapper skeleton-item" style={{ aspectRatio: '4/3' }}></div>
      <div className="skeleton-item" style={{ height: '40px', width: '70%', marginTop: '20px' }}></div>
      <div className="skeleton-item" style={{ height: '100px', width: '100%', marginTop: '10px' }}></div>
    </div>
    <div className="right-sidebar">
      <div className="detail-buy-card skeleton-item" style={{ height: '300px' }}></div>
      <div className="seller-card skeleton-item" style={{ height: '150px' }}></div>
    </div>
  </div>
);

export default function Detail() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deliveryType, setDeliveryType] = useState<"shipping" | "person">("shipping");
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState({ average: 0, total: 0 });
  const [sellerPublic, setSellerPublic] = useState<any | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  // --- LÓGICA DE RECUPERACIÓN DE USUARIO LOGUEADO ---
  const getLoggedUserId = () => {
    const directId = localStorage.getItem("user_id") || localStorage.getItem("id");
    if (directId) return String(directId);

    const userObj = localStorage.getItem("user") || localStorage.getItem("auth");
    if (userObj) {
      try {
        const parsed = JSON.parse(userObj);
        return String(parsed.id || parsed._id || parsed.user?.id);
      } catch (e) { return null; }
    }
    return null;
  };

  const currentUserId = getLoggedUserId();

  useEffect(() => {
    if (productId) {
      incrementProductView(productId);
      getProductById(productId)
        .then((data: any) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching product details:", err);
          setLoading(false);
        });
    }
  }, [productId]);

  useEffect(() => {
    if (product?.seller?.id) {
      getReviews(product.seller.id, "newest").then(setReviews).catch(console.error);
      getUserReviewSummary(product.seller.id).then(setReviewSummary).catch(console.error);

      setSellerLoading(true);
      getPublicUser(product.seller.id)
        .then(setSellerPublic)
        .catch(console.error)
        .finally(() => setSellerLoading(false));
    }
  }, [product?.seller?.id]);

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
    return <div className="error-message">Producto no encontrado</div>;
  }

  // --- DETERMINAR SI EL USUARIO ES EL DUEÑO ---
  const sellerId = product.seller?.id || product.seller_id;
  const isOwner = !!(currentUserId && sellerId && String(currentUserId) === String(sellerId));

  const images = product?.images ?? [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : prev));
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImage((prev) => (prev > 0 ? prev - 1 : prev));
    }
  };

  const formatPrice = (value: number) => {
    if (Number.isInteger(value)) return `${value}€`;
    return `${value.toLocaleString("es-ES", { minimumFractionDigits: 2 })}€`;
  };

  const goToSellerProfile = () => {
    const id = sellerPublic?.id ?? product?.seller?.id;
    if (id) navigate(`/users/${id}`);
  };

  const categoryName = typeof product.category === "object" ? product.category?.name : product.category;
  const subcategoryName = typeof product.subcategory === "object" ? product.subcategory?.name : product.subcategory;
  const sellerName = sellerPublic?.fullName ?? product?.seller?.fullName ?? "Vendedor";
  const sellerAvatar = (sellerPublic?.profilePicture || product?.seller?.profilePicture) || "/default-avatar.png";

  return (
    <>
      <Navbar />
      <CategoriesBar />
      <div className="detail-container">
        <div className="left-sidebar">
          <img src="https://via.placeholder.com/300x600.png?text=Publicidad" alt="Publicidad" className="ad-image" />
        </div>

        <div className="detail-main">
          <div className="breadcrumb">
            <Link to="/">Inicio</Link>
            {categoryName && (
              <><span>/</span><Link to={`/filtros?categoryId=${product.category_id}`}>{categoryName}</Link></>
            )}
            {subcategoryName && (
              <><span>/</span><Link to={`/filtros?categoryId=${product.category_id}&subcategoryId=${product.subcategory_id}`}>{subcategoryName}</Link></>
            )}
            <span>/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>

          <div className="product-images">
            <div className="image-wrapper">
              <img src={images[currentImage]?.image_url || "/no-image.webp"} className="product-image" alt={product.name} />
              {hasMultipleImages && (
                <>
                  {currentImage > 0 && <button className="image-arrow left" onClick={prevImage}>‹</button>}
                  {currentImage < images.length - 1 && <button className="image-arrow right" onClick={nextImage}>›</button>}
                  <div className="image-dots">
                    {images.map((_: any, index: number) => (
                      <span key={index} className={`dot ${index === currentImage ? "active" : ""}`} onClick={() => setCurrentImage(index)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="product-tags">
            {categoryName && (
              <div className="product-tag">
                <img src={getCategoryIcon(categoryName)} alt={categoryName} />
                <span>{categoryName}</span>
              </div>
            )}
            {subcategoryName && (
              <div className="product-tag sub">
                <img src={getSubcategoryIcon(categoryName, subcategoryName)} alt={subcategoryName} />
                <span>{subcategoryName}</span>
              </div>
            )}
          </div>

          <div className="product-details">
            <h3 className="section-title">Detalles del producto</h3>
            {product.description && <p className="details-description">{product.description}</p>}

            <ul className="details-list">
              {product.features?.map((f: string, i: number) => <li key={i}>– {f}</li>)}
            </ul>

            <div className="details-grid">
              {product.color && <div><span>Color</span><strong>{product.color}</strong></div>}
              {product.material && <div><span>Material</span><strong>{product.material}</strong></div>}
            </div>

            <div className="bundle-card">
              <div className="bundle-left">📦 Compra más productos y paga un solo envío</div>
              <button className="bundle-btn">Crear un lote</button>
            </div>

            {product.location && <div className="product-location">📍 {product.location}</div>}

            <div className="seller-reviews">
              <h3 className="section-title">⭐ {reviewSummary.average.toFixed(1)} · {sellerName} – {reviewSummary.total} valoraciones</h3>
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
                        profilePicture: rev.reviewer?.profile_picture || rev.reviewer?.profilePicture
                      },
                      product: rev.product || { id: product.id, name: product.name, images: product.images }
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="right-sidebar">
          <div className="detail-buy-card">
            <h3 className="buy-title">{product.name}</h3>
            <p className="buy-subtitle">{product.condition} - {product.color ?? "Beige"}</p>
            <p className="buy-price">{formatPrice(Number(product.price))}</p>

            <div className="buy-payments">
              <div className="apple-pay"> Apple Pay</div>
              <div className="apple-info">
                <span>3 Pagos al 0% con Apple Pay</span>
                <a href="#">Más información</a>
              </div>
            </div>

            <div className="buy-divider"></div>

            {/* --- LÓGICA DE BOTONES --- */}
            {isOwner ? (
              // CUANDO ES EL DUEÑO: Mostramos solo el mensaje, sin botones.
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '8px', 
                textAlign: 'center', 
                color: '#6c757d',
                border: '1px solid #e9ecef',
                marginTop: '15px'
              }}>
                <p style={{ margin: 0, fontWeight: '500' }}>Este producto es tuyo</p>
              </div>
            ) : (
              // CUANDO NO ES EL DUEÑO: Se muestran los botones de siempre.
              <>
                <div className="buy-shipping">🚚 Envío disponible</div>
                {product.active_negotiation ? (
                  <div className="negotiation-block">
                    <p>Producto en proceso de negociación</p>
                    <button className="buy-main-btn disabled" disabled>No disponible</button>
                  </div>
                ) : (
                  <Link to={`/checkout?productId=${product.id}`}>
                    <button className="buy-main-btn" type="button">Comprar</button>
                  </Link>
                )}

                <button
                  className="buy-offer-btn"
                  disabled={product.active_negotiation}
                >
                  {product.active_negotiation ? "Oferta en curso" : "Hacer oferta"}
                </button>
              </>
            )}
          </div>

          <div className="seller-card">
            <div className="seller-main" onClick={goToSellerProfile} style={{ cursor: "pointer" }}>
              <img src={sellerAvatar} alt={sellerName} className="seller-avatar" />
              <div className="seller-info">
                <p className="seller-name">{sellerName}</p>
                <div className="seller-rating-row">
                  <span className="star">⭐</span>
                  <span className="rating">{reviewSummary.average.toFixed(1)}</span>
                </div>
                <p className="seller-meta">{sellerPublic?.totalSales ?? 0} ventas · {reviewSummary.total} valoraciones</p>
              </div>
            </div>
            <div className="seller-actions">
              <button className="seller-profile-btn" onClick={goToSellerProfile} disabled={sellerLoading}>
                {sellerLoading ? "Cargando..." : "Ver perfil"}
              </button>
              
              {/* Solo mostrar el chat si NO es el dueño */}
              {!isOwner && <button className="seller-chat-btn">Chat</button>}
            </div>
          </div>

          <div className="shipping-card">
            <div className="shipping-tabs">
              <span className={`shipping-tab ${deliveryType === "shipping" ? "active" : ""}`} onClick={() => setDeliveryType("shipping")}>Con envío</span>
              <span className={`shipping-tab ${deliveryType === "person" ? "active" : ""}`} onClick={() => setDeliveryType("person")}>En persona</span>
            </div>
            {deliveryType === "shipping" ? (
              <div className="shipping-row">
                <div className="shipping-icon">🚚</div>
                <div className="shipping-info">
                  <p className="shipping-title">Entrega de 3 - 7 días</p>
                  <p className="shipping-desc">En punto de recogida o domicilio</p>
                </div>
                <div className="shipping-price">Desde 1,99 €</div>
              </div>
            ) : (
              <div className="shipping-row">
                <div className="shipping-icon">🤝</div>
                <div className="shipping-info">
                  <p className="shipping-title">Venta en persona</p>
                  <p className="shipping-desc">Paga en mano al recibir</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}