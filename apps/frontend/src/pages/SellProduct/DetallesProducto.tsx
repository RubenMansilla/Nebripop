import { useState, useEffect } from "react";
import "./FormularioProducto.css";

interface Props {
  onChange: (data: any) => void;
}

export default function DetallesProducto({ onChange }: Props) {
  const [brand, setBrand] = useState("");
  const [color, setColor] = useState("");
  const [material, setMaterial] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [width, setWidth] = useState("");
  const [depth, setDepth] = useState("");
  const [height, setHeight] = useState("");
  const [condition, setCondition] = useState("Usado"); // 👈 AQUI

  useEffect(() => {
    onChange({
      brand,
      color,
      material,
      name: titulo,
      description: descripcion,
      price: precio,
      width_cm: width,
      height_cm: height,
      depth_cm: depth,
      condition, // 👈 AQUI
    });
  }, [brand, color, material, titulo, descripcion, precio, width, depth, height, condition]);

  return (
    <div className="detalles-container">
      <h2 className="detalles-title">Información del producto</h2>

      <div className="detalles-row-2">
        <div className="detalles-input">
          <label>Marca*</label>
          <input placeholder="Escribe la marca" value={brand} onChange={(e) => setBrand(e.target.value)} />
        </div>

        <div className="detalles-input">
          <label>Color*</label>
          <input placeholder="Escribe el color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
      </div>

      <div className="detalles-input">
        <label>Material*</label>
        <input placeholder="Ej: Madera, metal..." value={material} onChange={(e) => setMaterial(e.target.value)} />
      </div>

      <div className="detalles-input">
        <label>Título*</label>
        <input maxLength={50} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <span className="contador">{titulo.length}/50</span>
      </div>

      <div className="detalles-textarea">
        <label>Descripción*</label>
        <textarea maxLength={640} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <span className="contador">{descripcion.length}/640</span>
      </div>

      <div className="detalles-input">
        <label>Precio (€)*</label>
        <input type="number" min={0} value={precio} onChange={(e) => setPrecio(e.target.value)} />
      </div>

      {/* SELECTOR DE CONDICIÓN */}
      <div className="detalles-input">
        <label>Condición*</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="Nuevo">Nuevo</option>
          <option value="Como nuevo">Como nuevo</option>
          <option value="Usado">Usado</option>
          <option value="En buen estado">En buen estado</option>
          <option value="Con señales de uso">Con señales de uso</option>
        </select>
      </div>

      <h3 className="detalles-subtitle">Medidas</h3>

      <div className="detalles-row-3">
        <input placeholder="Ancho (cm)" value={width} onChange={(e) => setWidth(e.target.value)} />
        <input placeholder="Fondo (cm)" value={depth} onChange={(e) => setDepth(e.target.value)} />
        <input placeholder="Alto (cm)" value={height} onChange={(e) => setHeight(e.target.value)} />
      </div>
    </div>
  );
}
