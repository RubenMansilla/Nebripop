import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './FinanceStats.css';
import type { FinancialDataPoint } from '../../../types/financialDataPoint';

// Props de FinanceStats
interface FinanceProps {
    data: FinancialDataPoint[];
    globalViews: number;
    range: string;
    setRange: (range: string) => void;
}

export default function FinanceStats({ data, globalViews, range, setRange }: FinanceProps) {

    // CALCULAMOS TOTALES EN BASE A LOS DATOS RECIBIDOS
    const totalIngresos = data.reduce((acc, curr) => acc + (curr.ingresos || 0), 0);
    const totalGastos = data.reduce((acc, curr) => acc + (curr.gastos || 0), 0);
    const totalVentas = data.reduce((acc, curr) => acc + (curr.ventas || 0), 0);
    const totalReviews = data.reduce((acc, curr) => acc + (curr.reviews || 0), 0);

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
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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

                        <Area type="monotone" dataKey="ingresos" stroke="#4caf50" strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                        <Area type="monotone" dataKey="gastos" stroke="#f44336" strokeWidth={3} fillOpacity={1} fill="url(#colorGastos)" name="Gastos" />

                    </AreaChart>
                </ResponsiveContainer>
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
                <div className="kpi-card neutral">
                    <span>Visualizaciones (Total)</span>
                    <h4>{globalViews}</h4>
                </div>
                <div className="kpi-card neutral">
                    <span>Reseñas</span>
                    <h4>{totalReviews}</h4>
                </div>
            </div>
        </div>
    );
}