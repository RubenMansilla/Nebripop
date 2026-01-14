// apps/frontend/src/pages/EditProduct/EditProduct.tsx
import "./EditProduct.css";
import "../SellProduct/FormularioProducto.css";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "../../components/Navbar/Navbar";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";

import {
  getProductById,
  updateProduct,
  deleteProductImage,
} from "../../api/products.api";
import type { ProductType } from "../../types/product";
import { toast } from "react-toastify";

import { getCategories } from "../../api/categories.api";
import { getSubcategoriesByCategory } from "../../api/subcategories.api";

import shippingToggleOn from "../../assets/logos/shipping-toggle-on.png";
import shirtIcon from "../../assets/iconos/shirt.svg";
import bikeIcon from "../../assets/iconos/bike.svg";

import imageCompression from "browser-image-compression";

interface FormState {
  summary: string;
  name: string;
  description: string;
  price: string;
  condition: string;
  brand: string;
  color: string;
  material: string;
  width_cm: string;
  height_cm: string;
  depth_cm: string;
  category_id: string;
  subcategory_id: string;
  shipping_active: boolean;
  shipping_size: string;
  shipping_weight: string;
  postal_code: string;
  latitude: string;
  longitude: string;
}

type TipoFormulario = "hogar" | "generico";

export default function EditProductPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [form, setForm] = useState<FormState | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);

  const [tipoFormulario, setTipoFormulario] =
    useState<TipoFormulario>("generico");

  // Para saber si han cambiado categoría / subcategoría
  const [initialCategoryId, setInitialCategoryId] = useState<string | null>(
    null
  );
  const [initialSubcategoryId, setInitialSubcategoryId] = useState<
    string | null
  >(null);

  // ENVÍO
  const [envioActivo, setEnvioActivo] = useState(false);
  const [tamanoEnvio, setTamanoEnvio] = useState("");
  const [pesoEnvio, setPesoEnvio] = useState("");

  const TRAMOS_PESO = [
    "0 a 1 kg",
    "1 a 2 kg",
    "2 a 5 kg",
    "5 a 10 kg",
    "10 a 20 kg",
    "20 a 30 kg",
  ];

  // ZONA / MAPA
  const [codigoPostal, setCodigoPostal] = useState("");
  const [coords, setCoords] = useState<[number, number]>([40.4167, -3.7037]);
  const [mapUrl, setMapUrl] = useState("");

  const [newImages, setNewImages] = useState<File[]>([]);

  const MAX_FILES = 6;
  const MAX_SIZE_MB = 50;

  // =========================
  // BUSCAR COORDS POR CP
  // =========================
  const buscarCoordsPorCP = async (cp: string) => {
    if (cp.length < 4) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?postalcode=${cp}&country=Spain&format=json`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);

        setCoords([lat, lon]);

        const delta = 0.01;
        const urlMapa = `https://www.openstreetmap.org/export/embed.html?bbox=${
          lon - delta
        }%2C${lat - delta}%2C${lon + delta}%2C${
          lat + delta
        }&layer=mapnik&marker=${lat}%2C${lon}`;
        setMapUrl(urlMapa);

        setForm((prev) =>
          prev
            ? {
                ...prev,
                postal_code: cp,
                latitude: String(lat),
                longitude: String(lon),
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Error buscando coords por CP:", err);
    }
  };

  // =========================
  // CARGAR PRODUCTO
  // =========================
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        const data: ProductType = await getProductById(productId);
        setProduct(data);

        const initialForm: FormState = {
          summary: data.summary ?? "",
          name: data.name ?? "",
          description: data.description ?? "",
          price: data.price != null ? String(data.price) : "",
          condition: data.condition ?? "",
          brand: data.brand ?? "",
          color: data.color ?? "",
          material: data.material ?? "",
          width_cm: data.width_cm != null ? String(data.width_cm) : "",
          height_cm: data.height_cm != null ? String(data.height_cm) : "",
          depth_cm: data.depth_cm != null ? String(data.depth_cm) : "",
          category_id:
            data.category_id != null ? String(data.category_id) : "",
          subcategory_id:
            data.subcategory_id != null ? String(data.subcategory_id) : "",
          shipping_active: Boolean(data.shipping_active),
          shipping_size: data.shipping_size ?? "",
          shipping_weight:
            data.shipping_weight != null ? String(data.shipping_weight) : "",
          postal_code: data.postal_code ?? "",
          latitude: data.latitude != null ? String(data.latitude) : "",
          longitude: data.longitude != null ? String(data.longitude) : "",
        };

        setForm(initialForm);

        // Guardamos categoría y subcategoría iniciales
        setInitialCategoryId(initialForm.category_id || "");
        setInitialSubcategoryId(initialForm.subcategory_id || "");

        // ENVÍO
        setEnvioActivo(Boolean(data.shipping_active));
        setTamanoEnvio(data.shipping_size ?? "");
        setPesoEnvio(initialForm.shipping_weight);

        // ZONA
        setCodigoPostal(initialForm.postal_code || "");

        if (data.latitude != null && data.longitude != null) {
          const lat = Number(data.latitude);
          const lon = Number(data.longitude);
          setCoords([lat, lon]);
          const delta = 0.01;
          const urlMapa = `https://www.openstreetmap.org/export/embed.html?bbox=${
            lon - delta
          }%2C${lat - delta}%2C${lon + delta}%2C${
            lat + delta
          }&layer=mapnik&marker=${lat}%2C${lon}`;
          setMapUrl(urlMapa);
        } else if (initialForm.postal_code) {
          buscarCoordsPorCP(initialForm.postal_code);
        }
      } catch (error: any) {
        console.error(error);
        toast.error(
          error?.message || "No se pudo cargar el producto para editarlo"
        );
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  // =========================
  // CARGAR CATEGORÍAS
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar las categorías.");
      }
    };

    fetchCategories();
  }, []);

  // =========================
  // CARGAR SUBCATEGORÍAS
  // =========================
  useEffect(() => {
    const fetchSubcategories = async (categoryId: string) => {
      try {
        const data = await getSubcategoriesByCategory(Number(categoryId));
        setSubcategories(data);
      } catch (error) {
        console.error(error);
        toast.error("Error al cargar las subcategorías.");
      }
    };

    if (form?.category_id) {
      fetchSubcategories(form.category_id);
    }
  }, [form?.category_id]);

  // =========================
  // DETERMINAR TIPO FORMULARIO SEGÚN CATEGORÍA
  // =========================
  useEffect(() => {
    if (!form?.category_id || categories.length === 0) return;

    const cat = categories.find(
      (c) => String(c.id) === String(form.category_id)
    );
    if (!cat) return;

    const tipo: TipoFormulario =
      cat.name === "Hogar y jardín" || cat.name === "Bricolaje"
        ? "hogar"
        : "generico";

    setTipoFormulario(tipo);
  }, [form?.category_id, categories]);

  // =========================
  // HANDLERS GENERALES FORM
  // =========================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!form) return;
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // =========================
  // IMÁGENES NUEVAS
  // =========================
  const handleSelectImages = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (!selected.length) return;

    const existingCount = product?.images?.length || 0;

    // Validar tamaño original
    for (const file of selected) {
      if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
        toast.error(`El archivo ${file.name} supera los ${MAX_SIZE_MB} MB.`);
        return;
      }
    }

    // Validar límite numérico (existentes + nuevas)
    if (existingCount + newImages.length + selected.length > MAX_FILES) {
      toast.error(`Solo puedes tener un máximo de ${MAX_FILES} fotos en total.`);
      return;
    }

    const compressedFiles: File[] = [];

    for (const file of selected) {
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };

      try {
        const compressedBlob = await imageCompression(file, options);
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
        });
        compressedFiles.push(compressedFile);
      } catch (err) {
        console.error("Error al comprimir una imagen:", err);
        toast.error("Error al procesar una de las imágenes.");
        return;
      }
    }

    setNewImages((prev) => [...prev, ...compressedFiles]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // ELIMINAR IMAGEN EXISTENTE (se borra ya mismo, como lo tenías)
  // =========================
  const handleDeleteExistingImage = async (imageId: number) => {
    if (!product || !productId) return;

    try {
      await deleteProductImage(Number(productId), imageId);

      setProduct((prev) =>
        prev
          ? {
              ...prev,
              images:
                prev.images?.filter((img) => img.id !== imageId) || [],
            }
          : prev
      );

      toast.success("Imagen eliminada correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "No se pudo eliminar la imagen");
    }
  };

  // =========================
  // ENVÍO
  // =========================
  const handleToggleEnvio = () => {
    if (!form) return;
    const nuevoValor = !envioActivo;
    setEnvioActivo(nuevoValor);
    setForm({
      ...form,
      shipping_active: nuevoValor,
    });
  };

  const handleSelectTamano = (valor: "estandar" | "voluminoso") => {
    if (!form) return;
    setTamanoEnvio(valor);
    setForm({
      ...form,
      shipping_size: valor,
    });
  };

  const handleSelectPeso = (valor: string) => {
    if (!form) return;
    setPesoEnvio(valor);
    setForm({
      ...form,
      shipping_weight: valor,
    });
  };

  // =========================
  // CP / ZONA
  // =========================
  const handlePostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value;
    setCodigoPostal(cp);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            postal_code: cp,
          }
        : prev
    );
  };

  useEffect(() => {
    if (codigoPostal) {
      buscarCoordsPorCP(codigoPostal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoPostal]);

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !productId) return;

    if (!form.name.trim()) {
      toast.error("El nombre del producto es obligatorio");
      return;
    }
    if (!form.price.trim() || isNaN(Number(form.price))) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    // --- LÓGICA DE CATEGORÍA / SUBCATEGORÍA ---

    const categoryChanged =
      initialCategoryId !== null &&
      form.category_id !== initialCategoryId;
    const subcategoryChanged =
      initialSubcategoryId !== null &&
      form.subcategory_id !== initialSubcategoryId;

    // Caso 1: hay categoría pero NO hay subcategoría
    if (form.category_id && !form.subcategory_id) {
      toast.error("Debes poner una subcategoría adecuada a tu producto");
      return;
    }

    // Caso 2: cambio de categoría pero subcategoría se queda igual que antes
    if (categoryChanged && !subcategoryChanged) {
      toast.error(
        "Has cambiado la categoría, debes poner una subcategoría adecuada a tu producto"
      );
      return;
    }

    // Caso 3: cambio de subcategoría pero categoría sigue igual
    if (!categoryChanged && subcategoryChanged) {
      toast.error(
        "Has cambiado la subcategoría, revisa también la categoría de tu producto"
      );
      return;
    }

    setSaving(true);

    try {
      const payload: any = {
        summary: form.summary || undefined,
        name: form.name,
        description: form.description || undefined,
        price: form.price ? Number(form.price) : undefined,
        condition: form.condition || undefined,
        brand:
          tipoFormulario === "hogar" ? form.brand || undefined : undefined,
        color:
          tipoFormulario === "hogar" ? form.color || undefined : undefined,
        material:
          tipoFormulario === "hogar" ? form.material || undefined : undefined,
        width_cm:
          tipoFormulario === "hogar" && form.width_cm
            ? Number(form.width_cm)
            : undefined,
        height_cm:
          tipoFormulario === "hogar" && form.height_cm
            ? Number(form.height_cm)
            : undefined,
        depth_cm:
          tipoFormulario === "hogar" && form.depth_cm
            ? Number(form.depth_cm)
            : undefined,
        category_id: form.category_id
          ? Number(form.category_id)
          : undefined,
        subcategory_id: form.subcategory_id
          ? Number(form.subcategory_id)
          : undefined,
        shipping_active: envioActivo,
        shipping_size: tamanoEnvio || undefined,
        shipping_weight: pesoEnvio || undefined,
        postal_code: form.postal_code || undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      await updateProduct(Number(productId), payload, newImages);

      toast.success("Producto actualizado correctamente");
      navigate(`/product/${productId}`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Error al actualizar el producto");
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // RENDER
  // =========================
  if (loading || !form) {
    return (
      <>
        <Navbar />
        <CategoriesBar />
        <div className="edit-product-page">
          <div className="edit-product-card">
            <p>Cargando producto...</p>
          </div>
        </div>
      </>
    );
  }

  const existingImagesCount = product?.images?.length || 0;
  const totalUsed = existingImagesCount + newImages.length;
  const placeholders = Math.max(0, MAX_FILES - totalUsed);

  return (
    <>
      <Navbar />
      <CategoriesBar />
      <div className="edit-product-page">
        <div className="edit-product-card">
          <h1>Editar producto</h1>

          <form className="edit-product-form" onSubmit={handleSubmit}>
            <div className="edit-form-grid">
              {/* ===== COLUMNA IZQUIERDA ===== */}
              <div className="edit-form-column">
                <label>
                  Título
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Título del anuncio"
                    maxLength={50}
                  />
                </label>

                <label>
                  Resumen
                  <input
                    type="text"
                    name="summary"
                    value={form.summary}
                    onChange={handleChange}
                    placeholder="Resumen corto"
                  />
                </label>

                <label>
                  Descripción
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe el estado, uso, detalles..."
                    maxLength={640}
                  />
                </label>

                <label>
                  Precio (€)
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                  />
                </label>

                {tipoFormulario === "hogar" ? (
                  <>
                    <div className="edit-form-row">
                      <label>
                        Condición
                        <input
                          type="text"
                          name="condition"
                          value={form.condition}
                          onChange={handleChange}
                          placeholder="Nuevo, como nuevo, usado..."
                        />
                      </label>
                      <label>
                        Marca
                        <input
                          type="text"
                          name="brand"
                          value={form.brand}
                          onChange={handleChange}
                          placeholder="Marca"
                        />
                      </label>
                    </div>

                    <div className="edit-form-row">
                      <label>
                        Color
                        <input
                          type="text"
                          name="color"
                          value={form.color}
                          onChange={handleChange}
                          placeholder="Color"
                        />
                      </label>
                      <label>
                        Material
                        <input
                          type="text"
                          name="material"
                          value={form.material}
                          onChange={handleChange}
                          placeholder="Material"
                        />
                      </label>
                    </div>

                    <div className="edit-form-row">
                      <label>
                        Ancho (cm)
                        <input
                          type="number"
                          name="width_cm"
                          value={form.width_cm}
                          onChange={handleChange}
                          min={0}
                          step="0.1"
                        />
                      </label>
                      <label>
                        Alto (cm)
                        <input
                          type="number"
                          name="height_cm"
                          value={form.height_cm}
                          onChange={handleChange}
                          min={0}
                          step="0.1"
                        />
                      </label>
                      <label>
                        Fondo (cm)
                        <input
                          type="number"
                          name="depth_cm"
                          value={form.depth_cm}
                          onChange={handleChange}
                          min={0}
                          step="0.1"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label>
                    Estado
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar estado</option>
                      <option value="Nuevo">Nuevo</option>
                      <option value="Semi-nuevo">Semi-nuevo</option>
                      <option value="Usado">Usado</option>
                      <option value="Condiciones aceptables">
                        Condiciones aceptables
                      </option>
                      <option value="Muy usado">Muy usado</option>
                    </select>
                  </label>
                )}

                {/* CATEGORÍA / SUBCATEGORÍA */}
                <div className="edit-form-row">
                  <label>
                    Categoría
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Subcategoría
                    <select
                      name="subcategory_id"
                      value={form.subcategory_id}
                      onChange={handleChange}
                    >
                      <option value="">Selecciona una subcategoría</option>
                      {subcategories.map((subcategory) => (
                        <option key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* IMÁGENES */}
                <div className="edit-images-block fotos-container">
                  <h2 className="section-title">Imágenes del producto</h2>

                  {product?.images && product.images.length > 0 && (
                    <>
                      <p className="current-images-label">
                        Imágenes actuales:
                      </p>
                      <div className="current-images-grid">
                        {product.images.map((img) => (
                          <div
                            key={img.id}
                            className="current-image-item preview-box"
                          >
                            <img
                              src={img.image_url}
                              alt={`img-${img.id}`}
                              className="preview-img"
                            />
                            <button
                              type="button"
                              className="delete-btn"
                              onClick={() =>
                                handleDeleteExistingImage(img.id)
                              }
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* DROPZONE NUEVAS FOTOS */}
                  <div className="dropzone">
                    <div className="dropzone-inner">
                      <span className="upload-btn">Subir fotos</span>
                      <span className="dropzone-text">
                        Arrastra tus fotos aquí
                      </span>
                      <p className="dropzone-info">
                        Formatos aceptados: JPEG, PNG y WebP. Tamaño máx:{" "}
                        {MAX_SIZE_MB} MB por archivo. Máx: {MAX_FILES} fotos
                        (incluyendo las actuales).
                      </p>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleSelectImages}
                      className="hidden-input"
                    />
                  </div>

                  {/* GRID PREVIEW NUEVAS */}
                  <div className="preview-grid">
                    {newImages.map((file, i) => (
                      <div key={i} className="preview-box">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${i}`}
                          className="preview-img"
                        />
                        <button
                          type="button"
                          className="delete-btn"
                          onClick={() => removeNewImage(i)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {Array.from({ length: placeholders }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="preview-placeholder"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* ===== COLUMNA DERECHA ===== */}
              <div className="edit-form-column">
                {/* ENVÍO */}
                <div className="edit-shipping-block envio-container">
                  <h2 className="section-title">Opciones de envío</h2>

                  <div className="envio-header">
                    <ul className="envio-beneficios">
                      <li>✔ Vende más rápido.</li>
                      <li>✔ Sin necesidad de quedar con nadie.</li>
                      <li>✔ Es gratis. Todo lo que ganes, para ti.</li>
                      <li>
                        ✔ Tus ventas están protegidas por{" "}
                        <a href="#" className="envio-link">
                          Protección Wallapop
                        </a>
                        .
                      </li>
                    </ul>
                    <img
                      src={shippingToggleOn}
                      className="envio-img"
                      alt="envio"
                    />
                  </div>

                  <a className="envio-faq" href="#">
                    ¿Dudas? Consulta las preguntas frecuentes
                  </a>

                  <hr className="envio-divider" />

                  <div className="envio-toggle-row">
                    <span>Activar envío</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={envioActivo}
                        onChange={handleToggleEnvio}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  {envioActivo && (
                    <>
                      <h3 className="envio-title">Tamaño del producto</h3>
                      <p className="envio-description">
                        Según el tamaño del producto las opciones de envío
                        pueden cambiar.
                        <br />
                        <a className="tamano-link" href="#">
                          ¿Qué tamaño debería elegir?
                        </a>
                      </p>

                      <label className="envio-option">
                        <div className="envio-option-left">
                          <img
                            src={shirtIcon}
                            className="option-icon"
                            alt="estándar"
                          />
                          <span>
                            <strong>Estándar:</strong> productos pequeños y
                            medianos.
                          </span>
                        </div>
                        <input
                          type="radio"
                          checked={tamanoEnvio === "estandar"}
                          onChange={() => handleSelectTamano("estandar")}
                        />
                      </label>

                      <hr className="envio-separator" />

                      <label className="envio-option">
                        <div className="envio-option-left">
                          <img
                            src={bikeIcon}
                            className="option-icon"
                            alt="voluminoso"
                          />
                          <span>
                            <strong>Voluminoso:</strong> productos grandes o
                            pesados.
                          </span>
                        </div>
                        <input
                          type="radio"
                          checked={tamanoEnvio === "voluminoso"}
                          onChange={() => handleSelectTamano("voluminoso")}
                        />
                      </label>

                      <h3 className="envio-title">¿Cuánto pesa?</h3>
                      <p className="envio-description">
                        Elige el tramo de peso correspondiente a tu producto.
                      </p>

                      <div className="peso-list">
                        {TRAMOS_PESO.map((p) => (
                          <label key={p} className="peso-row">
                            <span>{p}</span>
                            <input
                              type="radio"
                              checked={pesoEnvio === p}
                              onChange={() => handleSelectPeso(p)}
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* ZONA / MAPA */}
                <div className="edit-location-block zona-container">
                  <h2 className="section-title">Zona de venta</h2>

                  <label>Código postal</label>
                  <input
                    type="text"
                    className="zona-input"
                    placeholder="Ej: 28001"
                    value={codigoPostal}
                    onChange={handlePostalChange}
                  />

                  <div className="zona-map-box">
                    {mapUrl && (
                      <iframe
                        src={mapUrl}
                        style={{
                          width: "100%",
                          height: "260px",
                          border: "0",
                          borderRadius: "12px",
                        }}
                      ></iframe>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="edit-form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate(-1)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
