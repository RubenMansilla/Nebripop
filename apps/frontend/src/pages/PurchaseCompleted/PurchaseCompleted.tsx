import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./PurchaseCompleted.css";
import { jsPDF } from "jspdf";
import PublicReview from "../PublicReview/PublicReview";

interface PurchaseData {
    productName: string;
    productId?: number;
    totalAmount: number;
    deliveryDate: string;
    orderId: string;
    image?: string;
    customerName?: string;
    paymentMethod?: string;
    shippingAddress?: string;
    shippingComplement?: string;
    shippingCity?: string;
    shippingProvince?: string;
    shippingPostcode?: string;
    seller_id?: string;
}

export default function PurchaseCompletedPage() {

    const navigate = useNavigate();
    const location = useLocation();

    const [purchase, setPurchase] = useState<PurchaseData | null>(null);

    const [showReviewPopup, setShowReviewPopup] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    // BLOQUEO DE SCROLL
    useEffect(() => {
        if (showReviewPopup) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showReviewPopup]);


    const handleReviewSuccess = () => {
        setReviewSubmitted(true);
        setShowReviewPopup(false);
    };

    const handleOpenReviewPopup = () => {
        setShowReviewPopup(true);
    };

    const handleCloseReviewPopup = () => {
        setShowReviewPopup(false);
    };

    // Formato de moneda
    const formatPrice = (value: number) =>
        `${value.toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })} €`;

    useEffect(() => {

        // Verificar si hay datos en el state
        if (!location.state) {
            navigate("/", { replace: true });
            return;
        }

        // Recuperar datos pasados por navegación
        const stateData = location.state as Partial<PurchaseData>;

        // Simulación de fecha de entrega
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + 3);
        const dateStr = estimatedDate.toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        setPurchase({
            productName: stateData?.productName || "Producto NebriPop",
            totalAmount: stateData?.totalAmount || 0,
            deliveryDate: dateStr,
            orderId: stateData?.orderId || "00000",
            image: stateData?.image || "https://via.placeholder.com/150",
            customerName: stateData?.customerName || "Cliente",
            paymentMethod: stateData?.paymentMethod || "Tarjeta / Wallet",
            shippingAddress: stateData?.shippingAddress || "",
            shippingComplement: stateData?.shippingComplement || "",
            shippingCity: stateData?.shippingCity || "",
            shippingProvince: stateData?.shippingProvince || "",
            shippingPostcode: stateData?.shippingPostcode || "",
            seller_id: stateData?.seller_id || "",
            productId: stateData?.productId || undefined,
        });
    }, [location]);


    // Generar PDF mejorado
    const handleDownloadInvoice = () => {
        if (!purchase) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = 20;

        // --- CABECERA ---
        doc.setFontSize(24);
        doc.setTextColor(210, 185, 144);
        doc.text("NebriPop", margin, y);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("FACTURA", pageWidth - margin, y, { align: "right" });

        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text("Nebrija Pop S.L.", margin, y);
        doc.text("CIF: B-12345678", margin, y + 5);
        doc.text("C/ Mayor, 12, Madrid", margin, y + 10);
        doc.text("soporte@nebripop.com", margin, y + 15);

        doc.text(`Nº Orden: ${purchase.orderId}`, pageWidth - margin, y, { align: "right" });
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, pageWidth - margin, y + 5, { align: "right" });

        y += 30;
        doc.setDrawColor(220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;

        // --- DATOS DEL CLIENTE CON DIRECCIÓN ---
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.setFont("helvetica", "bold");
        doc.text("Facturar a:", margin, y);
        y += 6;

        doc.setFont("helvetica", "normal");

        // Nombre
        doc.text(purchase.customerName || "Cliente", margin, y);
        y += 5;

        // Dirección y Complemento
        const fullAddress = purchase.shippingComplement
            ? `${purchase.shippingAddress}, ${purchase.shippingComplement}`
            : purchase.shippingAddress || "Dirección no disponible";
        doc.text(fullAddress, margin, y);
        y += 5;

        // CP, Ciudad y Provincia
        const cityLine = `${purchase.shippingPostcode || ""} ${purchase.shippingCity || ""} (${purchase.shippingProvince || ""})`;
        doc.text(cityLine, margin, y);

        y += 20;

        // --- TABLA DE PRODUCTOS ---
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, y, pageWidth - (margin * 2), 10, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("DESCRIPCIÓN", margin + 5, y + 7);
        doc.text("CANT.", 130, y + 7, { align: "center" });
        doc.text("PRECIO", pageWidth - margin - 5, y + 7, { align: "right" });

        y += 18;

        doc.setFont("helvetica", "normal");
        doc.text(purchase.productName, margin + 5, y);
        doc.text("1", 130, y, { align: "center" });
        doc.text(formatPrice(purchase.totalAmount), pageWidth - margin - 5, y, { align: "right" });

        y += 5;
        doc.setDrawColor(240);
        doc.line(margin, y, pageWidth - margin, y);

        y += 15;

        // --- TOTALES ---
        const startXTotals = 130;
        const baseAmount = purchase.totalAmount / 1.21;
        const taxAmount = purchase.totalAmount - baseAmount;

        doc.setFontSize(9);
        doc.text("Base Imponible:", startXTotals, y);
        doc.text(formatPrice(baseAmount), pageWidth - margin - 5, y, { align: "right" });
        y += 6;

        doc.text("IVA (21%):", startXTotals, y);
        doc.text(formatPrice(taxAmount), pageWidth - margin - 5, y, { align: "right" });
        y += 8;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text("TOTAL:", startXTotals, y);
        doc.text(formatPrice(purchase.totalAmount), pageWidth - margin - 5, y, { align: "right" });

        // Pie
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Gracias por confiar en NebriPop.", margin, pageHeight - 20);

        doc.save(`Factura_NebriPop_${purchase.orderId}.pdf`);
    };

    if (!purchase) return null;

    return (
        <div className="completed-page">
            <header className="completed-header">
                <span className="logo-text" onClick={() => navigate("/")}>
                    NebriPop
                </span>
            </header>

            <main className="completed-main">
                {/* TARJETA TIPO FACTURA */}
                <div className="invoice-card">

                    {/* CABECERA DE ÉXITO */}
                    <div className="invoice-status">

                        <h1 className="status-title">¡Gracias por tu compra!</h1>
                        <p className="status-subtitle">
                            Tu pedido ha sido confirmado. Te hemos enviado un correo con los detalles.
                        </p>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* DATOS CLAVE */}
                    <div className="invoice-meta-grid">
                        <div className="meta-item">
                            <span className="meta-label">Fecha</span>
                            <span className="meta-value">{new Date().toLocaleDateString()}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Nº Pedido</span>
                            <span className="meta-value text-mono">{purchase.orderId}</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Método pago</span>
                            <span className="meta-value">Tarjeta / Wallet</span>
                        </div>
                        <div className="meta-item">
                            <span className="meta-label">Entrega est.</span>
                            <span className="meta-value highlight">{purchase.deliveryDate}</span>
                        </div>
                    </div>

                    <div className="invoice-divider"></div>

                    {/* DETALLE PRODUCTO */}
                    <div className="invoice-product-row">
                        <div className="product-thumb">
                            {purchase.image && <img src={purchase.image} alt="Producto" />}
                        </div>
                        <div className="product-purchased-info">
                            <span className="p-name">{purchase.productName}</span>
                            <span className="p-qty">Cantidad: 1</span>
                        </div>
                        <div className="product-purchased-price">
                            {formatPrice(purchase.totalAmount)}
                        </div>
                    </div>

                    {/* TOTALES */}
                    <div className="invoice-summary">
                        <div className="summary-row total">
                            <span>Total pagado</span>
                            <span>{formatPrice(purchase.totalAmount)}</span>
                        </div>
                        <div className="summary-tax">
                            (Impuestos incluidos)
                        </div>
                    </div>

                    {/* BOTONES */}
                    <div className="invoice-actions">
                        <button className="btn-invoice-download" onClick={handleDownloadInvoice}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Descargar Factura
                        </button>

                        {!reviewSubmitted && (
                            <button className="btn-invoice-review" onClick={handleOpenReviewPopup}>
                                Valorar el producto
                            </button>
                        )}

                        <button className="btn-invoice-home" onClick={() => navigate("/filtros")}>
                            Seguir comprando
                        </button>
                    </div>

                </div>
            </main>
            {showReviewPopup && (
                <PublicReview
                    onClose={handleCloseReviewPopup}
                    onSuccess={handleReviewSuccess}
                    productName={purchase.productName}
                    productId={purchase.productId}
                    productImage={purchase.image}
                    seller_id={purchase.seller_id}
                />
            )}
        </div>
    );
}