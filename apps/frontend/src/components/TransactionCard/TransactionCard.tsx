import './TransactionCard.css';
import type { TransactionProps } from '../../types/purchases';

export const TransactionCard: React.FC<TransactionProps> = ({ item, onClick }) => {

    const isExpense = item.transaction_type === 'expense';

    const productImage = item.product?.images?.[0]?.image_url || "/bank-icon-placeholder.png";

    const productName = item.product?.name || `Ref: ${item.id} ****`;

    const formattedDate = new Date(item.purchasedAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short'
    });

    const absolutePrice = Math.abs(Number(item.price));

    const formattedPrice = absolutePrice.toLocaleString('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const sign = isExpense ? '-' : '+';

    return (
        <div className="transaction-card" onClick={onClick}>
            <div className="t-left">
                <div className="t-icon">
                    <img
                        src={productImage}
                        alt="icon"
                    />
                    {isExpense && <span className="status-dot error"></span>}
                </div>
                <div className="t-info">
                    <p className="t-name">
                        {productName}
                    </p>
                    <p className="t-date">
                        {isExpense ? 'Retirada' : 'Ingreso'} · {formattedDate}
                    </p>
                </div>
            </div>
            <div className="t-right">
                <p className={`t-amount ${isExpense ? 'negative' : 'positive'}`}>
                    {sign}{formattedPrice} €
                </p>
            </div>
        </div>
    );
};