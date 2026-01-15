import { useState, useEffect } from "react";
import "./FormularioProducto.css";
import shippingToggleOn from "../../assets/logos/shipping-toggle-on.png";
import shirtIcon from "../../assets/iconos/shirt.svg";
import bikeIcon from "../../assets/iconos/bike.svg";



interface Props {
  onChange: (data: any) => void;
}

export default function OpcionesEnvio({ onChange }: Props) {
  const [envioActivo, setEnvioActivo] = useState(false);
  const [tamano, setTamano] = useState("");
  const [peso, setPeso] = useState("");

  useEffect(() => {
    onChange({
      shipping_active: envioActivo,
      shipping_size: tamano,
      shipping_weight: peso,
    });
  }, [envioActivo, tamano, peso]);

  const pesos = [
    "0 a 1 kg",
    "1 a 2 kg",
    "2 a 5 kg",
    "5 a 10 kg",
    "10 a 20 kg",
    "20 a 30 kg"
  ];
  return (
    <div className="envio-container">

      <h2 className="section-title">Opciones de envío</h2>

      {/* Texto + Imagen */}
      <div className="envio-header">
        <ul className="envio-beneficios">
          <li>✔ Vende más rápido.</li>
          <li>✔ Sin necesidad de quedar con nadie.</li>
          <li>✔ Es gratis. Todo lo que ganes, para ti.</li>
          <li>
            ✔ Tus ventas están protegidas por{" "}
            <a href="#" className="envio-link">Protección Nebripop</a>.
          </li>
        </ul>
<img
  src={shippingToggleOn}
  className="envio-img"
  alt="envio"
/>

      </div>

      <a className="envio-faq" href="#">¿Dudas? Consulta las preguntas frecuentes</a>

      <hr className="envio-divider" />

      {/* Activar */}
      <div className="envio-toggle-row">
        <span>Activar envío</span>
        <label className="switch">
          <input 
            type="checkbox" 
            checked={envioActivo}
            onChange={() => setEnvioActivo(!envioActivo)}
          />
          <span className="slider"></span>
        </label>
      </div>

      {envioActivo && (
        <>
          {/* Tamaño */}
          <h3 className="envio-title">Tamaño del producto</h3>
          <p className="envio-description">
            Según el tamaño del producto las opciones de envío pueden cambiar.
            <br />
            <a className="tamano-link" href="#">¿Qué tamaño debería elegir?</a>
          </p>

          {/* Estándar */}
          <label className="envio-option">
            <div className="envio-option-left">
             <img
  src={shirtIcon}
  className="option-icon"
  alt="estándar"
/>

              <span>
                <strong>Estándar:</strong> productos pequeños y medianos.
              </span>
            </div>

            <input 
              type="radio"
              checked={tamano === "estandar"}
              onChange={() => setTamano("estandar")}
            />
          </label>

          <hr className="envio-separator" />

          {/* Voluminoso */}
          <label className="envio-option">
            <div className="envio-option-left">
              <img
  src={bikeIcon}
  className="option-icon"
  alt="voluminoso"
/>

              <span>
                <strong>Voluminoso:</strong> productos grandes o pesados.
                <span className="nuevo-badge">NUEVO</span>
              </span>
            </div>

            <input 
              type="radio"
              checked={tamano === "voluminoso"}
              onChange={() => setTamano("voluminoso")}
            />
          </label>

          {/* Peso */}
          <h3 className="envio-title">¿Cuánto pesa?</h3>
          <p className="envio-description">
            Elige el tramo de peso correspondiente a tu producto. Ten en cuenta
            el peso del envoltorio.
          </p>

          <div className="peso-list">
            {pesos.map((p) => (
              <label key={p} className="peso-row">
                <span>{p}</span>
                <input
                  type="radio"
                  checked={peso === p}
                  onChange={() => setPeso(p)}
                />
              </label>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
