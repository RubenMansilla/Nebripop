import { useState, useEffect } from "react";
import "./FormularioProducto.css";

interface Props {
  onChange: (data: any) => void;
}

export default function DetallesProductoGenerico({ onChange }: Props) {
  const [titulo, setTitulo] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [precio, setPrecio] = useState<string>("");
  const [estado, setEstado] = useState<string>("");

  useEffect(() => {
    onChange({
      name: titulo,
      description: descripcion,
      price: precio,
      condition: estado,
    });
  }, [titulo, descripcion, precio, estado]);

  return (
    <div className="detalles-container">
      <h2 className="detalles-title">Información del producto</h2>

      {/* TÍTULO */}
      <div className="detalles-input">
        <label>Título*</label>
        <input
          maxLength={50}
          placeholder="Escribe un título"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <span className="contador">{titulo.length}/50</span>
      </div>

      {/* DESCRIPCIÓN */}
      <div className="detalles-textarea">
        <label>Descripción*</label>
        <textarea
          maxLength={640}
          placeholder="Describe el producto…"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <span className="contador">{descripcion.length}/640</span>
      </div>

      {/* ESTADO */}
      <div className="detalles-select">
        <label>Estado*</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="">Seleccionar estado</option>
          <option value="Nuevo">Nuevo</option>
          <option value="Semi-nuevo">Semi-nuevo</option>
          <option value="Usado">Usado</option>
          <option value="Condiciones aceptables">Condiciones aceptables</option>
          <option value="Muy usado">Muy usado</option>
        </select>
      </div>

      {/* PRECIO */}
      <div className="detalles-precio">
        <label>Precio*</label>

        <div className={`precio-box ${precio === "" ? "error" : ""}`}>
          <span>€</span>
          <input
            type="number"
            min={0}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
          />
          {precio === "" && <span className="error-icon">!</span>}
        </div>

        {precio === "" && (
          <small className="obligatorio-texto">Campo obligatorio</small>
        )}
      </div>
    </div>
  );
}
