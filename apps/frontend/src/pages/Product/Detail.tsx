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
            {product.images?.map((img: any, index: number) => (
              <img
                key={index}
                src={img.image_url || "/no-image.webp"}
                alt={`Producto ${index}`}
                className="product-image"
              />
            ))}
          </div>

          <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            <p className="product-price">{product.price} €</p>
            <p className="product-condition">{product.condition}</p>
            <p className="product-description">{product.description}</p>

            <div className="product-footer">
              {product.shipping_available ? (
                <span className="tag envio">Envío disponible</span>
              ) : (
                <span className="tag personal">Solo en persona</span>
              )}
            </div>

            <button className="btn-buy">Comprar</button>
          </div>
        </div>

        {/* Detalles adicionales en la parte derecha */}
        <div className="right-sidebar">
          <div className="payment-info">
            <h3>Pago</h3>
            <div>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/4/4f/Apple_Pay_logo.svg"
                alt="Apple Pay"
                className="apple-pay-logo"
              />
              <p>3 Pagos al 0% de interés con Apple Pay</p>
            </div>
            <p>Más información</p>
            <div className="shipping">
              {product.shipping_available ? (
                <span className="tag envio">Envío disponible</span>
              ) : (
                <span className="tag personal">Solo en persona</span>
              )}
            </div>
            <button className="btn-buy">Comprar</button>
          </div>

          <div className="seller-info">
            <h3>Vendedor</h3>
            <div className="seller">
              <img
                src="https://via.placeholder.com/50"
                alt="Vendedor"
                className="seller-image"
              />
              <div>
                <p>{product.seller_name}</p>
                <p>5 ★</p>
                <p>{product.seller_sales} Ventas</p>
                <p>{product.seller_reviews} Valoraciones</p>
              </div>
            </div>
          </div>

          <div className="shipping-options">
            <h3>Opciones de envío</h3>
            <div>
              <p>Entrega de 3 – 7 días</p>
              <p>En punto de recogida o a domicilio</p>
              <p>Desde 1.99 €</p>
            </div>
            <div>
              <p>Protección de Wallastock</p>
              <p>Envía el producto nuevamente fácil y ayuda cuando lo necesites</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
