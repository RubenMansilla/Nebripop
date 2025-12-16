import React, { useState } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import './FinanceStats.css';

// Datos de ejemplo (Mock Data)
const dataYear = [
    { name: 'Ene', gastos: 400, ingresos: 240, ventas: 10, views: 120, reviews: 2 },
    { name: 'Feb', gastos: 300, ingresos: 139, ventas: 20, views: 200, reviews: 4 },
    { name: 'Mar', gastos: 200, ingresos: 980, ventas: 50, views: 450, reviews: 10 },
    { name: 'Abr', gastos: 278, ingresos: 390, ventas: 30, views: 310, reviews: 5 },
    { name: 'May', gastos: 189, ingresos: 480, ventas: 40, views: 380, reviews: 6 },
    { name: 'Jun', gastos: 239, ingresos: 380, ventas: 35, views: 360, reviews: 3 },
    { name: 'Jul', gastos: 349, ingresos: 430, ventas: 42, views: 400, reviews: 8 },
];

const dataMonth = [
    { name: 'Sem 1', gastos: 100, ingresos: 120, ventas: 5, views: 50, reviews: 1 },
    { name: 'Sem 2', gastos: 150, ingresos: 200, ventas: 8, views: 80, reviews: 2 },
    { name: 'Sem 3', gastos: 80, ingresos: 350, ventas: 12, views: 150, reviews: 3 },
    { name: 'Sem 4', gastos: 200, ingresos: 180, ventas: 6, views: 90, reviews: 1 },
];

const dataWeek = [
    { name: 'Lun', gastos: 20, ingresos: 50, ventas: 2, views: 10, reviews: 0 },
    { name: 'Mar', gastos: 30, ingresos: 40, ventas: 1, views: 15, reviews: 0 },
    { name: 'Mie', gastos: 10, ingresos: 80, ventas: 4, views: 30, reviews: 0 },
    { name: 'Jue', gastos: 50, ingresos: 60, ventas: 3, views: 25, reviews: 0 },
    { name: 'Vie', gastos: 40, ingresos: 100, ventas: 5, views: 40, reviews: 0 },
    { name: 'Sab', gastos: 80, ingresos: 150, ventas: 8, views: 60, reviews: 0 },
    { name: 'Dom', gastos: 60, ingresos: 120, ventas: 6, views: 50, reviews: 0 },
];

export default function FinanceStats() {
    const [range, setRange] = useState('year'); // 'week', 'month', 'year'

    // Seleccionar datos según el rango
    const getData = () => {
        if (range === 'week') return dataWeek;
        if (range === 'month') return dataMonth;
        return dataYear;
    };

    const currentData = getData();

    // Calcular totales para las tarjetas de abajo
    const totalIngresos = currentData.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalGastos = currentData.reduce((acc, curr) => acc + curr.gastos, 0);
    const totalVentas = currentData.reduce((acc, curr) => acc + curr.ventas, 0);
    const totalViews = currentData.reduce((acc, curr) => acc + curr.views, 0);
    const totalReviews = currentData.reduce((acc, curr) => acc + (curr.reviews || 0), 0);
    const totalBeneficios = totalIngresos - totalGastos;


    return (
        <div className="finance-stats-container">

            {/* 1. HEADER CON FILTROS */}
            <div className="finance-header">
                <h3>Resumen Financiero</h3>
                <div className="range-selector">
                    <button
                        className={range === 'week' ? 'active' : ''}
                        onClick={() => setRange('week')}>Semana</button>
                    <button
                        className={range === 'month' ? 'active' : ''}
                        onClick={() => setRange('month')}>Mes</button>
                    <button
                        className={range === 'year' ? 'active' : ''}
                        onClick={() => setRange('year')}>Año</button>
                </div>
            </div>

            {/* 2. GRÁFICO (RECHARTS) */}
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#999' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#999' }}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="ingresos"
                            stroke="#4caf50"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIngresos)"
                            name="Ganancias"
                        />
                        <Area
                            type="monotone"
                            dataKey="gastos"
                            stroke="#f44336"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorGastos)"
                            name="Gastos"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 3. TARJETAS DE RESUMEN (KPIs) */}
            <div className="kpi-grid">
                <div className="kpi-card profit">
                    <span>Beneficios</span>
                    {/* Mostramos el cálculo real */}
                    <h4>{totalBeneficios}€</h4>
                </div>
                <div className="kpi-card profit">
                    <span>Ingresos</span>
                    <h4>{totalIngresos}€</h4>
                </div>
                <div className="kpi-card expense">
                    <span>Gastos</span>
                    <h4>{totalGastos}€</h4>
                </div>
                <div className="kpi-card neutral"> {/* Color nuevo para distinguir */}
                    <span>Ventas</span>
                    <h4>{totalVentas}</h4>
                </div>
                <div className="kpi-card neutral">
                    <span>Visualizaciones</span>
                    <h4>{totalViews}</h4>
                </div>
                <div className="kpi-card neutral"> {/* Color nuevo para distinguir */}
                    <span>Reseñas</span>
                    <h4>{totalReviews}</h4>
                </div>
            </div>

        </div>
    );
}