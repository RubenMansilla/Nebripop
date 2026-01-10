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

export default function Detail() {
  const { productId } = useParams(); // Capturamos el productId de la URL

  useEffect(() => {
    if (productId) {
      incrementProductView(productId);
    }
  }, [productId]);

  const [product, setProduct] = useState<any>(null); // Detalles del producto
  const [loading, setLoading] = useState(true); // Estado de carga
  const [deliveryType, setDeliveryType] = useState<"shipping" | "person">(
    "shipping"
  );
  const [currentImage, setCurrentImage] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewSummary, setReviewSummary] = useState<{
    average: number;
    total: number;
  }>({ average: 0, total: 0 });

  // Estado para el perfil público del vendedor
  const [sellerPublic, setSellerPublic] = useState<any | null>(null);
  const [sellerLoading, setSellerLoading] = useState(false);

  const navigate = useNavigate();

  const images = product?.images ?? [];
  const hasMultipleImages = images.length > 1;

  const renderStars = (rating: number) =>
    "⭐".repeat(Math.round(rating));

  const nextImage = () => {
    if (images.length === 0) return;

    setCurrentImage((prev) =>
      prev < images.length - 1 ? prev + 1 : prev
    );
  };

  const prevImage = () => {
    if (images.length === 0) return;

    setCurrentImage((prev) =>
      prev > 0 ? prev - 1 : prev
    );
  };

  // Cargar producto
  useEffect(() => {
    if (productId) {
      getProductById(productId)
        .then((data: any) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          console.error("Error fetching product details:", err);
          setLoading(false);
        });
    }
  }, [productId]);

  // Cargar reviews y resumen de valoraciones del vendedor
  useEffect(() => {
    if (product?.seller?.id) {
      getReviews(product.seller.id, "newest")
        .then(setReviews)
        .catch(console.error);

      getUserReviewSummary(product.seller.id)
        .then(setReviewSummary)
        .catch(console.error);
    }
  }, [product?.seller?.id]);

  // Cargar datos públicos del vendedor
  // Cargar datos públicos del vendedor
  useEffect(() => {
    const sellerId = product?.seller?.id;
    if (!sellerId) return;

    setSellerLoading(true);
    getPublicUser(sellerId)
      .then((data) => {
        console.log("PUBLIC USER DETAIL:", data); // 👈 mira esto en la consola
        setSellerPublic(data);
      })
      .catch((err) => {
        console.error("Error obteniendo usuario público:", err);
      })
      .finally(() => setSellerLoading(false));
  }, [product?.seller?.id]);


  useEffect(() => {
    if (product) {
      console.log("SELLER en product:", product.seller);
    }
  }, [product]);

  const goToSellerProfile = () => {
    const id = sellerPublic?.id ?? product?.seller?.id;
    if (!id) return;

    // usa la ruta que tengas para PublicUser (ej: /usuario/:userId)
    navigate(`/users/${id}`);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!product) {
    return <div>Producto no encontrado</div>;
  }

  const formatPrice = (value: number) => {
    if (Number.isInteger(value)) return `${value}€`;

    return `${value.toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}€`;
  };

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const subcategoryName =
    typeof product.subcategory === "object"
      ? product.subcategory?.name
      : product.subcategory;

  // NOMBRE DEL VENDEDOR
  const sellerName =
    sellerPublic?.fullName ??               // <- viene del backend (User.fullName)
    sellerPublic?.name ??                   // por si en algún momento lo cambias
    product?.seller?.fullName ??            // backup desde el producto
    product?.seller?.name ??                // otro backup
    "Vendedor";

  // AVATAR DEL VENDEDOR
  const rawAvatar =
    sellerPublic?.profilePicture ??         // <- viene del backend (User.profilePicture)
    sellerPublic?.profile_picture ??        // por si en algún sitio usas snake_case
    sellerPublic?.avatar ??
    sellerPublic?.avatarUrl ??
    product?.seller?.profilePicture ??      // backup desde el producto
    product?.seller?.profile_picture ??
    "";

  const sellerAvatar =
    rawAvatar && rawAvatar !== "" ? rawAvatar : "/default-avatar.png";

  // VENTAS TOTALES (si en algún momento las añades)
  const sellerTotalSales =
    (sellerPublic as any)?.totalSales ??
    product?.seller?.totalSales ??
    0;



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
                <Link to={`/filtros?categoryId=${product.category_id}`}>
                  {categoryName}
                </Link>
              </>
            )}

            {subcategoryName && (
              <>
                <span>/</span>
                <Link
                  to={`/filtros?categoryId=${product.category_id}&subcategoryId=${product.subcategory_id}`}
                >
                  {subcategoryName}
                </Link>
              </>
            )}

            <span>/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>

          <div className="product-images">
            <div className="image-wrapper">
              <img
                src={images[currentImage]?.image_url || "/no-image.webp"}
                className="product-image"
              />

              {hasMultipleImages && (
                <>
                  {currentImage > 0 && (
                    <button
                      className="image-arrow left"
                      onClick={prevImage}
                      type="button"
                    >
                      ‹
                    </button>
                  )}

                  {currentImage < images.length - 1 && (
                    <button
                      className="image-arrow right"
                      onClick={nextImage}
                      type="button"
                    >
                      ›
                    </button>
                  )}

                  <div className="image-dots">
                    {images.map((_: any, index: number) => (
                      <span
                        key={index}
                        className={`dot ${index === currentImage ? "active" : ""
                          }`}
                        onClick={() => setCurrentImage(index)}
                      />
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

            {product.description && (
              <p className="details-description">
                {product.description}
              </p>
            )}

            <ul className="details-list">
              {product.features?.map((feature: string, index: number) => (
                <li key={index}>– {feature}</li>
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
              <div className="bundle-left">
                📦 Compra más productos a este vendedor y paga un solo envío
              </div>

              <button className="bundle-btn">
                Crear un lote
              </button>
            </div>

            {product.location && (
              <div className="product-location">
                📍 {product.location}
              </div>
            )}

            <div className="seller-reviews">
              <h3 className="section-title">
                ⭐ {reviewSummary.average.toFixed(1)} · {sellerName} –{" "}
                {reviewSummary.total} valoraciones
              </h3>

              {reviews.length === 0 && (
                <p className="no-reviews">
                  Este vendedor aún no tiene valoraciones
                </p>
              )}

              {reviews.map((review) => (
                <div className="review-item" key={review.id}>
                  <img
                    src={review.reviewer?.profile_picture ?? "/default-avatar.png"}
                    alt={review.reviewer?.full_name}
                    className="review-avatar"
                    loading="lazy"
                  />

                  <div>
                    <strong>{review.reviewer?.full_name}</strong>

                    <p className="review-date">
                      {new Date(review.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>

                    <div className="review-stars">
                      {renderStars(review.rating)}
                    </div>

                    {review.comment && (
                      <p className="review-comment">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles adicionales en la parte derecha */}
        <div className="right-sidebar">
          <div className="detail-buy-card">
            <h3 className="buy-title">
              {product.name}
            </h3>

            <p className="buy-subtitle">
              {product.condition} - {product.color ?? "Beige"} -{" "}
              {product.material ?? "Madera"}
            </p>

            <p className="buy-price">
              {formatPrice(Number(product.price))}
            </p>

            <div className="buy-payments">
              <div className="apple-pay">
                 Apple Pay
              </div>

              <div className="apple-info">
                <span>3 Pagos al 0% de interés con Apple Pay</span>
                <a href="#">Más información</a>
              </div>
            </div>

            <div className="buy-divider"></div>

            <div className="buy-shipping">
              🚚 Envío disponible
            </div>

            <Link to={`/checkout?productId=${product.id}`}>
              <button className="buy-main-btn" type="button">
                Comprar
              </button>
            </Link>

            <button className="buy-offer-btn">
              Hacer oferta
            </button>
          </div>

          <div className="seller-card">
            <div
              className="seller-main"
              onClick={goToSellerProfile}
              style={{ cursor: "pointer" }}
            >
              <img
                src={sellerAvatar}
                alt={sellerName}
                className="seller-avatar"
                loading="lazy"
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
                  {sellerTotalSales} ventas · {reviewSummary.total} valoraciones
                </p>
              </div>
            </div>

            <div className="seller-actions">
              <button
                className="seller-profile-btn"
                type="button"
                onClick={goToSellerProfile}
                disabled={sellerLoading}
              >
                {sellerLoading ? "Cargando perfil..." : "Ver perfil"}
              </button>

              <button className="seller-chat-btn" type="button">
                Chat
              </button>
            </div>
          </div>

          <div className="shipping-card">
            {/* TABS */}
            <div className="shipping-tabs">
              <span
                className={`shipping-tab ${deliveryType === "shipping" ? "active" : ""
                  }`}
                onClick={() => setDeliveryType("shipping")}
              >
                Con envío
              </span>

              <span
                className={`shipping-tab ${deliveryType === "person" ? "active" : ""
                  }`}
                onClick={() => setDeliveryType("person")}
              >
                Venta en persona
              </span>
            </div>

            {/* CONTENIDO */}
            {deliveryType === "shipping" ? (
              <>
                {/* ENTREGA */}
                <div className="shipping-row">
                  <div className="shipping-icon">🚚</div>

                  <div className="shipping-info">
                    <p className="shipping-title">Entrega de 3 - 7 días</p>
                    <p className="shipping-desc">
                      En punto de recogida o a domicilio
                    </p>
                  </div>

                  <div className="shipping-price">Desde 1,99 €</div>
                </div>

                {/* PROTECCIÓN */}
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
                {/* VENTA EN PERSONA */}
                <div className="shipping-row">
                  <div className="shipping-icon">🤝</div>

                  <div className="shipping-info">
                    <p className="shipping-title">Venta en persona</p>
                    <p className="shipping-desc">
                      Queda con el vendedor y paga en mano
                    </p>
                  </div>
                </div>

                <div className="shipping-row">
                  <div className="shipping-icon">📍</div>

                  <div className="shipping-info">
                    <p className="shipping-title">Punto de encuentro</p>
                    <p className="shipping-desc">
                      Lugar acordado entre comprador y vendedor
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
