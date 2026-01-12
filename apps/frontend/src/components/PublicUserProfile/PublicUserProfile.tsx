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
import { toast } from "react-toastify";
import { useNotificationSettings } from "../../context/NotificationContext";
import PublicUserProfileSkeleton from "../PublicUserProfileSkeleton/PublicUserProfileSkeleton";

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
  const { notify } = useNotificationSettings();
  const { token, user: loggedUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] =
    useState<"products" | "reviews">("products");
  const [isFavorite, setIsFavorite] = useState(false);
  const [checkingFavorite, setCheckingFavorite] = useState(true);

  const isOwnProfile = loggedUser?.id === user?.id;

  /* =============================
       COMPROBAR SI YA ES FAVORITO
     ============================= */
  useEffect(() => {
    if (!user || !token || isOwnProfile) {
      setCheckingFavorite(false);
      return;
    }

    isFavoriteUser(user.id)
      .then((res) => {
        setIsFavorite(Boolean(res));
      })
      .catch((err) => {
        console.error("Error comprobando favorito:", err);
      })
      .finally(() => {
        setCheckingFavorite(false);
      });
  }, [user?.id, token, isOwnProfile]);

  /* =============================
        TOGGLE FAVORITO
     ============================= */
  const toggleFavoriteUser = async () => {
    if (!token || !user || isOwnProfile) return;

    try {
      if (isFavorite) {
        await removeFavoriteUser(user.id);
        setIsFavorite(false);
        notify(
          "addedToFavorites",
          `Has eliminado a ${user.fullName} de tus usuarios favoritos.`,
          "info",
        );
      } else {
        await addFavoriteUser(user.id);
        notify(
          "addedToFavorites",
          `Has añadido a ${user.fullName} a tus usuarios favoritos.`,
          "success",
        );
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Error toggling favorite user:", err);
      toast.error("Error al actualizar usuario favorito");
    }
  };

  /* =============================
        SKELETON PERFIL PÚBLICO
     ============================= */
  if (!user) {
    return <PublicUserProfileSkeleton />;
  }

  /* =============================
              RENDER NORMAL
     ============================= */
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
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <svg
                      key={n}
                      className={`star ${
                        n <= Math.round(rating.average) ? "filled" : ""
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.074 2.633c.32-.844 1.531-.844 1.852 0l2.07 5.734a.99.99 0 0 0 .926.633h5.087c.94 0 1.35 1.17.611 1.743L18 14a.97.97 0 0 0-.322 1.092L19 20.695c.322.9-.72 1.673-1.508 1.119l-4.917-3.12a1 1 0 0 0-1.15 0l-4.917 3.12c-.787.554-1.83-.22-1.508-1.119l1.322-5.603A.97.97 0 0 0 6 14l-3.62-3.257C1.64 10.17 2.052 9 2.99 9h5.087a.99.99 0 0 0 .926-.633z" />
                    </svg>
                  ))}
                </div>
                <span className="rating-average">
                  {rating.average.toFixed(1)}
                </span>
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
              <span className="fav-icon">
                {isFavorite ? (
                  <svg viewBox="0 0 24 24" className="fav-icon-svg filled">
                    <path d="M12 21s-6.7-4.4-9.4-8C-.1 8.8 1.2 4.8 4.6 3.3c2-.9 4.4-.3 5.9 1.3 1.5-1.6 3.9-2.2 5.9-1.3 3.3 1.5 4.7 5.5 2 9.7-2.8 3.7-9.4 8-9.4 8z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="fav-icon-svg">
                    <path
                      d="M19.3 4.3c-2.1-2-5.6-2-7.7.2L12 4.8l-.6-.4c-2.1-2.2-5.7-2.3-7.7-.2-2.4 2.2-2.5 5.9-.2 8.4l7.9 7.9 7.9-7.9c2.3-2.5 2.2-6.2-.2-8.4z"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </span>
              <span className="fav-label">Usuario favorito</span>
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
