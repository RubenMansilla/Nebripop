import Navbar from "../../../../components/Navbar/Navbar";
import CategoriesBar from "../../../../components/CategoriesBar/CategoriesBar";
import ProfileSideBar from "../../../../components/Profile/ProfileSideBar/ProfileSideBar";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useContext } from "react";
import { getMyPurchasedProducts } from "../../../../api/products.api";
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

export default function PurchasesCompleted() {
  const navigate = useNavigate();

  /* info item active */
  const [selected, setSelected] = useState("completed");

  const { token } = useContext(AuthContext);

  const [Purchasedproducts, setPurchasedProducts] = useState<ProductType[]>([]);
  const [visibleCount, setVisibleCount] = useState(25);

  // Loading controla la lógica, pero showSkeleton controla lo visual
  const [loading, setLoading] = useState(true);
  const [showSkeleton, setShowSkeleton] = useState(false);

  // ✅ NUEVO: productId -> total pagado (purchase.price)
  const [paidByProductId, setPaidByProductId] = useState<Record<number, number>>({});

  const visibleProducts = Purchasedproducts.slice(0, visibleCount);
  const hasMore = visibleCount < Purchasedproducts.length;

  const showMore = () => setVisibleCount((prev) => prev + 25);

  useEffect(() => {
    if (selected === "ongoing") {
      navigate("/purchases/ongoing");
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

    const load = async () => {
      try {
        const [purchased, transactionsOut] = await Promise.all([
          getMyPurchasedProducts(),
          // ✅ "out" = salidas (compras) -> tú eres comprador
          fetchMyTransactions("out"),
        ]);

        setPurchasedProducts(purchased);

        // Mapa productId -> purchase.price (total pagado)
        const map: Record<number, number> = {};
        for (const t of transactionsOut ?? []) {
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
    setPurchasedProducts((current) => current.filter((p) => p.id !== deletedId));
  };

  const getPaidFor = useMemo(() => {
    return (productId: number) => {
      const v = paidByProductId[Number(productId)];
      return Number.isFinite(v) ? v : null;
    };
  }, [paidByProductId]);

  return (
    <>
      {/* Si forman parte del layout real en tu página, descomenta */}
      {/* <Navbar /> */}
      {/* <CategoriesBar /> */}
      {/* <ProfileSideBar /> */}

      <div className="info-section">
        <div className="info-container">
          <div className="title">
            <h1>Tus compras</h1>
          </div>
          <div className="description">
            <p>Estos son los productos de Nebripop que has comprado y que ya han sido entregados</p>
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
          {Purchasedproducts.length === 0 && !loading && (
            <div className="no-reviews">
              <img src={noReviewsImg} alt="Sin valoraciones" className="no-reviews-img" />
              <h3>Sin compras finalizadas todavía</h3>
              <p>Cuando compres un producto aparecerá aquí.</p>
            </div>
          )}

          {/* Hay productos */}
          {Purchasedproducts.length > 0 && (
            <>
              <ul className="product-container">
                {visibleProducts.map((p) => {
                  const paid = getPaidFor(Number(p.id));
                  const original = Number((p as any)?.price ?? 0);

                  return (
                    <li key={p.id} style={{ listStyle: "none" }}>
                      <Product product={p} mode="purchased" onDelete={handleRemoveFromList} />

                      {/* ✅ Línea debajo: Original + Pagado (igual que ventas) */}
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
