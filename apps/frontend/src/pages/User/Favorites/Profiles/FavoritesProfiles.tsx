import "./FavoritesProfiles.css";
import Navbar from "../../../../components/Navbar/Navbar";
import CategoriesBar from "../../../../components/CategoriesBar/CategoriesBar";
import ProfileSideBar from "../../../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import { getMyFavoriteUsers } from "../../../../api/favorites.api";

interface FavoriteUser {
  id: number;
  full_name: string;
  profile_picture: string;
}

export default function FavoritesProfiles() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [selected, setSelected] = useState("profiles");
  const [users, setUsers] = useState<FavoriteUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selected === "products") {
      navigate("/favorites/products");
    }
  }, [selected, navigate]);

  useEffect(() => {
    if (!token) return;

    getMyFavoriteUsers(token)
      .then(setUsers)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
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
                className={`info-item ${
                  selected === "products" ? "active" : ""
                }`}
                onClick={() => setSelected("products")}
              >
                <p>Productos</p>
              </div>

              <div
                className={`info-item ${
                  selected === "profiles" ? "active" : ""
                }`}
                onClick={() => setSelected("profiles")}
              >
                <p>Perfiles</p>
              </div>
            </div>
          </div>

          {/* LISTA DE USUARIOS */}
          <div className="favorites-users-wrapper">
            {loading ? (
              <p>Cargando perfiles...</p>
            ) : users.length === 0 ? (
              <p className="empty-text">
                Aún no has añadido usuarios a favoritos
              </p>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="favorite-user-row"
                  onClick={() => navigate(`/users/${user.id}`)}
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
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
