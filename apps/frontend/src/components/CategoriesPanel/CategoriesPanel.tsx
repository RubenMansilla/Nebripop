import "./CategoriesPanel.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../api/categories.api";
import type { Category as ApiCategory } from "../../api/categories.api";

import { getCategoryIcon } from "../../utils/categoryIcons";

// Extendemos lo que viene de la API por si más adelante añades campos
type Category = ApiCategory & {
  hijos?: boolean;
};

type CategoriesPanelProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

const getIconForCategory = (cat: Category) => getCategoryIcon(cat.name);

export default function CategoriesPanel({ open, setOpen }: CategoriesPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const closeEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeEsc);

    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data as Category[]);
      } catch (err) {
        console.error(err);
        const msg =
          err instanceof Error
            ? err.message
            : "Error desconocido al cargar categorías";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();

    return () => {
      window.removeEventListener("keydown", closeEsc);
    };
  }, [setOpen]);

  const handleCategoryClick = (cat: Category) => {
    navigate(`/filtros?categoryId=${cat.id}`);
    setOpen(false);
  };

  return (
    <>
      <div
        className={`overlay ${open ? "open" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`side-panel ${open ? "open" : ""}`}>
        <header className="panel-header">
          <h2>Categorías</h2>
          <button className="close-btn" onClick={() => setOpen(false)}>
            ✕
          </button>
        </header>

        <div className="panel-list">
          {loading && <p className="panel-info">Cargando categorías...</p>}

          {error && !loading && (
            <p className="panel-error">
              {error} — inténtalo de nuevo más tarde.
            </p>
          )}

          {!loading && !error && categories.length === 0 && (
            <p className="panel-info">No hay categorías disponibles.</p>
          )}

          {!loading &&
            !error &&
            categories.map((cat) => {
              const iconSrc = getIconForCategory(cat);

              return (
                <a
                  key={cat.id}
                  href="#"
                  className="panel-item"
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(cat);
                  }}
                >
                  <div className="left">
                    {iconSrc && (
                      <span className="cat-icon">
                        <img src={iconSrc} alt={cat.name} />
                      </span>
                    )}
                    <span className="title">{cat.name}</span>
                  </div>

                  <div className="right">
                    {cat.hijos && (
                      <span className="badge">Subcategorías</span>
                    )}
                  </div>
                </a>
              );
            })}
        </div>
      </aside>
    </>
  );
}
