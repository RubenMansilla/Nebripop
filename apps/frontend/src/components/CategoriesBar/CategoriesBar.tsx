import "./CategoriesBar.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CategoriesPanel from "../CategoriesPanel/CategoriesPanel";
import { getCategories } from "../../api/categories.api";
import type { Category } from "../../api/categories.api";

export default function CategoriesBar() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategories();
        // Filter or limit if needed, or just show first few
        setCategories(data.slice(0, 8));
      } catch (error) {
        console.error("Error fetching categories for bar:", error);
      }
    };
    fetchCats();
  }, []);

  const goToFilters = (categoryId?: number) => {
    if (categoryId) {
      navigate(`/filtros?categoryId=${categoryId}`);
    } else {
      navigate("/filtros");
    }
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
            {categories.map((cat) => (
              <a
                key={cat.id}
                href="#"
                className="cat-item"
                onClick={(e) => {
                  e.preventDefault();
                  goToFilters(cat.id);
                }}
              >
                {cat.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <CategoriesPanel open={open} setOpen={setOpen} />
    </>
  );
}
