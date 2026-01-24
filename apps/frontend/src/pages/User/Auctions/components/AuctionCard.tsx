import { Link } from 'react-router-dom';
import '../../../../components/AuctionCard/AuctionCard.css';

interface AuctionCardProps {
    auction: any;
    user: any;
    mode: 'my_auctions' | 'active_auctions' | 'history';
    onDelete?: (id: number) => void;
}

export default function AuctionCard({ auction, user, mode, onDelete }: AuctionCardProps) {

    const calculateTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;
        if (diff <= 0) return 'Finalizada';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return `${hours}h rest`;
    };

    return (
        <div className="auction-card-public">
            <div className="auction-card-img-wrapper">
                <img src={auction.product?.images?.[0]?.image_url || "/no-image.webp"} alt={auction.product?.name} />
            </div>
            <div className="auction-card-content">
                <div className="auction-card-header">
                    <h3 className="auction-name">{auction.product?.name}</h3>
                </div>
                <div className="auction-status-row">
                    <div>
                        <p className="current-bid-label">Puja actual</p>
                        <p className="current-bid-amount">{auction.current_bid || auction.starting_price}€</p>
                    </div>
                    <div>
                        <div className="time-left-badge" style={{ fontSize: '0.8rem', padding: '4px 8px' }}>
                            {auction.status === 'active' ? calculateTimeLeft(auction.end_time) :
                                auction.status === 'awaiting_payment' ? 'Esperando Pago' :
                                    auction.status === 'sold' ? 'VENDIDO' : 'EXPIRADO'}
                        </div>
                    </div>
                </div>

                <div className="card-actions">
                    <Link to={`/auction/${auction.id}`} className="btn-action btn-view">Ver</Link>

                    {mode === 'my_auctions' && onDelete && (
                        <button
                            onClick={() => onDelete(auction.id)}
                            className="btn-action btn-delete"
                        >
                            Borrar
                        </button>
                    )}

                    {mode === 'active_auctions' && auction.status === 'awaiting_payment' && user && auction.winner_id === user.id && (
                        <Link to={`/checkout?auctionId=${auction.id}`} className="btn-action btn-pay">
                            Pagar
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
