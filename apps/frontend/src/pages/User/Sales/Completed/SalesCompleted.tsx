import Navbar from "../../../../components/Navbar/Navbar";
import CategoriesBar from "../../../../components/CategoriesBar/CategoriesBar";
import ProfileSideBar from "../../../../components/Profile/ProfileSideBar/ProfileSideBar";
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

export default function SalesCompleted() {
  const navigate = useNavigate();

  /* info item active */
  const [selected, setSelected] = useState("completed");

  const { token } = useContext(AuthContext);

  const [Soldproducts, setSoldProducts] = useState<ProductType[]>([]);
  const [visibleCount, setVisibleCount] = useState(25);

  // Loading controla la lógica, pero showSkeleton controla lo visual
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // ✅ NUEVO: mapa productId -> total pagado (purchase.price)
  const [paidByProductId, setPaidByProductId] = useState<Record<number, number>>({});

  const visibleProducts = Soldproducts.slice(0, visibleCount);

  const showMore = () => {
    setVisibleCount((prev) => prev + 25);
  };

  const hasMore = visibleCount < Soldproducts.length;

  useEffect(() => {
    if (selected === "ongoing") {
      navigate("/sales/ongoing");
    }
  }, [selected, navigate]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setShowSkeleton(false);

    // Solo mostramos el skeleton si tarda más de 300ms
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, 300);

    // ✅ Cargamos productos vendidos + transacciones (ventas)
    const load = async () => {
      try {
        const [sold, transactionsIn] = await Promise.all([
          getMySoldProducts(),
          // "in" = ventas (entradas)
          fetchMyTransactions("in"),
        ]);

        setSoldProducts(sold);

        // Construimos el mapa productId -> purchase.price
        const map: Record<number, number> = {};
        for (const t of transactionsIn ?? []) {
          // dependiendo de cómo te venga el objeto
          const pid = Number(t.productId ?? t.product?.id);
          const paid = Number(t.price);
          if (Number.isFinite(pid) && pid > 0 && Number.isFinite(paid)) {
            // Si hubiese varias compras del mismo producto (normalmente no),
            // nos quedamos con la última (la primera en tu query viene DESC)
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

  // ✅ Memo: para leer rápido el pagado
  const getPaidFor = useMemo(() => {
    return (productId: number) => {
      const v = paidByProductId[Number(productId)];
      return Number.isFinite(v) ? v : null;
    };
  }, [paidByProductId]);

  return (
    <>
      {/* Si quieres, puedes volver a activar estos 3 si forman parte del layout real */}
      {/* <Navbar /> */}
      {/* <CategoriesBar /> */}
      {/* <ProfileSideBar /> */}

      <div className="info-section">
        <div className="info-container">
          <div className="title">
            <h1>Tus ventas</h1>
          </div>
          <div className="description">
            <p>Estos son los productos de Nebripop que has vendido</p>
          </div>
        </div>
      </div>

      <div className="info-selector">
        <div className="info-items">
          <div
            className={`info-item ${selected === "ongoing" ? "active" : ""}`}
            onClick={() => setSelected("ongoing")}
          >
            <p>En curso</p>
          </div>
          <div
            className={`info-item ${selected === "completed" ? "active" : ""}`}
            onClick={() => setSelected("completed")}
          >
            <p>Finalizadas</p>
          </div>
        </div>
      </div>

      {/* Está cargando Y ha pasado suficiente tiempo -> Muestra Skeleton */}
      {loading && showSkeleton ? (
        <ul className="product-container">
          {[...Array(5)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </ul>
      ) : (
        <>
          {/* No hay productos */}
          {Soldproducts.length === 0 && !loading && (
            <div className="no-reviews">
              <img src={noReviewsImg} alt="Sin valoraciones" className="no-reviews-img" />
              <h3>Sin ventas finalizadas todavía</h3>
              <p>Cuando vendas un producto aparecerá aquí.</p>
            </div>
          )}

          {/* Hay productos */}
          {Soldproducts.length > 0 && (
            <>
              <ul className="product-container">
                {visibleProducts.map((p) => {
                  const paid = getPaidFor(Number(p.id));
                  const original = Number((p as any)?.price ?? 0);

                  return (
                    <li key={p.id} style={{ listStyle: "none" }}>
                      <Product product={p} mode="sold" onDelete={handleRemoveFromList} />

                      {/* ✅ Línea extra: Original + Pagado */}
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
