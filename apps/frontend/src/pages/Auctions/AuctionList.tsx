import { useEffect, useState } from "react";

import { getAuctions } from "../../api/auctions.api";
import { getCategories } from "../../api/categories.api";
import { getSubcategoriesByCategory } from "../../api/subcategories.api";
import { useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import CategoriesBar from "../../components/CategoriesBar/CategoriesBar";
import "../User/Auctions/Auctions.css";
import "../../pages/Filtro/Filtro.css"; // Importing shared CSS for filters layout
import AuctionCard from "../../components/Auctions/AuctionCard/AuctionCard";

export default function AuctionList() {
    const [searchParams] = useSearchParams();
    // Data states
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<any[]>([]);
    const [subcategories, setSubcategories] = useState<any[]>([]);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(
        null,
    );
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [dateFilter, setDateFilter] = useState<
        "today" | "7days" | "30days" | undefined
    >(undefined);
    const [conditionFilters, setConditionFilters] = useState<string[]>([]);
    const [shippingFilter, setShippingFilter] = useState<
        "shipping" | "person" | null
    >(null);

    // UI states
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [visibleCount, setVisibleCount] = useState(40);

    // Sync URL params with state
    useEffect(() => {
        const catId = searchParams.get("categoryId");
        const subId = searchParams.get("subcategoryId");

        if (catId) setSelectedCategory(Number(catId));
        if (subId) setSelectedSubcategory(Number(subId));
    }, [searchParams]);

    // Initial Data Fetch
    useEffect(() => {
        setLoading(true);
        Promise.all([getAuctions(), getCategories()])
            .then(([auctionsData, categoriesData]) => {
                setAuctions(auctionsData);
                setCategories(categoriesData);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    // Fetch Subcategories when Category changes
    useEffect(() => {
        if (!selectedCategory) {
            setSubcategories([]);
            setSelectedSubcategory(null);
            return;
        }

        getSubcategoriesByCategory(selectedCategory)
            .then((subs) => {
                const seenNames = new Set<string>();
                const uniqueSubs = subs.filter((sub: any) => {
                    if (seenNames.has(sub.name)) return false;
                    seenNames.add(sub.name);
                    return true;
                });
                setSubcategories(uniqueSubs);
            })
            .catch(console.error);
    }, [selectedCategory]);

    // Helper: Reset Filters
    const resetFilters = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setMinPrice("");
        setMaxPrice("");
        setDateFilter(undefined);
        setConditionFilters([]);
        setShippingFilter(null);
        setShowMobileFilters(false);
        setVisibleCount(40);
    };

    // Helper: Toggle Condition
    const toggleCondition = (value: string) => {
        setConditionFilters((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
        );
    };

    // Filtering Logic
    const filteredAuctions = auctions.filter((auction) => {
        const product = auction.product;
        if (!product) return false;

        // 1. Category
        if (selectedCategory && product.category_id !== selectedCategory) {
            return false;
        }

        // 1.1 Subcategory
        if (selectedSubcategory && product.subcategory_id !== selectedSubcategory) {
            return false;
        }

        // 2. Price (Current Bid or Starting Price)
        const price = auction.current_bid || auction.starting_price;
        if (minPrice !== "" && price < Number(minPrice)) return false;
        if (maxPrice !== "" && price > Number(maxPrice)) return false;

        // 3. Condition (Estado)
        // Adjust property name based on DB. Assuming product.condition or product.state
        // If product has property 'condition' that matches 'Nuevo', etc.
        if (
            conditionFilters.length > 0 &&
            !conditionFilters.includes(product.condition)
        ) {
            return false;
        }

        // 4. Shipping
        // Assuming product.shipping_active boolean or similar
        // If logic differs, update here.
        if (shippingFilter === "shipping" && !product.shipping_active) return false;
        if (shippingFilter === "person" && product.shipping_active) return false;

        // 5. Date (Publication Date)
        if (dateFilter) {
            const pubDate = new Date(auction.created_at || auction.start_time); // Use appropriate field
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - pubDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (dateFilter === "today" && diffDays > 1) return false;
            if (dateFilter === "7days" && diffDays > 7) return false;
            if (dateFilter === "30days" && diffDays > 30) return false;
        }

        // Only active auctions
        // (Previously getAuctions returned all, but checking end_time is good practice)
        if (new Date(auction.end_time).getTime() <= new Date().getTime())
            return false;

        return true;
    });

    const paginatedAuctions = filteredAuctions.slice(0, visibleCount);

    return (
        <>
            <Navbar />
            <CategoriesBar />

            <div className="filtro-container">
                {/* Mobile Header */}
                <div className="filtro-mobile-header">
                    <h2 className="results-title-mobile">Subastas</h2>
                    <button
                        type="button"
                        className="filtro-toggle-mobile"
                        onClick={() => setShowMobileFilters((prev) => !prev)}
                    >
                        {showMobileFilters ? "Ocultar filtros ▲" : "Mostrar filtros ▼"}
                    </button>
                </div>

                {/* Sidebar */}
                <aside
                    className={`filtro-sidebar ${showMobileFilters ? "filtro-sidebar--open" : ""}`}
                >
                    <div className="filtro-sidebar-header">
                        <h2 className="filtro-title">Filtros</h2>
                        <button
                            type="button"
                            className="filtro-reset-button"
                            onClick={resetFilters}
                        >
                            Reiniciar filtros
                        </button>
                    </div>

                    {/* Categories */}
                    <div className="filtro-block">
                        <h3 className="filtro-subtitle">Categorías</h3>
                        <ul className="filtro-list">
                            {categories.map((cat) => (
                                <li
                                    key={cat.id}
                                    className={selectedCategory === cat.id ? "active" : ""}
                                    onClick={() => {
                                        setSelectedCategory(cat.id);
                                        setSelectedSubcategory(null);
                                    }}
                                >
                                    {cat.name}
                                </li>
                            ))}
                            <li
                                className={`ver-todo ${selectedCategory === null ? "active" : ""}`}
                                onClick={() => {
                                    setSelectedCategory(null);
                                    setSelectedSubcategory(null);
                                }}
                            >
                                Ver todo
                            </li>
                        </ul>
                    </div>

                    {/* Subcategories */}
                    {selectedCategory && subcategories.length > 0 && (
                        <div className="filtro-block">
                            <h3 className="filtro-subtitle">Subcategorías</h3>
                            <ul className="filtro-list">
                                {subcategories.map((sub) => (
                                    <li
                                        key={sub.id}
                                        className={selectedSubcategory === sub.id ? "active" : ""}
                                        onClick={() => setSelectedSubcategory(sub.id)}
                                    >
                                        {sub.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Shipping */}
                    <div className="filtro-block">
                        <h3 className="filtro-subtitle">Opciones de envío</h3>
                        <div className="envio-toggle">
                            <div
                                className={`envio-option ${shippingFilter === "shipping" ? "active" : ""}`}
                                onClick={() =>
                                    setShippingFilter(
                                        shippingFilter === "shipping" ? null : "shipping",
                                    )
                                }
                            >
                                <p className="envio-option-text">Con envío</p>
                            </div>
                            <div
                                className={`envio-option ${shippingFilter === "person" ? "active" : ""}`}
                                onClick={() =>
                                    setShippingFilter(
                                        shippingFilter === "person" ? null : "person",
                                    )
                                }
                            >
                                <p className="envio-option-text">Venta en persona</p>
                            </div>
                        </div>
                    </div>

                    {/* Condition */}
                    <div className="filtro-block">
                        <h3 className="filtro-subtitle">Estado</h3>
                        {[
                            { title: "Nuevo", desc: "Nunca se ha usado" },
                            { title: "Como nuevo", desc: "En perfectas condiciones" },
                            { title: "En buen estado", desc: "Usado pero bien" },
                            { title: "Usado", desc: "Lo ha dado todo" },
                        ].map((item) => (
                            <label key={item.title} className="estado-item">
                                <input
                                    type="checkbox"
                                    className="estado-checkbox"
                                    checked={conditionFilters.includes(item.title)}
                                    onChange={() => toggleCondition(item.title)}
                                />
                                <div className="estado-textos">
                                    <span className="estado-title">{item.title}</span>
                                    <span className="estado-desc">{item.desc}</span>
                                </div>
                            </label>
                        ))}
                    </div>

                    {/* Price */}
                    <div className="filtro-block filtro-precio-inputs">
                        <h3 className="filtro-subtitle">Precio (Puja actual)</h3>
                        <div className="precio-inputs">
                            <input
                                type="number"
                                placeholder="Min"
                                value={minPrice}
                                onChange={(e) =>
                                    setMinPrice(e.target.value ? Number(e.target.value) : "")
                                }
                            />
                            <span className="precio-separador">€</span>
                            <input
                                type="number"
                                placeholder="Max"
                                value={maxPrice}
                                onChange={(e) =>
                                    setMaxPrice(e.target.value ? Number(e.target.value) : "")
                                }
                            />
                            <span className="precio-separador">€</span>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="filtro-block">
                        <h3 className="filtro-subtitle">Fecha de publicación</h3>
                        <ul className="filtro-list">
                            <li
                                className={dateFilter === "today" ? "active" : ""}
                                onClick={() => setDateFilter("today")}
                            >
                                Hoy
                            </li>
                            <li
                                className={dateFilter === "7days" ? "active" : ""}
                                onClick={() => setDateFilter("7days")}
                            >
                                Últimos 7 días
                            </li>
                            <li
                                className={dateFilter === "30days" ? "active" : ""}
                                onClick={() => setDateFilter("30days")}
                            >
                                Últimos 30 días
                            </li>
                            <li
                                className={`ver-todo ${!dateFilter ? "active" : ""}`}
                                onClick={() => setDateFilter(undefined)}
                            >
                                Ver todo
                            </li>
                        </ul>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="filtro-results">
                    <h2
                        className="auctions-title"
                        style={{ textAlign: "left", marginTop: 0 }}
                    >
                        Subastas
                    </h2>

                    {loading ? (
                        <div className="loading-spinner">Cargando subastas...</div>
                    ) : filteredAuctions.length === 0 ? (
                        <div className="no-data">
                            No hay subastas que coincidan con los filtros.
                        </div>
                    ) : (
                        <ul className="products-grid products-grid--filters">
                            {paginatedAuctions.map((auction) => (
                                <li key={auction.id} className="products-grid-item">
                                    <AuctionCard auction={auction} />
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* View More Button */}
                    {!loading && filteredAuctions.length > visibleCount && (
                        <div className="filtro-ver-mas-wrapper">
                            <button
                                type="button"
                                className="filtro-ver-mas-button"
                                onClick={() => setVisibleCount((prev) => prev + 40)}
                            >
                                Ver más
                            </button>
                        </div>
                    )}
                </main>
            </div>
            <Footer />
        </>
    );
}
