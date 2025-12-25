import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

import bolsa from "../../assets/iconos/bolsa.png";

import { HOME_CATEGORIES} from "../../data/homeCategories.ts";
import type {HomeCategoryBlock} from "../../data/homeCategories.ts";  

/* 🔀 función helper FUERA del componente */
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
      <div className="navbar-line"></div>
      <CategoriesBar />

      {/* HERO */}
      <section className="hero">
        <div className="hero__inner">
          <div className="brand">
            <img src={bolsa} alt="Bolsa Nebripop" className="bag" />
            <h1>Nebripop</h1>
          </div>

          <p className="subtitle">
            Compra y vende lo que ya no usas, fácil y cerca de ti.
          </p>

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

      <Footer />
    </>
  );
}
