import { useEffect, useState } from "react";
import "./FormularioProducto.css";

interface Props {
  onChange: (data: any) => void;
}

export default function ZonaVenta({ onChange }: Props) {
  const [codigoPostal, setCodigoPostal] = useState("");
  const [coords, setCoords] = useState<[number, number]>([40.4167, -3.7037]);
  const [mapUrl, setMapUrl] = useState("");

  const buscar = async (cp: string) => {
    if (cp.length < 4) return;

    const url = `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=Spain&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      setCoords([lat, lon]);

      const delta = 0.01;
      setMapUrl(
        `https://www.openstreetmap.org/export/embed.html?bbox=${lon-delta}%2C${lat-delta}%2C${lon+delta}%2C${lat+delta}&layer=mapnik&marker=${lat}%2C${lon}`
      );

      onChange({
        postal_code: cp,
        latitude: lat,
        longitude: lon,
      });
    }
  };

  useEffect(() => {
    buscar(codigoPostal);
  }, [codigoPostal]);

  return (
    <div className="zona-container">
      <h2 className="section-title">Zona de venta</h2>

      <label>Código postal</label>
      <input
        type="text"
        className="zona-input"
        placeholder="Ej: 28001"
        value={codigoPostal}
        onChange={(e) => setCodigoPostal(e.target.value)}
      />

      <div className="zona-map-box">
        <iframe
          src={mapUrl}
          style={{
            width: "100%",
            height: "260px",
            border: "0",
            borderRadius: "12px",
          }}
        ></iframe>
      </div>
    </div>
  );
}
