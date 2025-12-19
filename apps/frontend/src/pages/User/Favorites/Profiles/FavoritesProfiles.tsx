import "./FavoritesProfiles.css";
import Navbar from "../../../../components/Navbar/Navbar";
import CategoriesBar from "../../../../components/CategoriesBar/CategoriesBar";
import ProfileSideBar from "../../../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import { getMyFavoriteUsers } from "../../../../api/favorites.api";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import noReviewsImg from "../../../../assets/profile/pop-no-favorite-users.svg";

interface FavoriteUser {
  id: number;
  full_name: string;
  profile_picture: string;
}


const createSlug = (name: string) => {
  return name
    .toString()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar tildes
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/[^\w-]+/g, '') // Borrar caracteres raros
    .replace(/--+/g, '-'); // Quitar guiones dobles
};

export default function FavoritesProfiles() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  /* selector */
  const [selected, setSelected] = useState("profiles");

  /* data */
  const [users, setUsers] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  /* paginación */
  const [visibleCount, setVisibleCount] = useState(25);
  const visibleUsers = users.slice(0, visibleCount);
  const hasMore = visibleCount < users.length;

  const showMore = () => {
    setVisibleCount((prev) => prev + 25);
  };

  /* navegación selector */
  useEffect(() => {
    if (selected === "products") {
      navigate("/favorites/products");
    }
  }, [selected, navigate]);

  /* cargar favoritos */
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setShowSkeleton(false);

    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 300);

    getMyFavoriteUsers(token)
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        clearTimeout(skeletonTimer);
        setLoading(false);
      });

    return () => clearTimeout(skeletonTimer);
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="navbar-line"></div>
      <CategoriesBar />

      <section className="sidebar-container">
        <div className="hide-left-sidebar">
          <ProfileSideBar />
        </div>

        <div className="sidebar-right">
          {/* HEADER */}
          <div className="info-section">
            <div className="info-container">
              <div className="title">
                <h1>Tus favoritos</h1>
              </div>
              <div className="description">
                <p>Perfiles de usuarios que has marcado como favoritos</p>
              </div>
            </div>
          </div>

          {/* SELECTOR */}
          <div className="info-selector">
            <div className="info-items">
              <div
                className={`info-item ${selected === "products" ? "active" : ""}`}
                onClick={() => setSelected("products")}
              >
                <p>Productos</p>
              </div>

              <div
                className={`info-item ${selected === "profiles" ? "active" : ""}`}
                onClick={() => setSelected("profiles")}
              >
                <p>Perfiles</p>
              </div>
            </div>
          </div>

          {/* LOADING + SKELETON */}
          {loading && showSkeleton ? (
            <ul className="product-container users-container">
              {[...Array(5)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </ul>
          ) : (
            <>
              {/* VACÍO */}
              {!loading && users.length === 0 && (
                <div className="no-reviews">
                  <img
                    src={noReviewsImg}
                    alt="Sin favoritos"
                    className="no-reviews-img"
                  />
                  <h3>Perfiles que te interesan</h3>
                  <p>Para guardar un perfil de usuario, pulsa el icono de perfil favorito.</p>
                </div>
              )}

              {/* LISTA */}
              {users.length > 0 && (
                <>
                  <ul className="product-container users-container">
                    {visibleUsers.map((user) => (
                      <li
                        key={user.id}
                        className="favorite-user-row"
                        onClick={() => {
                          const slug = createSlug(user.full_name);
                          navigate(`/users/${slug}-${user.id}`);
                        }}
                      >
                        <img
                          src={user.profile_picture}
                          alt={user.full_name}
                          className="favorite-user-avatar"
                        />

                        <div className="favorite-user-info">
                          <p className="favorite-user-name">{user.full_name}</p>
                          <p className="favorite-user-sub">
                            Ver perfil público
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {hasMore && (
                    <div
                      className="btn-more-reviews-container"
                      onClick={showMore}
                    >
                      <div className="btn-more-reviews">
                        Ver más perfiles
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
