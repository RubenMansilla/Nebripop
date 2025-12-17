import './FinanceSkeleton.css'

export default function FinanceStatsSkeleton() {
    return (
        <div className="finance-stats-container">
            <div className="finance-header">
                <div className="skeleton" style={{ width: '180px', height: '24px', borderRadius: '4px' }}></div>
                <div className="skeleton" style={{ width: '200px', height: '32px', borderRadius: '8px' }}></div>
            </div>
            <div className="chart-wrapper">
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '8px' }}></div>
            </div>
            <div className="kpi-grid">
                {[...Array(6)].map((_, i) => (
                    <div className="kpi-card" key={i}>
                        <div className="skeleton" style={{ width: '40%', height: '14px', marginBottom: '8px' }}></div>
                        <div className="skeleton" style={{ width: '70%', height: '28px', borderRadius: '4px' }}></div>
                    </div>
                ))}
            </div>
        </div>
    );
};