import React, { useState, useEffect, useContext } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { AuthContext } from "../../../context/AuthContext";
import { getFinancialStats } from "../../../api/products.api";
import './FinanceStats.css';
import type { FinancialDataPoint } from '../../../types/financialDataPoint';

export default function FinanceStats() {
    const { token } = useContext(AuthContext);

    const [range, setRange] = useState('year');

    // ESTADOS SEPARADOS
    const [chartData, setChartData] = useState<FinancialDataPoint[]>([]); // Array cronológico
    const [globalViews, setGlobalViews] = useState(0); // Dato estático
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                if (!token) return;

                // La respuesta ahora es { chartData: [...], meta: { totalViews: 123 } }
                const response = await getFinancialStats(token, range);

                setChartData(response.chartData || []);
                setGlobalViews(response.meta?.totalViews || 0);

            } catch (error) {
                console.error("Error:", error);
                setChartData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token, range]);

    // --- CÁLCULOS DINÁMICOS BASADOS EN EL RANGO SELECCIONADO ---
    // Sumamos lo que viene en el array temporal
    const totalIngresos = chartData.reduce((acc, curr) => acc + (curr.ingresos || 0), 0);
    const totalGastos = chartData.reduce((acc, curr) => acc + (curr.gastos || 0), 0);
    const totalVentas = chartData.reduce((acc, curr) => acc + (curr.ventas || 0), 0);
    const totalReviews = chartData.reduce((acc, curr) => acc + (curr.reviews || 0), 0);

    const totalBeneficios = totalIngresos - totalGastos;

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
    };

    return (
        <div className="finance-stats-container">

            {/* HEADER */}
            <div className="finance-header">
                <h3>Resumen Financiero</h3>
                <div className="range-selector">
                    <button className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>Semana</button>
                    <button className={range === 'month' ? 'active' : ''} onClick={() => setRange('month')}>Mes</button>
                    <button className={range === 'year' ? 'active' : ''} onClick={() => setRange('year')}>Año</button>
                </div>
            </div>

            {/* GRÁFICO */}
            <div className="chart-wrapper">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>Cargando...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f44336" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#f44336" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />

                            {/* PINTAMOS INGRESOS Y GASTOS */}
                            <Area type="monotone" dataKey="ingresos" stroke="#4caf50" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                            <Area type="monotone" dataKey="gastos" stroke="#f44336" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" name="Gastos" />

                            {/* OPCIONAL: Si quieres pintar reseñas en el gráfico como línea pequeña */}
                            {/* <Area type="monotone" dataKey="reviews" stroke="#8884d8" fill="none" name="Reseñas" /> */}
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <div className="kpi-card profit">
                    <span>Beneficios</span>
                    <h4 style={{ color: totalBeneficios >= 0 ? 'inherit' : '#e74c3c' }}>
                        {formatMoney(totalBeneficios)}€
                    </h4>
                </div>
                <div className="kpi-card profit">
                    <span>Ingresos</span>
                    <h4>{formatMoney(totalIngresos)}€</h4>
                </div>
                <div className="kpi-card expense">
                    <span>Gastos</span>
                    <h4>{formatMoney(totalGastos)}€</h4>
                </div>
                <div className="kpi-card neutral">
                    <span>Ventas</span>
                    <h4>{totalVentas}</h4>
                </div>

                {/* ESTE ES EL ESPECIAL: Muestra el total global siempre */}
                <div className="kpi-card neutral">
                    <span>Visualizaciones (Total)</span>
                    <h4>{globalViews}</h4>
                </div>

                {/* Este sí se filtra por fecha porque el back lo devuelve en chartData */}
                <div className="kpi-card neutral">
                    <span>Reseñas</span>
                    <h4>{totalReviews}</h4>
                </div>
            </div>
        </div>
    );
}