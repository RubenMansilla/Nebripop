import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

import bolsa from "../../assets/iconos/bolsa.png";
import tablet from "../../assets/categorias/tablets.png";
import ordenadoresImg from "../../assets/categorias/ordenadores.png";
import escritoriosImg from "../../assets/categorias/escritorios.png";
import ebooksImg from "../../assets/categorias/ebooks.png";
import tecladosImg from "../../assets/categorias/teclados.png";

import sofaJardinImg from "../../assets/garden/sofa.png";
import mesaJardinImg from "../../assets/garden/mesa.png";
import sillonJardinImg from "../../assets/garden/sillon.png";
import conjuntoJardinImg from "../../assets/garden/conjunto.png";
import pergolaImg from "../../assets/garden/pergola.png";

import cintaImg from "../../assets/fitness/cinta.png";
import bicicletaImg from "../../assets/fitness/bicicleta.png";
import elipticaImg from "../../assets/fitness/eliptica.png";
import mancuernasImg from "../../assets/fitness/mancuernas.png";
import pesasImg from "../../assets/fitness/pesas.png";

import { Link } from "react-router-dom";

// CHAT POPUP TEST
import ChatTestPopup from "../../components/ChatTest/ChatTestPopup";
import "../../components/ChatTest/ChatTestPopup.css";

export default function Home() {
  const [chatOpen, setChatOpen] = useState(false);

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

          <a className="cta" href="#contacto">Contacta con nosotros</a>
        </div>
      </section>

      {/* ======================= CATEGORÍAS ======================= */}
      <section className="home-categories">
        <div className="categories-wrapper">
          <h2 className="section-title">Lo mejor, al mejor precio</h2>

          <div className="categories-grid">

            <Link to="/filtros" className="category-card">
              <div className="card-inner">
                <div className="image-box">
                  <img src={tablet} alt="Tablets" />
                </div>
              </div>
              <p className="cat-title">Tablets</p>
              <p className="cat-sub">12.300 anuncios</p>
            </Link>

            <div className="category-card">
              <div className="card-inner">
                <div className="image-box">
                  <img src={ordenadoresImg} alt="Ordenadores" />
                </div>
              </div>
              <p className="cat-title">Ordenadores</p>
              <p className="cat-sub">1.300 anuncios</p>
            </div>

            <div className="category-card">
              <div className="card-inner">
                <div className="image-box">
                  <img src={escritoriosImg} alt="Escritorios" />
                </div>
              </div>
              <p className="cat-title">Escritorios</p>
              <p className="cat-sub">15.650 anuncios</p>
            </div>

            <div className="category-card">
              <div className="card-inner">
                <div className="image-box">
                  <img src={ebooksImg} alt="Ebooks" />
                </div>
              </div>
              <p className="cat-title">Ebooks</p>
              <p className="cat-sub">2.102 anuncios</p>
            </div>

            <div className="category-card">
              <div className="card-inner">
                <div className="image-box">
                  <img src={tecladosImg} alt="Teclados" />
                </div>
              </div>
              <p className="cat-title">Teclados</p>
              <p className="cat-sub">32.430 anuncios</p>
            </div>

          </div>
        </div>
      </section>

      {/* ===================== SECCIÓN JARDÍN ===================== */}
      <section className="garden-section">
        <h2 className="garden-title">Lo que necesitas para tu jardín</h2>

        <div className="garden-grid">

          <div className="garden-card">
            <div className="garden-img-wrap">
              <img src={sofaJardinImg} alt="Sofá de jardín" />
            </div>
            <h3>Sofá de jardín</h3>
            <p className="count">4.100 anuncios</p>
          </div>

          <div className="garden-card">
            <div className="garden-img-wrap">
              <img src={mesaJardinImg} alt="Mesa de jardín" />
            </div>
            <h3>Mesa de jardín</h3>
            <p className="count">7.343 anuncios</p>
          </div>

          <div className="garden-card">
            <div className="garden-img-wrap">
              <img src={sillonJardinImg} alt="Sillón de jardín" />
            </div>
            <h3>Sillón de jardín</h3>
            <p className="count">2.550 anuncios</p>
          </div>

          <div className="garden-card">
            <div className="garden-img-wrap">
              <img src={conjuntoJardinImg} alt="Conjunto de jardín" />
            </div>
            <h3>Conjunto de jardín</h3>
            <p className="count">4.143 anuncios</p>
          </div>

          <div className="garden-card">
            <div className="garden-img-wrap">
              <img src={pergolaImg} alt="Pérgola" />
            </div>
            <h3>Pérgola</h3>
            <p className="count">1.390 anuncios</p>
          </div>

        </div>
      </section>

      {/* ===================== SECCIÓN FITNESS ===================== */}
      <section className="home-section">
        <h2 className="home-section-title">Renueva tu rutina</h2>

        <div className="categories-grid">

          <div className="category-card">
            <div className="category-image-box">
              <img src={cintaImg} alt="Cinta de correr" />
            </div>
            <h3 className="category-title">Cinta de correr</h3>
            <p className="category-sub">3.120 anuncios</p>
          </div>

          <div className="category-card">
            <div className="category-image-box">
              <img src={bicicletaImg} alt="Bicicleta estática" />
            </div>
            <h3 className="category-title">Bicicleta estática</h3>
            <p className="category-sub">4.300 anuncios</p>
          </div>

          <div className="category-card">
            <div className="category-image-box">
              <img src={elipticaImg} alt="Elíptica" />
            </div>
            <h3 className="category-title">Elíptica</h3>
            <p className="category-sub">12.650 anuncios</p>
          </div>

          <div className="category-card">
            <div className="category-image-box">
              <img src={mancuernasImg} alt="Mancuernas" />
            </div>
            <h3 className="category-title">Mancuernas</h3>
            <p className="category-sub">5.102 anuncios</p>
          </div>

          <div className="category-card">
            <div className="category-image-box">
              <img src={pesasImg} alt="Pesas" />
            </div>
            <h3 className="category-title">Pesas</h3>
            <p className="category-sub">1.430 anuncios</p>
          </div>

        </div>
      </section>

      {/* ===================== QUIÉNES SOMOS ===================== */}
      <section className="about-wrapper">
        <div className="about-stats">
          <p className="stats-subtitle">Wallastock Experience 📈</p>
          <h2 className="stats-year">2025</h2>

          <div className="stats-row">
            <span className="stats-number">+150</span>
            <span className="stats-mil">mil</span>
          </div>

          <p className="stats-users">Usuarios activos</p>
        </div>

        <div className="about-card">
          <div className="about-text">
            <h2 className="about-title">¿Quienes somos <span>?</span></h2>

            <p className="about-description">
              Somos una aplicación creada para conectar personas que buscan vender y comprar
              artículos de segunda mano de forma rápida, segura y cercana…
            </p>
          </div>

          <img 
            src="/assets/about/about1.jpg" 
            alt="About us" 
            className="about-image"
          />
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
