import "./PublicUserProfile.css";
import { useState } from "react";
import type { UserType } from "../../types/user";
import type { ProductType } from "../../types/product";
import type { ReviewType } from "../../types/review";
import Product from "../Product/Product";
import Review from "../Review/Review";

interface PublicUserProfileProps {
  user: UserType | null;
  products: ProductType[];
  reviews: ReviewType[];
  rating: {
    average: number;
    total: number;
  } | null;
 
}

export default function PublicUserProfile({
  user,
  products,
  reviews,
  rating,
}: PublicUserProfileProps) {

  // 👉 TAB ACTIVO
  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");

  if (!user) {
    return <div className="public-user-loading">Cargando perfil...</div>;
  }

  return (
    <section className="public-user-profile">

    {/* ===== HEADER ===== */}
<div className="public-user-header">
  <div className="public-user-avatar">
    <img src={user.profilePicture} alt={user.fullName} />
  </div>

  <div className="public-user-info">

    {/* NOMBRE + RATING */}
    <div className="user-name-row">
      <h1>{user.fullName}</h1>

      {rating && (
        <div className="public-user-rating">
          <span>⭐ {rating.average.toFixed(1)}</span>
          <span className="rating-total">({rating.total})</span>
        </div>
      )}
    </div>
    

    

  </div>
</div>


      {/* ===== STATS ===== */}
      <div className="public-user-stats">
        <div className="stat">
          <span className="stat-value">{products.length}</span>
          <span className="stat-label">Productos</span>
        </div>

        <div className="stat">
          <span className="stat-value">{reviews.length}</span>
          <span className="stat-label">Opiniones</span>
        </div>
      </div>

      {/* ===== TABS ===== */}
      <div className="public-user-tabs">
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          Productos
        </button>

        <button
          className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
          onClick={() => setActiveTab("reviews")}
        >
          Valoraciones
        </button>
      </div>

      {/* ===== CONTENIDO ===== */}
      {activeTab === "products" && (
        <div className="public-user-section">
          <h2>Productos en venta</h2>

          {products.length === 0 ? (
            <p className="empty-text">
              Este usuario no tiene productos publicados
            </p>
          ) : (
            <ul className="public-user-products">
              {products.map((product) => (
                <Product
                  key={product.id}
                  product={product}
                  mode="public"
                />
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="public-user-section">
          <h2>Valoraciones</h2>

          {reviews.length === 0 ? (
            <p className="empty-text">
              Este usuario aún no tiene valoraciones
            </p>
          ) : (
            <div className="public-user-reviews">
              {reviews.map((review) => (
                <Review key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      )}

    </section>
  );
}
