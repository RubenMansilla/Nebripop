import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

import bolsa from "../../assets/iconos/bolsa.png";

import { HOME_CATEGORIES } from "../../data/homeCategories";
import type { HomeCategoryBlock } from "../../data/homeCategories";

/* 🔀 función helper FUERA del componente */
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// CHAT POPUP TEST
import ChatTestPopup from "../../components/ChatTest/ChatTestPopup";
import "../../components/ChatTest/ChatTestPopup.css";

export default function Home() {
  const [randomCategories, setRandomCategories] = useState<HomeCategoryBlock[]>([]);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const picked = shuffleArray(HOME_CATEGORIES).slice(0, 3);
    setRandomCategories(picked);
  }, []);

  return (
    <>
      <Navbar />
      <CategoriesBar />

      {/* HERO */}
      <section className="hero">
        <div className="hero__inner">
          <div className="brand">
            <img src={bolsa} alt="Bolsa Nebripop" className="bag" />
            <h1>Nebripop</h1>
          </div>

          <p className="subtitle">Compra y vende lo que ya no usas, fácil y cerca de ti.</p>

          <a className="cta" href="#contacto">
            Contacta con nosotros
          </a>
        </div>
      </section>

      {/* ======================= HOME CATEGORÍAS RANDOM ======================= */}
      {randomCategories.map((block) => (
        <section className="home-categories" key={block.categoryId}>
          <div className="categories-wrapper">
            <h2 className="section-title">{block.categoryName}</h2>
            <br />
            <div className="categories-grid">
              {block.subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  to={`/filtros?category=${block.categoryId}&subcategory=${sub.id}`}
                  className="category-card"
                >
                  <div className="card-inner">
                    <div className="image-box">
                      <img src={sub.icon} alt={sub.name} />
                    </div>
                  </div>

                  <p className="cat-title">{sub.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===================== QUIÉNES SOMOS ===================== */}
      <section className="about-wrapper">
        {/* BLOQUE IZQUIERDO */}
        <div className="about-stats">
          <span className="stats-subtitle">Nebripop Experience</span>

          <h2 className="stats-year">2025</h2>

          <div className="stats-row">
            <span className="stats-number">+150</span>
            <span className="stats-mil">mil</span>
            <img src="/src/assets/home/user-icon.png" alt="" className="img-icon-stats" />
          </div>

          <div className="stats-divider"></div>
          <p className="stats-users">Usuarios activos</p>
        </div>

        {/* BLOQUE DERECHO */}
        <div className="about-card">
          <div className="about-text">
            <h2 className="about-title">
              <span>¿</span>Quienes somos<span>?</span>
            </h2>

            <p className="about-description">
              Somos una aplicación creada para conectar personas que buscan vender y comprar artículos de segunda mano
              de forma rápida, segura y cercana. Nuestra misión es dar una segunda vida a los productos, fomentar el
              ahorro y contribuir a un consumo más sostenible, facilitando el encuentro entre quienes quieren vender y
              quienes necesitan comprar.
            </p>
          </div>

          <div className="about-image-wrapper">
            <img src="/src/assets/home/about-work.jpg" alt="About us" className="about-image" />
          </div>
        </div>
      </section>

      {/* BOTÓN FLOTANTE DEL CHAT */}
      <div className="chat-floating-btn" onClick={() => setChatOpen(true)}>
        💬
      </div>

      {/* POPUP DE CHAT */}
      <ChatTestPopup open={chatOpen} onClose={() => setChatOpen(false)} />

      <Footer />
    </>
  );
}
