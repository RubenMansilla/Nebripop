import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../../api/products.api"; // Asegúrate de que esta función esté correctamente importada
import "./Detail.css";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";

export default function Detail() {
  const { productId } = useParams(); // Capturamos el productId de la URL
  const [product, setProduct] = useState<any>(null); // Estado para los detalles del producto
  const [loading, setLoading] = useState(true); // Estado de carga
  const [deliveryType, setDeliveryType] = useState<"shipping" | "person">("shipping")
  const [currentImage, setCurrentImage] = useState(0);
  const images = product?.images ?? [];
  const hasMultipleImages = images.length > 1;



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


  useEffect(() => {
    if (productId) {
      getProductById(productId)
        .then((data: any) => {
          setProduct(data); // Guardamos los detalles del producto
          setLoading(false); // Terminamos el estado de carga
        })
        .catch((err: Error) => {
          console.error("Error fetching product details:", err);
          setLoading(false); // Terminamos el estado de carga en caso de error
        });
    }
  }, [productId]); // Solo se vuelve a ejecutar cuando cambia el productId

  if (loading) {
    return <div>Cargando...</div>; // Indicador de carga
  }

  if (!product) {
    return <div>Producto no encontrado</div>; // Si no encontramos el producto
  }

  const categoryName =
    typeof product.category === "object"
      ? product.category?.name
      : product.category;

  const subcategoryName =
    typeof product.subcategory === "object"
      ? product.subcategory?.name
      : product.subcategory;


  return (
    <>
      <Navbar />
      <CategoriesBar />
      <div className="detail-container">
        <div className="left-sidebar">
          <img
            src="https://via.placeholder.com/300x600.png?text=Publicidad" // Imagen de publicidad
            alt="Publicidad"
            className="ad-image"
          />
        </div>

        <div className="detail-main">
          <div className="product-category">
            <span>{product.category} / {product.subcategory}</span> {/* Categoría y subcategoría */}
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
                        className={`dot ${index === currentImage ? "active" : ""}`}
                        onClick={() => setCurrentImage(index)}
                      />
                    ))}
                  </div>
                </>
              )}

            </div>
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

              {product.seller && (
                <h3 className="section-title">
                  ⭐ {product.seller.rating} · {product.seller.name} – Valoraciones
                </h3>
              )}


              <div className="review-item">
                <img
                  src="/default-avatar.webp"
                  className="review-avatar"
                />

                <div>
                  <strong>Lucas Salazar Márquez</strong>
                  <p className="review-date">25 dic 2025</p>
                  <div className="review-stars">⭐⭐⭐⭐⭐</div>
                </div>
              </div>

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
              {product.condition} - {product.color ?? "Beige"} - {product.material ?? "Madera"}
            </p>

            <p className="buy-price">
              {product.price}€
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

            <button className="buy-main-btn">
              Comprar
            </button>

            <button className="buy-offer-btn">
              Hacer oferta
            </button>

          </div>

          <div className="seller-card">
            <div className="seller-left">
              {product.seller && (
                <img
                  src={product.seller.avatar || "/default-avatar.webp"}
                  className="seller-avatar"
                  alt={product.seller.name}
                />
              )}


              <div>
                <p className="seller-name">{product.seller?.name}</p>
                <p className="seller-rating">⭐ {product.seller?.rating}</p>
                <p className="seller-meta">
                  {product.seller?.totalSales} ventas · {product.seller?.totalReviews} valoraciones
                </p>
              </div>
            </div>
            <button className="seller-chat">Chat</button>
          </div>

          <div className="shipping-card">

            {/* TABS */}
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
