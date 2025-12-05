import { useState, ChangeEvent } from "react";
import "./FormularioProducto.css";

interface Props {
  onContinue: (files: File[]) => void;
}

export default function Fotos({ onContinue }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const handleSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  return (
    <div className="fotos-container">
      <h2>Fotos</h2>

      <div className="dropzone">
        <input type="file" multiple onChange={handleSelect} />
      </div>

      <button
        className="continue-btn"
        onClick={() => onContinue(files)}
      >
        Continuar
      </button>
    </div>
  );
}
