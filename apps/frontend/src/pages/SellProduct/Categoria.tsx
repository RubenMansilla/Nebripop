import { useState } from "react";
import "./FormularioProducto.css";

interface Props {
  onSelect: (data: {
    categoria: string;
    subcategoria: string;
    tipoFormulario: "hogar" | "generico";
  }) => void;
}

export default function Categoria({ onSelect }: Props) {
  const categorias: Record<string, string[]> = {
    "Hogar y jardín": ["Muebles", "Decoración", "Cocina", "Baño", "Jardín"],
    "Bricolaje": ["Taladros", "Pintura", "Tornillería", "Sierras", "Herramientas"],
    "Deporte y ocio": ["Fitness", "Ciclismo", "Fútbol", "Running", "Otros deportes"],
    "Industria y agricultura": ["Maquinaria", "Suministros", "Materiales", "Seguridad", "Otros"],
    "Motos": ["Casco", "Piezas", "Accesorios", "Ropa Moto", "Scooters"],
    "Motor y accesorios": ["Piezas", "Neumáticos", "Audio coche", "Luces", "Averías"],
    "Moda y accesorios": ["Hombre", "Mujer", "Calzado", "Bolsos", "Accesorios"],
    "Tecnología y electrónica": ["Móviles", "Portátiles", "Auriculares", "Consolas", "Televisores"],
    "Mascotas": ["Perros", "Gatos", "Aves", "Reptiles", "Roedores"],
    "Electrodomésticos": ["Cocina", "Limpieza", "Climatización", "Baño", "Pequeños"],
  };

  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ cat: string; sub: string } | null>(null);

  const selectFinal = (cat: string, sub: string) => {
    setSelected({ cat, sub });

    const tipoFormulario =
      cat === "Hogar y jardín" || cat === "Bricolaje" ? "hogar" : "generico";

    onSelect({
      categoria: cat,
      subcategoria: sub,
      tipoFormulario,
    });

    setIsOpen(false);
    setActiveCategory(null);
  };

  return (
    <div className="categoria-container">
      <label className="input-label">Categoría y subcategoría</label>

      <div className="categoria-selector" onClick={() => setIsOpen(!isOpen)}>
        <div className="categoria-selector-text">
          {selected ? `${selected.cat} · ${selected.sub}` : "Selecciona una categoría..."}
        </div>
        <span className={`categoria-selector-arrow ${isOpen ? "open" : ""}`}>
          ▾
        </span>
      </div>

      {isOpen && (
        <div className="categoria-panel">
          {!activeCategory && (
            <>
              <div className="categoria-panel-section-title">Todas las categorías</div>

              {Object.keys(categorias).map((cat) => (
                <button
                  key={cat}
                  className="categoria-item"
                  onClick={() => setActiveCategory(cat)}
                >
                  <span className="categoria-text">{cat}</span>
                  <span className="categoria-arrow">›</span>
                </button>
              ))}
            </>
          )}

          {activeCategory && (
            <>
              <button className="categoria-back" onClick={() => setActiveCategory(null)}>
                ← Volver
              </button>

              <div className="categoria-panel-section-title">{activeCategory}</div>

              {categorias[activeCategory].map((sub) => (
                <button
                  key={sub}
                  className="categoria-item"
                  onClick={() => selectFinal(activeCategory, sub)}
                >
                  <span className="categoria-text">{sub}</span>
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
