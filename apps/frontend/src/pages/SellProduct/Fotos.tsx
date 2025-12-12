import { useState } from "react";
import type { ChangeEvent } from "react";
import imageCompression from "browser-image-compression";
import "./FormularioProducto.css";

interface Props {
  onContinue: (files: File[]) => void;
  showToast: (msg: string) => void;
}

export default function Fotos({ onContinue, showToast }: Props) {
  const [files, setFiles] = useState<File[]>([]);

  const MAX_FILES = 6;
  const MAX_SIZE_MB = 50;

  const handleSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (!selected.length) return;

    // Validar tamaño original
    for (const file of selected) {
      if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
        showToast(`El archivo ${file.name} supera los ${MAX_SIZE_MB} MB.`);
        return;
      }
    }

    // Validar límite numérico
    if (files.length + selected.length > MAX_FILES) {
      showToast(`Solo puedes subir un máximo de ${MAX_FILES} fotos.`);
      return;
    }

    const compressedFiles: File[] = [];

    for (const file of selected) {
      const options = {
        maxSizeMB: 1.5,            // Mejor calidad para productos
        maxWidthOrHeight: 1600,    // Mejor resolución para productos
        useWebWorker: true,
      };

      try {
        const compressedBlob = await imageCompression(file, options);

        const compressedFile = new File([compressedBlob], file.name, { type: file.type });

        compressedFiles.push(compressedFile);
      } catch (err) {
        console.error("Error al comprimir una imagen:", err);
        showToast("Error al procesar una de las imágenes.");
        return;
      }
    }

    setFiles(prev => [...prev, ...compressedFiles]);
  };


  const removeImage = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fotos-container">
      {/* DROPZONE */}
      <div className="dropzone">
        <div className="dropzone-inner">
          <span className="upload-btn">Subir fotos</span>
          <span className="dropzone-text">Arrastra tus fotos aquí</span>
          <p className="dropzone-info">
            Formatos aceptados: JPEG, PNG y WebP. Tamaño máx: 50 MB por archivo. Máx: 6 fotos.
          </p>
        </div>

        {/* Input real, invisible pero cubriendo la zona */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleSelect}
          className="hidden-input"
        />
      </div>

      {/* GRID PREVIEW 2x3 ESTILO WALLAPOP */}
      <div className="preview-grid">
        {files.map((file, i) => (
          <div key={i} className="preview-box">
            <img
              src={URL.createObjectURL(file)}
              alt={`preview-${i}`}
              className="preview-img"
            />
            <button
              type="button"
              className="delete-btn"
              onClick={() => removeImage(i)}
            >
              ✕
            </button>
          </div>
        ))}

        {/* Huecos vacíos hasta 6, solo estética */}
        {Array.from({ length: Math.max(0, MAX_FILES - files.length) }).map(
          (_, i) => (
            <div key={`empty-${i}`} className="preview-placeholder" />
          )
        )}
      </div>

      {/* BOTÓN CONTINUAR */}
      <button
        type="button"
        className="continue-btn"
        onClick={() => {
          if (files.length === 0) {
            showToast("Debes subir al menos una foto.");
            return;
          }
          onContinue(files);
        }}
      >
        Continuar
      </button>
    </div>
  );
}
