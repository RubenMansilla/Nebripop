// apps/frontend/src/pages/CheckOut/CheckoutPage.tsx
import React, { useEffect, useState } from "react";
import "./CheckoutPage.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createPurchase } from "../../api/purchases.api";
import { getProductById } from "../../api/products.api";
import { useNotificationSettings } from "../../context/NotificationContext";
import { toast } from "react-toastify";
import api from "../../utils/axiosConfig";

interface CheckoutProduct {
  id: number;
  owner_id: number;
  name: string;
  price: number;
  images?: { image_url: string }[];
}

const formatPrice = (value: number) =>
  `${value.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

export default function CheckoutPage() {
  const { notify } = useNotificationSettings();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<CheckoutProduct | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [isPayingExternal, setIsPayingExternal] = useState(false);
  const [isPayingWallet, setIsPayingWallet] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const productIdParam = searchParams.get("productId");

  // =========================
  // ESTADO DEL FORMULARIO DE ENVÍO
  // =========================
  const [form, setForm] = useState({
    email: "",
    country: "España",
    firstName: "",
    lastName: "",
    address: "",
    complement: "",
    city: "",
    province: "Madrid",
    postcode: "",
    phone: "",
  });

  // =========================
  // WALLET
  // =========================
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Manejo genérico de campos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Campos SOLO texto (no números): nombre, apellidos, ciudad
    if (name === "firstName" || name === "lastName" || name === "city") {
      const cleaned = value.replace(
        /[^a-zA-ZÁÉÍÓÚáéíóúÜüÑñ\s'-]/g,
        "",
      );
      setForm((prev) => ({
        ...prev,
        [name]: cleaned,
      }));
      return;
    }

    // El resto de campos de texto normales
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Campos numéricos específicos
  const handlePostcodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
    setForm((prev) => ({
      ...prev,
      postcode: digits,
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    setForm((prev) => ({
      ...prev,
      phone: digits,
    }));
  };

  // =========================
  // Cargar producto
  // =========================
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productIdParam) {
        setErrorMsg("No se ha encontrado el producto a comprar.");
        setLoadingProduct(false);
        return;
      }

      const productId = Number(productIdParam);
      if (Number.isNaN(productId)) {
        setErrorMsg("Identificador de producto no válido.");
        setLoadingProduct(false);
        return;
      }

      try {
        const data = await getProductById(String(productId));

        console.log("Producto cargado para checkout:", data);

        setProduct({
          id: data.id,
          owner_id: data.owner_id,
          name: data.name,
          price: Number(data.price),
          images: data.images || [],
        });
      } catch (err: any) {
        setErrorMsg(err.message || "Error al cargar el producto.");
      } finally {
        setLoadingProduct(false);
      }
    };

    fetchProduct();
  }, [productIdParam]);

  // =========================
  // Cargar saldo del monedero
  // =========================
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const res = await api.get("/wallet/balance");
        setWalletBalance(Number(res.data.balance));
      } catch (err) {
        console.error("Error obteniendo saldo del monedero", err);
        setWalletError("No se pudo obtener el saldo del monedero.");
      }
    };

    fetchWalletBalance();
  }, []);

  // =========================
  // Validar datos comunes
  // =========================
  const validateCommon = () => {
    if (!productIdParam) {
      setErrorMsg("No se ha encontrado el producto a comprar.");
      return false;
    }

    const productId = Number(productIdParam);
    if (Number.isNaN(productId)) {
      setErrorMsg("Identificador de producto no válido.");
      return false;
    }

    if (
      !form.email ||
      !form.firstName ||
      !form.lastName ||
      !form.address ||
      !form.city ||
      !form.province ||
      !form.postcode ||
      !form.country
    ) {
      setErrorMsg("Por favor, rellena todos los campos obligatorios.");
      return false;
    }

    // ✅ Validación de estructura de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setErrorMsg("Introduce un correo electrónico válido (ej: nombre@dominio.com).");
      return false;
    }

    if (form.postcode.length !== 5) {
      setErrorMsg("Introduce un código postal válido de 5 dígitos.");
      return false;
    }

    if (form.phone && form.phone.length < 9) {
      setErrorMsg("Introduce un teléfono válido de 9 dígitos.");
      return false;
    }

    return true;
  };

  const buildPayload = (paymentMethod: "external" | "wallet") => {
    const productId = Number(productIdParam);
    return {
      productId,
      paymentMethod,
      shippingEmail: form.email,
      shippingFullName: `${form.firstName} ${form.lastName}`.trim(),
      shippingAddress: form.address,
      shippingComplement: form.complement || undefined,
      shippingCity: form.city,
      shippingProvince: form.province,
      shippingPostcode: form.postcode,
      shippingPhone: form.phone || undefined,
      shippingCountry: form.country,
    };
  };

  // =========================
  // Pagar con método EXTERNO (PayPal)
  // =========================
  const handlePayExternal = async () => {
    setErrorMsg(null);
    if (!validateCommon()) return;

    const payload = buildPayload("external");

    try {
      setIsPayingExternal(true);
      const purchaseResponse = await createPurchase(payload);
      notify("transactions", "Compra realizada con éxito");
      navigate("/purchase/completed", {
        replace: true,
        state: {
          productName: product?.name,
          productId: product?.id,
          totalAmount: total,
          orderId: purchaseResponse.id || `NP-${Date.now()}`,
          image: firstImage,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          paymentMethod: isPayingWallet ? "Monedero NebriPop" : "PayPal",
          shippingAddress: form.address,
          shippingComplement: form.complement,
          shippingCity: form.city,
          shippingProvince: form.province,
          shippingPostcode: form.postcode,
          seller_id: product?.owner_id,
        }
      });
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar la compra.");
      toast.error("Error al procesar la compra");
    } finally {
      setIsPayingExternal(false);
    }
  };

  // =========================
  // Pagar con MONEDERO
  // =========================
  const handlePayWallet = async () => {
    setErrorMsg(null);
    if (!validateCommon()) return;

    const payload = buildPayload("wallet");

    try {
      setIsPayingWallet(true);
      const purchaseResponse = await createPurchase(payload);
      notify("transactions", "Compra realizada con éxito");
      navigate("/purchase/completed", {
        replace: true,
        state: {
          productName: product?.name,
          productId: product?.id,
          totalAmount: total,
          orderId: purchaseResponse.id || `NP-${Date.now()}`,
          image: firstImage,
          customerName: `${form.firstName} ${form.lastName}`.trim(),
          paymentMethod: isPayingWallet ? "Monedero NebriPop" : "PayPal",
          shippingAddress: form.address,
          shippingComplement: form.complement,
          shippingCity: form.city,
          shippingProvince: form.province,
          shippingPostcode: form.postcode,
          seller_id: product?.owner_id,
        }
      });
    } catch (err: any) {
      setErrorMsg(
        err.message || "Error al procesar la compra con monedero.",
      );
      toast.error("Error al procesar la compra");
    } finally {
      setIsPayingWallet(false);
    }
  };

  // =========================
  // Cálculos de importes
  // =========================
  const shippingCost = 1.99;

  const subtotal = product ? product.price : 0;
  const iva = subtotal * 0.21;
  const total = subtotal + iva + shippingCost;

  const firstImage =
    product?.images && product.images.length > 0
      ? product.images[0].image_url
      : null;

  const isDisabled = loadingProduct || !product;

  return (
    <div className="checkout-page">
      {/* HEADER */}
      <header className="checkout-header">
        <span className="logo-text">NebripPay</span>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="checkout-main">
        {/* COLUMNA IZQUIERDA */}
        <section className="checkout-left">
          {/* Botones de pago rápido */}
          <div className="payment-buttons-card">
            <button
              className="payment-btn payment-btn-paypal"
              type="button"
              onClick={handlePayExternal}
              disabled={isDisabled || isPayingExternal}
            >
              {isPayingExternal ? (
                <span>Procesando compra…</span>
              ) : (
                <>
                  <span>Pagar ahora con</span>
                  <span className="payment-btn-bold">PayPal</span>
                </>
              )}
            </button>

            <div className="divider">
              <span className="divider-line" />
              <span className="divider-text">
                O paga con tu monedero NebriPop
              </span>
              <span className="divider-line" />
            </div>

            {/* BOTÓN PAGO CON MONEDERO */}
            <button
              className="wallet-pay-btn"
              type="button"
              onClick={handlePayWallet}
              disabled={isDisabled || isPayingWallet}
            >
              {isPayingWallet ? (
                "Pagando con monedero…"
              ) : (
                <>
                  <span>💰 Pagar con monedero NebriPop</span>
                  <span className="wallet-pay-sub">
                    Se descontará del saldo de tu cuenta
                  </span>
                </>
              )}
            </button>

            {walletBalance !== null && (
              <p className="wallet-balance-text">
                Saldo actual en tu monedero: {formatPrice(walletBalance)}
              </p>
            )}

            {walletError && (
              <div className="checkout-error-box">
                <p className="checkout-error-msg">{walletError}</p>
              </div>
            )}

            {errorMsg && (
              <div className="checkout-error-box">
                <p className="checkout-error-msg">{errorMsg}</p>
              </div>
            )}

          </div>

          {/* Detalles de envío */}
          <section className="shipping-section">
            <h2 className="section-title">Datos de envío</h2>

            <form
              className="shipping-form"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="form-field">
                <label>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={80}
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  title="Introduce un correo válido, por ejemplo: nombre@dominio.com"
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="Nombre"
                    value={form.firstName}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </div>
                <div className="form-field">
                  <label>Apellidos</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Apellidos"
                    value={form.lastName}
                    onChange={handleChange}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Dirección</label>
                <input
                  type="text"
                  name="address"
                  placeholder="Calle, número, piso…"
                  value={form.address}
                  onChange={handleChange}
                  maxLength={120}
                />
              </div>

              <div className="form-field">
                <label>Complemento (opcional)</label>
                <input
                  type="text"
                  name="complement"
                  placeholder="Portal, escalera, puerta…"
                  value={form.complement}
                  onChange={handleChange}
                  maxLength={80}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ciudad"
                    value={form.city}
                    onChange={handleChange}
                    maxLength={60}
                  />
                </div>
                <div className="form-field">
                  <label>Provincia</label>
                  <div className="select-wrapper">
                    <select
                      name="province"
                      value={form.province}
                      onChange={handleChange}
                    >
                      <option>Madrid</option>
                      <option>Barcelona</option>
                      <option>Valencia</option>
                      <option>Sevilla</option>
                      <option>Málaga</option>
                      <option>Zaragoza</option>
                      <option>Murcia</option>
                      <option>Otra provincia</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label>Código postal</label>
                  <input
                    type="text"
                    name="postcode"
                    placeholder="28001"
                    value={form.postcode}
                    onChange={handlePostcodeChange}
                    maxLength={5}
                    inputMode="numeric"
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Teléfono (opcional)</label>
                <div className="phone-wrapper">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="612345678"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    maxLength={9}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </form>
          </section>
        </section>

        {/* COLUMNA DERECHA */}
        <aside className="checkout-right">
          <section className="summary-card">
            <h2 className="section-title">Resumen del pedido</h2>

            {/* Producto principal */}
            <div className="summary-product">
              <div className="summary-product-left">
                <div className="product-thumb">
                  {firstImage && (
                    <img
                      src={firstImage}
                      alt={product?.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                      }}
                    />
                  )}
                </div>
                <div className="product-info">
                  <div className="product-qty">1</div>
                  <p className="product-name">
                    {loadingProduct
                      ? "Cargando producto…"
                      : product?.name || "Producto no disponible"}
                  </p>
                </div>
              </div>
              <div className="summary-price">
                {product ? formatPrice(subtotal) : "--"}
              </div>
            </div>

            {/* Resumen números */}
            <div className="line-items">
              <div className="line-item">
                <span>Subtotal</span>
                <span>{product ? formatPrice(subtotal) : "--"}</span>
              </div>

              <div className="line-item">
                <div>
                  <div>IVA</div>
                  <div className="line-item-sub">21 %</div>
                </div>
                <span>{product ? formatPrice(iva) : "--"}</span>
              </div>

              <div className="line-item">
                <div>
                  <div>Envío en España</div>
                  <div className="line-item-sub">
                    Envío a domicilio o punto de recogida
                  </div>
                </div>
                <span>{formatPrice(1.99)}</span>
              </div>
            </div>

            {/* TOTAL */}
            <div className="total-row">
              <div>
                <div className="total-label">Total</div>
                <div className="total-sub">Impuestos incluidos</div>
              </div>
              <div className="total-amount">
                {product ? formatPrice(total) : "--"}
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
