import { useEffect, useState } from "react";
import "./FormularioProducto.css";
import { getCategories } from "../../api/categories.api";
import { getSubcategoriesByCategory } from "../../api/subcategories.api";

/* =========================
   TIPOS
========================= */
interface Category {
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface Props {
  onSelect: (data: {
    categoryId: number;
    subcategoryId: number;
    tipoFormulario: "hogar" | "generico";
  }) => void;
}

/* =========================
   COMPONENTE
========================= */
export default function Categoria({ onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // ⬇️ YA EXISTÍA (lo dejamos)
  const [selected, setSelected] = useState<{
    categoryName: string;
    subcategoryName: string;
  } | null>(null);

  // ✅ AÑADIDO: estado REAL con IDs (NO BORRA NADA)
  const [selectedIds, setSelectedIds] = useState<{
    categoryId: number;
    subcategoryId: number;
    tipoFormulario: "hogar" | "generico";
  } | null>(null);

  /* =========================
     CARGAR CATEGORÍAS
  ========================= */
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => {
        console.error("Error cargando categorías:", err);
      });
  }, []);

  /* =========================
     CARGAR SUBCATEGORÍAS
  ========================= */
  useEffect(() => {
    if (!activeCategory) {
      setSubcategories([]);
      return;
    }

    getSubcategoriesByCategory(activeCategory.id)
      .then(setSubcategories)
      .catch((err) => {
        console.error("Error cargando subcategorías:", err);
      });
  }, [activeCategory]);

  /* =========================
     EMITIR SELECCIÓN AL PADRE (A PRUEBA DE ERRORES)
     🔥 ESTO ES LO QUE TE FALTABA
  ========================= */
  useEffect(() => {
    if (selectedIds) {
      onSelect(selectedIds);
    }
  }, [selectedIds, onSelect]);

  /* =========================
     SELECCIÓN FINAL
  ========================= */
  const selectFinal = (sub: Subcategory) => {
    if (!activeCategory) return;

    const tipoFormulario =
      activeCategory.name === "Hogar y jardín" ||
      activeCategory.name === "Bricolaje"
        ? "hogar"
        : "generico";

    // ⬇️ VISUAL (YA EXISTÍA)
    setSelected({
      categoryName: activeCategory.name,
      subcategoryName: sub.name,
    });

    // ✅ ESTADO REAL CON IDS (NUEVO)
    setSelectedIds({
      categoryId: activeCategory.id,
      subcategoryId: sub.id,
      tipoFormulario,
    });

    setIsOpen(false);
    setActiveCategory(null);
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="categoria-container">
      <label className="input-label">Categoría y subcategoría</label>

      {/* SELECTOR */}
      <div
        className="categoria-selector"
        onClick={() => setIsOpen(true)}
      >
        <div className="categoria-selector-text">
          {selected
            ? `${selected.categoryName} · ${selected.subcategoryName}`
            : "Selecciona una categoría..."}
        </div>
        <span className={`categoria-selector-arrow ${isOpen ? "open" : ""}`}>
          ▾
        </span>
      </div>

      {/* PANEL */}
      {isOpen && (
        <div className="categoria-panel" onClick={(e) => e.stopPropagation()}>
          {!activeCategory && (
            <>
              <div className="categoria-panel-section-title">
                Todas las categorías
              </div>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className="categoria-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCategory(cat);
                  }}
                >
                  <span className="categoria-text">{cat.name}</span>
                  <span className="categoria-arrow">›</span>
                </button>
              ))}
            </>
          )}

          {activeCategory && (
            <>
              <button
                type="button"
                className="categoria-back"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveCategory(null);
                }}
              >
                ← Volver
              </button>

              <div className="categoria-panel-section-title">
                {activeCategory.name}
              </div>

              {subcategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  className="categoria-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectFinal(sub);
                  }}
                >
                  <span className="categoria-text">{sub.name}</span>
                  <span className="categoria-arrow">›</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
