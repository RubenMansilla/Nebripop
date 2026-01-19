// src/pages/Filtro/Filtro.tsx
import { useState, useEffect, useContext } from "react";
import "./Filtro.css";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import Footer from "../../components/Footer/Footer";
import Product from "../../components/Product/Product";

import { getAllProducts } from "../../api/products.api";
import { getCategories } from "../../api/categories.api";
import { getSubcategoriesByCategory } from "../../api/subcategories.api";

export default function Filtro() {
  const { token } = useContext(AuthContext);

  // ========================
  // ESTADOS PRINCIPALES
  // ========================
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ========================
  // CATEGORÍAS
  // ========================
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(
    null,
  );

  // Rango de precio que se manda a la API (si lo usas)
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(20000);

  const [dateFilter, setDateFilter] = useState<
    "today" | "7days" | "30days" | undefined
  >(undefined);

  // ========================
  // FILTROS (UI)
  // ========================
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(20000);
  const [conditionFilters, setConditionFilters] = useState<string[]>([]);
  const [shippingFilter, setShippingFilter] =
    useState<"shipping" | "person" | null>(null);

  // ========================
  // PAGINACIÓN (40 en 40)
  // ========================
  const [visibleCount, setVisibleCount] = useState(40);

  // ========================
  // FILTROS MÓVIL
  // ========================
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ========================
  // CARGAR PRODUCTOS
  // ========================
  useEffect(() => {
    setLoading(true);

    getAllProducts(
      selectedCategory,
      selectedSubcategory,
      minPrice,
      maxPrice,
      dateFilter,
    )
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [
    token,
    selectedCategory,
    selectedSubcategory,
    minPrice,
    maxPrice,
    dateFilter,
  ]);

  // Cada vez que cambian productos o filtros → volver a 40 primeros
  useEffect(() => {
    setVisibleCount(40);
  }, [
    products,
    selectedCategory,
    selectedSubcategory,
    min,
    max,
    conditionFilters,
    shippingFilter,
    dateFilter,
  ]);

  // ========================
  // CARGAR CATEGORÍAS
  // ========================
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(console.error);
  }, []);

  // ========================
  // CARGAR SUBCATEGORÍAS (y borrar duplicadas)
  // ========================
  useEffect(() => {
    if (!selectedCategory) {
      setSubcategories([]);
      setSelectedSubcategory(null);
      return;
    }

    getSubcategoriesByCategory(selectedCategory)
      .then((subs) => {
        const seenNames = new Set<string>();
        const uniqueSubs = subs.filter((sub: any) => {
          if (seenNames.has(sub.name)) return false;
          seenNames.add(sub.name);
          return true;
        });
        setSubcategories(uniqueSubs);
      })
      .catch(console.error);
  }, [selectedCategory]);

  // ========================
  // TOGGLE ESTADO
  // ========================
  const toggleCondition = (value: string) => {
    setConditionFilters((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  // ========================
  // REINICIAR FILTROS
  // ========================
  const resetFilters = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);

    setMin(0);
    setMax(20000);
    setMinPrice(0);
    setMaxPrice(20000);

    setConditionFilters([]);
    setShippingFilter(null);
    setDateFilter(undefined);
    setShowMobileFilters(false);
  };

  // ========================
  // FILTRADO REAL (front)
  // ========================
  const filteredProducts = products.filter((p) => {
    const price = Number(p.price);
    if (Number.isNaN(price)) return false;
    if (price < min || price > max) return false;

    // ESTADO
    if (conditionFilters.length > 0 && !conditionFilters.includes(p.condition)) {
      return false;
    }

    // ENVÍO
    if (shippingFilter === "shipping" && !p.shipping_active) return false;
    if (shippingFilter === "person" && p.shipping_active) return false;

    return true;
  });

  const paginatedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <>
      <Navbar />
      <div className="navbar-line" />
      <CategoriesBar />

      <div className="filtro-container">
        {/* CABECERA MÓVIL: toggle filtros */}
        <div className="filtro-mobile-header">
          <h2 className="results-title-mobile">Resultados</h2>
          <button
            type="button"
            className="filtro-toggle-mobile"
            onClick={() => setShowMobileFilters((prev) => !prev)}
          >
            {showMobileFilters ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
          </button>
        </div>

        {/* ========================
            SIDEBAR
        ======================== */}
        <aside
          className={`filtro-sidebar ${
            showMobileFilters ? "filtro-sidebar--open" : ""
          }`}
        >
          <div className="filtro-sidebar-header">
            <h2 className="filtro-title">Filtros</h2>
            <button
              type="button"
              className="filtro-reset-button"
              onClick={resetFilters}
            >
              Reiniciar filtros
            </button>
          </div>

          {/* CATEGORÍAS */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Categorías</h3>
            <ul className="filtro-list">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={selectedCategory === cat.id ? "active" : ""}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedSubcategory(null);
                  }}
                >
                  {cat.name}
                </li>
              ))}
              <li
                className={`ver-todo ${selectedCategory === null ? "active" : ""}`}
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                }}
              >
                Ver todo
              </li>
            </ul>
          </div>

          {/* SUBCATEGORÍAS */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="filtro-block">
              <h3 className="filtro-subtitle">Subcategorías</h3>
              <ul className="filtro-list">
                {subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className={selectedSubcategory === sub.id ? "active" : ""}
                    onClick={() => setSelectedSubcategory(sub.id)}
                  >
                    {sub.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ENVÍO */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Opciones de envío</h3>
            <div className="envio-toggle">
              <div
                className={`envio-option ${
                  shippingFilter === "shipping" ? "active" : ""
                }`}
                onClick={() =>
                  setShippingFilter(
                    shippingFilter === "shipping" ? null : "shipping",
                  )
                }
              >
                Con envío
              </div>
              <div
                className={`envio-option ${
                  shippingFilter === "person" ? "active" : ""
                }`}
                onClick={() =>
                  setShippingFilter(
                    shippingFilter === "person" ? null : "person",
                  )
                }
              >
                Venta en persona
              </div>
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
          <div className="filtro-block filtro-precio-inputs">
            <h3 className="filtro-subtitle">Precio</h3>

            <div className="precio-inputs">
              <input
                type="number"
                placeholder="0"
                value={min}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMin(value);
                  setMinPrice(value);
                }}
              />
              <span className="precio-separador">€</span>
              <input
                type="number"
                placeholder="20000"
                value={max}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setMax(value);
                  setMaxPrice(value);
                }}
              />
              <span className="precio-separador">€</span>
            </div>
          </div>

          {/* FECHA PUBLICACIÓN */}
          <div className="filtro-block">
            <h3 className="filtro-subtitle">Fecha de publicación</h3>

            <ul className="filtro-list">
              <li
                className={dateFilter === "today" ? "active" : ""}
                onClick={() => setDateFilter("today")}
              >
                Hoy
              </li>

              <li
                className={dateFilter === "7days" ? "active" : ""}
                onClick={() => setDateFilter("7days")}
              >
                Últimos 7 días
              </li>

              <li
                className={dateFilter === "30days" ? "active" : ""}
                onClick={() => setDateFilter("30days")}
              >
                Últimos 30 días
              </li>

              <li
                className={`ver-todo ${!dateFilter ? "active" : ""}`}
                onClick={() => setDateFilter(undefined)}
              >
                Ver todo
              </li>
            </ul>
          </div>
        </aside>

        {/* ========================
            RESULTADOS
        ======================== */}
        <main className="filtro-results">
          <h2 className="results-title">Resultados</h2>

          <ul className="products-grid products-grid--filters">
            {loading ? (
              <p>Cargando productos...</p>
            ) : paginatedProducts.length === 0 ? (
              <p>No se encontraron productos</p>
            ) : (
              paginatedProducts.map((p) => (
                <li key={p.id} className="products-grid-item">
                  <Product product={p} mode="public" />
                </li>
              ))
            )}
          </ul>

          {/* Botón VER MÁS (40 en 40) */}
          {!loading && filteredProducts.length > visibleCount && (
            <div className="filtro-ver-mas-wrapper">
              <button
                type="button"
                className="filtro-ver-mas-button"
                onClick={() => setVisibleCount((prev) => prev + 40)}
              >
                Ver más
              </button>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
