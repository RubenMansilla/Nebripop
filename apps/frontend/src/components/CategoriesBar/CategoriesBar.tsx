import "./CategoriesBar.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoriesPanel from "../CategoriesPanel/CategoriesPanel";

export default function CategoriesBar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "Tecnología",
    "Hogar",
    "Deportes",
    "Moda",
    "Coleccionismo",
    "Mascotas",
    "Bricolaje",
    "Electrodomésticos",
  ];

  const goToFilters = () => {
    navigate("/filtros"); // ✅ endpoint correcto
  };

  return (
    <>
      <div className="category-block-container">
        <div className="category-bar">
          {/* BOTÓN HAMBURGUESA */}
          <button className="menu-btn" onClick={() => setOpen(true)}>
            <div className="cat-hamburger">
              <span className="hamb-line"></span>
              <span className="hamb-line"></span>
              <span className="hamb-line"></span>
            </div>
            <span className="menu-text">Todos los productos</span>
          </button>

          {/* CATEGORÍAS */}
          <div className="cat-links">
            {categories.map((c) => (
              <a
                key={c}
                href="#"
                className="cat-item"
                onClick={(e) => {
                  e.preventDefault();
                  goToFilters();
                }}
              >
                {c}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CategoriesPanel open={open} setOpen={setOpen} />
    </>
  );
}
