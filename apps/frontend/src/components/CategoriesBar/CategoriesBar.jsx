import "./CategoriesBar.css";
import { useState } from "react";
import CategoriesPanel from "../CategoriesPanel/CategoriesPanel";

export default function CategoriesBar() {
  const [open, setOpen] = useState(false);

  const categories = [
    "Tecnología",
    "Hogar",
    "Deportes",
    "Moda",
    "Coleccionismo",
    "Arte",
    "Marcostas",
    "Bricolaje",
    "Electrodomésticos",
  ];

  return (
    <>
      <div className="category-bar">
        {/* BOTÓN HAMBURGUESA */}
        <button className="menu-btn" onClick={() => setOpen(true)}>
            <div class="cat-hamburger">
                <span className="hamb-line"></span>
                <span className="hamb-line"></span>
                <span className="hamb-line"></span>
            </div>
          <span className="menu-text">Todos los productos</span>
        </button>

        {/* CATEGORÍAS */}
        <div className="cat-links">
          {categories.map((c) => (
            <a key={c} href="#" className="cat-item">
              {c}
            </a>
          ))}
        </div>
      </div>

      <CategoriesPanel open={open} setOpen={setOpen} />
    </>
  );
}
