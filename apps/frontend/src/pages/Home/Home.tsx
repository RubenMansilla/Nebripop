import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

// 1. IMPORTACIÓN DE ASSETS (Esto soluciona el problema del host)
import bolsa from "../../assets/iconos/bolsa.png";
import userIcon from "../../assets/home/user-icon.png";
import aboutWorkImg from "../../assets/home/about-work.webp";

import { HOME_CATEGORIES } from "../../data/homeCategories";
import type { HomeCategoryBlock } from "../../data/homeCategories";

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Home() {
  const [randomCategories, setRandomCategories] = useState<HomeCategoryBlock[]>([]);

  useEffect(() => {
    const picked = shuffleArray(HOME_CATEGORIES).slice(0, 3);
    setRandomCategories(picked);
  }, []);

  return (
    <>
      <Navbar />
      <CategoriesBar />

      <main>
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

        {/* CATEGORÍAS RANDOM */}
        {randomCategories.map((block) => (
          <section className="home-categories" key={block.categoryId}>
            <div className="categories-wrapper">
              <h2 className="section-title">{block.categoryName}</h2>
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

        {/* QUIÉNES SOMOS */}
        <section className="about-wrapper">
          <div className="about-stats">
            <span className="stats-subtitle">Nebripop Experience</span>
            <h2 className="stats-year">2025</h2>
            <div className="stats-row">
              <span className="stats-number">+150</span>
              <span className="stats-mil">mil</span>
              {/* USANDO VARIABLE IMPORTADA */}
              <img src={userIcon} alt="Usuarios" className="img-icon-stats" />
            </div>
            <div className="stats-divider"></div>
            <p className="stats-users">Usuarios activos</p>
          </div>

          <div className="about-card">
            <div className="about-text">
              <h2 className="about-title">
                <span>¿</span>Quienes somos<span>?</span>
              </h2>
              <p className="about-description">
                Somos una aplicación creada para conectar personas que buscan vender y comprar artículos de segunda mano
                de forma rápida, segura y cercana. Nuestra misión es dar una segunda vida a los productos.
              </p>
            </div>
            <div className="about-image-wrapper">
              {/* USANDO VARIABLE IMPORTADA */}
              <img src={aboutWorkImg} alt="Sobre nosotros" className="about-image" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}