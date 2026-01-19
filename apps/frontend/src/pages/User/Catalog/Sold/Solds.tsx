import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import { getMySoldProducts } from "../../../../api/products.api";
import { fetchMyTransactions } from "../../../../api/purchases.api";
import { AuthContext } from "../../../../context/AuthContext";
import Product from "../../../../components/Product/Product";
import type { ProductType } from "../../../../types/product";
import ProductSkeleton from "../../../../components/ProductSkeleton/ProductSkeleton";
import noReviewsImg from "../../../../assets/profile/pop-no-sales-completed.svg";

const formatPrice = (value: number) =>
  `${Number(value).toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

export default function Solds() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("sold");
  const { token } = useContext(AuthContext);

  const [Soldproducts, setSoldProducts] = useState<ProductType[]>([]);
  const [visibleCount, setVisibleCount] = useState(25);

  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // ✅ NUEVO: productId -> total pagado (purchase.price)
  const [paidByProductId, setPaidByProductId] = useState<Record<number, number>>({});

  const visibleProducts = Soldproducts.slice(0, visibleCount);
  const hasMore = visibleCount < Soldproducts.length;

  const showMore = () => setVisibleCount((prev) => prev + 25);

  useEffect(() => {
    if (selected === "published") {
      navigate("/catalog/published");
    }
  }, [selected, navigate]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setShowSkeleton(false);

    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 300);

    const load = async () => {
      try {
        const [sold, transactionsIn] = await Promise.all([
          getMySoldProducts(),
          // ✅ "in" = entradas (ventas) -> tú eres vendedor
          fetchMyTransactions("in"),
        ]);

        setSoldProducts(sold);

        const map: Record<number, number> = {};
        for (const t of transactionsIn ?? []) {
          const pid = Number(t.productId ?? t.product?.id);
          const paid = Number(t.price);

          if (Number.isFinite(pid) && pid > 0 && Number.isFinite(paid)) {
            // si hay duplicados, nos quedamos con el primero (viene DESC)
            if (map[pid] === undefined) map[pid] = paid;
          }
        }
        setPaidByProductId(map);
      } catch (err) {
        console.error(err);
      } finally {
        clearTimeout(skeletonTimer);
        setLoading(false);
      }
    };

    load();

    return () => clearTimeout(skeletonTimer);
  }, [token]);

  const handleRemoveFromList = (deletedId: number) => {
    setSoldProducts((current) => current.filter((p) => p.id !== deletedId));
  };

  const getPaidFor = useMemo(() => {
    return (productId: number) => {
      const v = paidByProductId[Number(productId)];
      return Number.isFinite(v) ? v : null;
    };
  }, [paidByProductId]);

  return (
    <>
      <div className="info-section">
        <div className="info-container">
          <div className="title">
            <h1>Tus productos</h1>
          </div>
          <div className="description">
            <p>
              Aquí podrás subir productos, gestionar los que ya tienes y eliminar los que ya no quieras
              vender
            </p>
          </div>
        </div>
      </div>

      <div className="info-selector">
        <div className="info-items">
          <div
            className={`info-item ${selected === "published" ? "active" : ""}`}
            onClick={() => setSelected("published")}
          >
            <p>En venta</p>
          </div>
          <div
            className={`info-item ${selected === "sold" ? "active" : ""}`}
            onClick={() => setSelected("sold")}
          >
            <p>Vendidos</p>
          </div>
        </div>
      </div>

      {loading && showSkeleton ? (
        <ul className="product-container">
          {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </ul>
      ) : (
        <>
          {Soldproducts.length === 0 && !loading && (
            <div className="no-reviews">
              <img src={noReviewsImg} alt="Sin valoraciones" className="no-reviews-img" />
              <h3>Sin ventas finalizadas todavía</h3>
              <p>Si quieres vender algo, simplemente súbelo.</p>
            </div>
          )}

          {Soldproducts.length > 0 && (
            <>
              <ul className="product-container">
                {visibleProducts.map((p) => {
                  const paid = getPaidFor(Number(p.id));
                  const original = Number((p as any)?.price ?? 0);

                  return (
                    <li key={p.id} style={{ listStyle: "none" }}>
                      <Product product={p} mode="sold" onDelete={handleRemoveFromList} />

                      {/* ✅ Línea debajo: Original + Pagado */}
                      {paid !== null && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 13,
                            color: "#6b6b6b",
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <span>
                            <b>Original:</b> {formatPrice(original)}
                          </span>

                          <span style={{ opacity: 0.6 }}>·</span>

                          <span>
                            <b>Pagado:</b> {formatPrice(paid)}
                          </span>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {hasMore && (
                <div className="btn-more-reviews-container" onClick={showMore}>
                  <div className="btn-more-reviews">Ver más productos</div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
