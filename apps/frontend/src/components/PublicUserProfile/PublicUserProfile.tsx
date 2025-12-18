import "./PublicUserProfile.css";
import { useContext, useEffect, useState } from "react";
import type { UserType } from "../../types/user";
import type { ProductType } from "../../types/product";
import type { ReviewType } from "../../types/review";
import Product from "../Product/Product";
import Review from "../Review/Review";
import { AuthContext } from "../../context/AuthContext";
import {
  addFavoriteUser,
  removeFavoriteUser,
  isFavoriteUser,
} from "../../api/favorites.api";

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
  const { token, user: loggedUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState<"products" | "reviews">("products");
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  // 🔒 PROTECCIÓN
  if (!user) {
    return <div className="public-user-loading">Cargando perfil...</div>;
  }

  const isOwnProfile = loggedUser?.id === user.id;

  /* =============================
     COMPROBAR SI YA ES FAVORITO
     ============================= */
  useEffect(() => {
    if (!token || isOwnProfile) {
      setCheckingFavorite(false);
      return;
    }

    isFavoriteUser(user.id, token)
      .then((res) => {
        setIsFavorite(Boolean(res));
      })
      .catch((err) => {
        console.error("Error comprobando favorito:", err);
      })
      .finally(() => {
        setCheckingFavorite(false);
      });
  }, [user.id, token, isOwnProfile]);

  /* =============================
     TOGGLE FAVORITO
     ============================= */
  const toggleFavoriteUser = async () => {
    if (!token || isOwnProfile) return;

    try {
      if (isFavorite) {
        await removeFavoriteUser(user.id, token);
        setIsFavorite(false);
      } else {
        await addFavoriteUser(user.id, token);
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite user:", err);
    }
  };

  return (
    <section className="public-user-profile">
      {/* ===== HEADER ===== */}
      <div className="public-user-header">
        <div className="public-user-avatar">
          <img src={user.profilePicture} alt={user.fullName} />
        </div>

        <div className="public-user-info">
          <div className="user-name-row">
            <h1>{user.fullName}</h1>

            {rating && (
              <div className="public-user-rating">
                <span>⭐ {rating.average.toFixed(1)}</span>
                <span className="rating-total">({rating.total})</span>
              </div>
            )}
          </div>

          {/* BOTÓN FAVORITO */}
          {!isOwnProfile && token && !checkingFavorite && (
            <button
              className={`fav-user-btn ${isFavorite ? "active" : ""}`}
              onClick={toggleFavoriteUser}
            >
              {isFavorite
                ? "❤️ Usuario favorito"
                : "🤍 Añadir a favoritos"}
            </button>
          )}
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

      {/* ===== CONTENT ===== */}
      {activeTab === "products" && (
        <div className="public-user-section">
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
