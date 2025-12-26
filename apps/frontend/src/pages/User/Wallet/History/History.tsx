import './History.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo, useContext } from 'react';
import { fetchMyTransactions } from '../../../../api/purchases.api';
import { AuthContext } from '../../../../context/AuthContext';
import { TransactionCard } from '../../../../components/TransactionCard/TransactionCard';
import { TransactionCardSkeleton } from '../../../../components/TransactionCard/Skeleton/TransactionCardSkeleton';

// Función auxiliar para capitalizar meses (mayo -> Mayo)
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function History() {

    const navigate = useNavigate();
    const [selected, setSelected] = useState("historial");
    const [activeFilter, setActiveFilter] = useState("Todo");
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        if (selected === "datos") {
            navigate("/wallet/bank-details");
        }
        if (selected === "monedero") {
            navigate("/wallet/balance");
        }
    }, [selected, navigate]);

    // Efecto para cargar datos cuando cambia el filtro
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            if (!token) return;

            // Mapeamos el filtro visual al filtro de la API
            let apiFilter: 'all' | 'in' | 'out' = 'all';
            if (activeFilter === 'Entradas') apiFilter = 'in';
            if (activeFilter === 'Salidas') apiFilter = 'out';

            const data = await fetchMyTransactions(token, apiFilter);
            setTransactions(data);
            setLoading(false);
        };
        loadData();
    }, [activeFilter]);

    // Lógica de Agrupación (Memoizada para rendimiento)
    const groupedHistory = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};

        transactions.forEach((t) => {
            const date = new Date(t.purchasedAt);
            const year = date.getFullYear().toString();
            // Obtenemos el mes en texto (ej: "mayo")
            const month = date.toLocaleString('es-ES', { month: 'long' });

            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];

            groups[year][month].push(t);
        });

        return groups;
    }, [transactions]);

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Monedero</h1>
                    </div>
                    <div className="description">
                        <p>Gestiona tu monedero y controla tus finanzas personales de manera sencilla y segura.</p>
                    </div>
                </div>
            </div>
            <div className="info-selector">
                <div className="info-items-wallet">
                    <div className={`info-item-wallet ${selected === "monedero" ? "active" : ""}`} onClick={() => setSelected("monedero")}><p>Monedero</p></div>
                    <div className={`info-item-wallet ${selected === "datos" ? "active" : ""}`} onClick={() => setSelected("datos")}><p>Datos</p></div>
                    <div className={`info-item-wallet ${selected === "historial" ? "active" : ""}`} onClick={() => setSelected("historial")}><p>Historial</p></div>
                </div>
            </div>
            <div className="history-content">
                <div className="history-filters">
                    {['Todo', 'Entradas', 'Salidas'].map(filter => (
                        <div
                            key={filter}
                            className={`filter ${activeFilter === filter ? "active" : ""}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            <p>{filter}</p>
                        </div>
                    ))}
                </div>
                <div className="history-list">
                    {loading ? (
                        [...Array(5)].map((_, index) => (
                            <TransactionCardSkeleton key={index} />
                        ))
                    ) : transactions.length === 0 ? (
                        <p className="no-history-content">No hay resultados</p>
                    ) : (
                        Object.entries(groupedHistory).map(([year, months]) => (
                            <div key={year} className="year-group">
                                <h2 className="year-title">{year}</h2>
                                {Object.entries(months).map(([month, items]) => (
                                    <div key={month} className="month-group">
                                        <h3 className="month-title">{capitalize(month)}</h3>
                                        <div className="transactions-container">
                                            {items.map((item: any) => (
                                                <TransactionCard
                                                    key={item.id}
                                                    item={item}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    )
}
