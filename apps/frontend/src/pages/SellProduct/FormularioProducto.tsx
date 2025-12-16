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
import { useNavigate } from "react-router-dom";

export default function FormularioProducto() {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

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

    // =======================
    // TOAST
    // =======================
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    };

    // =======================
    // FLUJO DEL FORMULARIO
    // =======================
    const [showFotos, setShowFotos] = useState(false);
    const [showCategoria, setShowCategoria] = useState(false);
    const [showDetalles, setShowDetalles] =
        useState<false | "hogar" | "generico">(false);

    const fotosRef = useRef<HTMLDivElement | null>(null);
    const categoriaRef = useRef<HTMLDivElement | null>(null);
    const detallesRef = useRef<HTMLDivElement | null>(null);

    const scrollTo = (ref: React.MutableRefObject<HTMLDivElement | null>) => {
        setTimeout(() => {
            ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
    };

    useEffect(() => {
        if (showFotos) scrollTo(fotosRef);
    }, [showFotos]);

    useEffect(() => {
        if (showCategoria) scrollTo(categoriaRef);
    }, [showCategoria]);

    useEffect(() => {
        if (showDetalles) scrollTo(detallesRef);
    }, [showDetalles]);

    // =======================
    // PUBLICAR
    // =======================
    const handlePublish = async () => {
        if (!token) {
            showToast("Inicia sesión para publicar un producto.");
            return;
        }

        if (!summary.trim()) {
            showToast("Debes escribir un resumen del producto.");
            return;
        }

        if (images.length === 0) {
            showToast("Debes subir al menos una foto.");
            return;
        }

        // ✅ AHORA ESTO FUNCIONA
        if (!categoryId || !subcategoryId) {
            showToast("Debes seleccionar una categoría.");
            return;
        }

        if (!details?.price || Number(details.price) <= 0) {
            showToast("Debes introducir un precio válido.");
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

        try {
            await createProduct(body, images, token!);
            navigate("/catalog/published", { state: { success: true } });
        } catch (err) {
            console.error(err);
            showToast("Error al publicar el producto.");
        }
    };

    return (
        <div className="formulario-wrapper">
            {/* TOAST */}
            {toastMessage && <div className="toast">{toastMessage}</div>}

            {/* PASO 1 - RESUMEN */}
            <div className="bloque">
                <h2 className="section-title">Información del producto</h2>

                <label className="input-label">Resumen del producto</label>
                <textarea
                    className="input-textarea"
                    placeholder="Ej: Sofá beige en buen estado…"
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                />

                <button
                    className="continue-btn"
                    onClick={() => {
                        if (!summary.trim()) {
                            showToast("Debes escribir un resumen.");
                            return;
                        }
                        setShowFotos(true);
                    }}
                >
                    Continuar
                </button>
            </div>

            {/* PASO 2 - FOTOS */}
            {showFotos && (
                <div ref={fotosRef} className="bloque">
                    <h2 className="section-title">Fotos</h2>
                    <p className="limit-text">
                        Puedes subir entre <strong>1 y 6 fotos</strong>.
                    </p>

                    <Fotos
                        onContinue={(imgs) => {
                            if (imgs.length === 0) {
                                showToast("Debes subir al menos una foto.");
                                return;
                            }
                            setImages(imgs);
                            setShowCategoria(true);
                        }}
                        showToast={showToast}
                    />
                </div>
            )}

            {/* PASO 3 - CATEGORÍA */}
            {showCategoria && (
                <div ref={categoriaRef} className="bloque">
                    <Categoria
                        onSelect={({ categoryId, subcategoryId, tipoFormulario }) => {
                            // ✅ CAMBIO CLAVE AQUÍ
                            setCategoryId(categoryId);
                            setSubcategoryId(subcategoryId);
                            setShowDetalles(tipoFormulario);
                        }}
                    />
                </div>
            )}

            {/* PASO 4 - DETALLES */}
            {showDetalles === "hogar" && (
                <div ref={detallesRef} className="bloque">
                    <DetallesProducto onChange={(data) => setDetails(data)} />
                </div>
            )}

            {showDetalles === "generico" && (
                <div ref={detallesRef} className="bloque">
                    <DetallesProductoGenerico onChange={(data) => setDetails(data)} />
                </div>
            )}

            {/* PASO 5 - ENVÍO */}
            {showDetalles && (
                <div className="bloque">
                    <OpcionesEnvio onChange={(data) => setShipping(data)} />
                </div>
            )}

            {/* PASO 6 - ZONA */}
            {showDetalles && (
                <div className="bloque">
                    <ZonaVenta onChange={(data) => setZone(data)} />
                </div>
            )}

            {/* PUBLICAR */}
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
