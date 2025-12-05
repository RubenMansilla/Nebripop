import React, { useState, useRef, useEffect, useContext } from "react";
import "./FormularioProducto.css";

import Fotos from "./Fotos";
import Categoria from "./Categoria";
import DetallesProducto from "./DetallesProducto";
import DetallesProductoGenerico from "./DetallesProductoGenerico";
import OpcionesEnvio from "./OpcionesEnvio";
import ZonaVenta from "./ZonaVenta";

import { AuthContext } from "../../context/AuthContext";
import { createProduct } from "../../api/products.api";

export default function FormularioProducto() {
  const { token } = useContext(AuthContext);

  // =======================
  // ESTADOS DEL FORMULARIO
  // =======================
  const [summary, setSummary] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);
  const [details, setDetails] = useState<any>({});
  const [shipping, setShipping] = useState<any>({});
  const [zone, setZone] = useState<any>({});

  // ============================================
  // MAPAS PARA CONVERTIR NOMBRE → ID REAL
  // ============================================
  const categoryMap: Record<string, number> = {
    "Hogar y jardín": 1,
    "Bricolaje": 2,
    "Deporte y ocio": 3,
    "Industria y agricultura": 4,
    "Motos": 5,
    "Motor y accesorios": 6,
    "Moda y accesorios": 7,
    "Tecnología y electrónica": 8,
    "Mascotas": 9,
    "Electrodomésticos": 10,
  };

  const subcategoryMap: Record<string, number> = {
    "Muebles": 1,
    "Decoración": 2,
    "Cocina": 3,
    "Baño": 4,
    "Jardín": 5,

    "Taladros": 6,
    "Pintura": 7,
    "Tornillería": 8,
    "Sierras": 9,
    "Herramientas": 10,

    "Fitness": 11,
    "Ciclismo": 12,
    "Fútbol": 13,
    "Running": 14,
    "Otros deportes": 15,

    "Maquinaria": 16,
    "Suministros": 17,
    "Materiales": 18,
    "Seguridad": 19,
    "Otros": 20,

    "Casco": 21,
    "Piezas (Moto)": 22,
    "Accesorios (Moto)": 23,
    "Ropa Moto": 24,
    "Scooters": 25,

    "Piezas": 26,
    "Neumáticos": 27,
    "Audio coche": 28,
    "Luces": 29,
    "Averías": 30,

    "Hombre": 31,
    "Mujer": 32,
    "Calzado": 33,
    "Bolsos": 34,
    "Accesorios": 35,

    "Móviles": 36,
    "Portátiles": 37,
    "Auriculares": 38,
    "Consolas": 39,
    "Televisores": 40,

    "Perros": 41,
    "Gatos": 42,
    "Aves": 43,
    "Reptiles": 44,
    "Roedores": 45,

    "Cocina (Electrodomésticos)": 46,
    "Limpieza": 47,
    "Climatización": 48,
    "Baño (Electrodomésticos)": 49,
    "Pequeños": 50,
  };

  // ======================
  // FLUJO DE PANTALLAS
  // ======================
  const [showFotos, setShowFotos] = useState(false);
  const [showCategoria, setShowCategoria] = useState(false);
  const [showDetalles, setShowDetalles] = useState<false | "hogar" | "generico">(false);

  const fotosRef = useRef<HTMLDivElement | null>(null);
  const categoriaRef = useRef<HTMLDivElement | null>(null);
  const detallesRef = useRef<HTMLDivElement | null>(null);

  const scrollTo = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  useEffect(() => { if (showFotos) scrollTo(fotosRef); }, [showFotos]);
  useEffect(() => { if (showCategoria) scrollTo(categoriaRef); }, [showCategoria]);
  useEffect(() => { if (showDetalles) scrollTo(detallesRef); }, [showDetalles]);


  // ===============================
  // PUBLICAR PRODUCTO AL BACKEND
  // ===============================
  const handlePublish = async () => {
    if (!token) {
      alert("Inicia sesión para publicar un producto.");
      return;
    }

    const body = {
      summary,
      ...details,
      category_id: categoryId,
      subcategory_id: subcategoryId,
      ...shipping,
      ...zone,
    };

    console.log("BODY ENVIADO:", body);

    try {
      const res = await createProduct(body, images, token);
      console.log("Producto creado:", res);
      alert("Producto publicado con éxito 🎉");
    } catch (error) {
      console.error(error);
      alert("Error al publicar el producto");
    }
  };


  // ===============================
  // RENDER
  // ===============================
  return (
    <div className="formulario-wrapper">

      {/* PASO 1 — RESUMEN */}
      <div className="bloque">
        <h2 className="section-title">Información del producto</h2>

        <label className="input-label">Resumen del producto</label>
        <textarea
          className="input-textarea"
          placeholder="Ej: Sofá beige en buen estado…"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        <button className="continue-btn" onClick={() => setShowFotos(true)}>
          Continuar
        </button>
      </div>

      {/* PASO 2 — FOTOS */}
      {showFotos && (
        <div ref={fotosRef} className="bloque">
          <Fotos
            onContinue={(imgs: File[]) => {
              setImages(imgs);
              setShowCategoria(true);
            }}
          />
        </div>
      )}

      {/* PASO 3 — CATEGORÍA */}
      {showCategoria && (
        <div ref={categoriaRef} className="bloque">
          <Categoria
            onSelect={(data) => {
              setCategoryId(categoryMap[data.categoria]);           // ID real
              setSubcategoryId(subcategoryMap[data.subcategoria]);  // ID real
              setShowDetalles(data.tipoFormulario);
            }}
          />
        </div>
      )}

      {/* PASO 4 — DETALLES */}
      {showDetalles === "hogar" && (
        <div ref={detallesRef} className="bloque">
          <DetallesProducto onChange={(data: any) => setDetails(data)} />
        </div>
      )}

      {showDetalles === "generico" && (
        <div ref={detallesRef} className="bloque">
          <DetallesProductoGenerico onChange={(data: any) => setDetails(data)} />
        </div>
      )}

      {/* PASO 5 — ENVÍO */}
      {showDetalles && (
        <div className="bloque">
          <OpcionesEnvio onChange={(data: any) => setShipping(data)} />
        </div>
      )}

      {/* PASO 6 — ZONA */}
      {showDetalles && (
        <div className="bloque">
          <ZonaVenta onChange={(data: any) => setZone(data)} />
        </div>
      )}

      {/* BOTÓN FINAL */}
      {showDetalles && (
        <div className="bloque publicar-container">
          <button className="publicar-btn" onClick={handlePublish}>
            Publicar producto
          </button>
        </div>
      )}
    </div>
  );
}
