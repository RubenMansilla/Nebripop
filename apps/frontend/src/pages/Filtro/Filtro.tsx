// src/pages/Filtro/Filtro.tsx
import { useState, useEffect, useContext } from "react";
import "./Filtro.css";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";

import { getAllProducts } from "../../api/products.api";


export default function Filtro() {
  // ========================
  // ESTADOS PRINCIPALES
  // ========================
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // FILTROS (más tarde los activaremos)
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(20000);
  const [conditionFilters, setConditionFilters] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string | null>(null);

  // ========================
  // CARGAR PRODUCTOS
  // ========================
  const { token } = useContext(AuthContext);

  useEffect(() => {
    getAllProducts(token)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [token]);


  // ========================
  // TOGGLE DE CHECKBOXES
  // ========================
  const toggleCondition = (value: string) => {
    setConditionFilters((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // ========================
  // PRODUCTOS FILTRADOS (por ahora sin filtros)
  // ========================
  const filteredProducts = products; // 🔥 TEMPORAL — así se muestran todos

  return (
    <>
      <Navbar />
      <div className="navbar-line"></div>
      <CategoriesBar />

      <div className="filtro-container">
        {/* ====================================
            SIDEBAR IZQUIERDO
        ==================================== */}
        <aside className="filtro-sidebar">
          <h2 className="filtro-title">Filtros</h2>

          {/* CATEGORÍAS */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Todas las categorías</h3>
            <ul className="filtro-list">
              <li>Coches</li>
              <li>Motos</li>
              <li>Motor y accesorios</li>
              <li>Moda y accesorios</li>
              <li>Tecnología y electrónica</li>
              <li className="ver-todo">Ver todo</li>
            </ul>
          </div>

          {/* UBICACIÓN */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Ubicación</h3>
            <p className="filtro-gray">Sin ubicación</p>
            <p className="filtro-link">Cambiar</p>
          </div>

          {/* ENVÍO */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Opciones de envío</h3>

            <div className="envio-toggle">
              <div className="envio-option active">Con envío</div>
              <div className="envio-option">Venta en persona</div>
            </div>
          </div>

          {/* ESTADO */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Estado</h3>

            {[
              { title: "Nuevo", desc: "Nunca se ha usado" },
              { title: "Como nuevo", desc: "En perfectas condiciones" },
              { title: "En buen estado", desc: "Usado pero bien" },
              { title: "Usado", desc: "Lo ha dado todo" },
            ].map((item) => (
              <label key={item.title} className="estado-item">
                <input
                  type="checkbox"
                  className="estado-checkbox"
                  checked={conditionFilters.includes(item.title)}
                  onChange={() => toggleCondition(item.title)}
                />
                <div className="estado-textos">
                  <span className="estado-title">{item.title}</span>
                  <span className="estado-desc">{item.desc}</span>
                </div>
              </label>
            ))}
          </div>

          {/* PRECIO */}
          <div className="filtro-block filtro-precio">
            <h3 className="filtro-subtitle">Precio</h3>

            <p className="range-labels">
              {min.toLocaleString()} € – +{max.toLocaleString()} €
            </p>

            <div className="np-slider-wrapper">
              {/* Rango seleccionado */}
              <div
                className="np-selected-range"
                style={{
                  left: `${(min / 20000) * 100}%`,
                  right: `${100 - (max / 20000) * 100}%`,
                }}
              ></div>

              {/* SLIDER MIN */}
              <input
                type="range"
                className="np-range-min"
                min="0"
                max="20000"
                value={min}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (max - v >= 500) setMin(v);
                }}
              />

              {/* SLIDER MAX */}
              <input
                type="range"
                className="np-range-max"
                min="0"
                max="20000"
                value={max}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v - min >= 500) setMax(v);
                }}
              />
            </div>
          </div>

          {/* FECHA */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Fecha de publicación</h3>

            {["Hoy", "Últimos 7 días", "Últimos 30 días"].map((label) => (
              <label key={label} className="np-radio-item">
                <input
                  type="radio"
                  name="fecha"
                  checked={dateFilter === label}
                  onChange={() => setDateFilter(label)}
                />
                <span className="np-radio-label">{label}</span>
              </label>
            ))}
          </div>
        </aside>

        {/* ====================================
            RESULTADOS DERECHA
        ==================================== */}
        <main className="filtro-results">
          <div className="filters-right">
            {/* ORDENAR */}
            <div className="order-wrapper">
              <label className="order-label">Ordenar por:</label>

              <select className="order-select">
                <option value="distancia">Distancia</option>
                <option value="recientes">Más recientes</option>
                <option value="precio-asc">Precio (menor → mayor)</option>
                <option value="precio-desc">Precio (mayor → menor)</option>
              </select>
            </div>



            <h2 className="results-title">Encuentra lo que buscas</h2>
            <p className="results-subtitle">Resultados de búsqueda</p>

            {/* GRID */}
            <div className="products-grid">
              {loading ? (
                <p>Cargando productos...</p>
              ) : filteredProducts.length === 0 ? (
                <p>No se encontraron productos</p>
              ) : (
                filteredProducts.map((p) => (
                  <Link to={`/product/${p.id}`} key={p.id}>  {/* Envolvemos el producto con Link */}
                    <div className="product-card">
                      <img
                        className="product-img"
                        src={
                          p.images?.[0]?.image_url &&
                            p.images[0].image_url.trim() !== ""
                            ? p.images[0].image_url
                            : "/no-image.webp"
                        }
                        alt={p.name}
                      />
                      <p className="product-price">{p.price} €</p>
                      <p className="product-title">{p.name}</p>
                      <p className="product-info">{p.condition}</p>
                      <div className="product-footer">
                        {p.shipping_available ? (
                          <span className="tag envio">Envío disponible</span>
                        ) : (
                          <span className="tag personal">Solo en persona</span>
                        )}
                      </div>
                    </div>
                  </Link> 
                ))
  )}
            </div>

          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
