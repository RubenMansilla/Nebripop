import "./CategoriesPanel.css";
import { useEffect } from "react";

export default function CategoriesPanel({ open, setOpen }) {
  const categories = [
    { id: "all", name: "Ver todo", icon: "grid" },
    { id: "coches", name: "Coches", icon: "car" },
    { id: "motos", name: "Motos", icon: "bike" },
    { id: "moda", name: "Moda y accesorios", icon: "shirt", hijos: true },
    { id: "hogar", name: "Hogar y jardín", icon: "home", hijos: true },
    { id: "tech", name: "Tecnología", icon: "chip" },
    { id: "movil", name: "Móviles y Telefonía", icon: "phone" },
    { id: "info", name: "Informática", icon: "monitor" },
  ];

  useEffect(() => {
    const closeEsc = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeEsc);
    return () => window.removeEventListener("keydown", closeEsc);
  }, []);

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
          {categories.map((cat) => (
            <a key={cat.id} href="#" className="panel-item">
              <div className="left">
                <span className="icon">{cat.icon}</span>
                <span className="title">{cat.name}</span>
              </div>

              <div className="right">
                {cat.hijos && <span className="badge">Subcategorías</span>}
              </div>
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
