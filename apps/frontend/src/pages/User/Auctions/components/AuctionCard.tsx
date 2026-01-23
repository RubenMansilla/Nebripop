import { Link } from 'react-router-dom';

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
                <h3 className="auction-name">{auction.product?.name}</h3>
                <div className="auction-status-row">
                    <span className="card-price-text">{auction.current_bid || auction.starting_price}€</span>
                    <span className="card-status-text">
                        {auction.status === 'active' ? calculateTimeLeft(auction.end_time) :
                            auction.status === 'awaiting_payment' ? 'Esperando Pago' :
                                auction.status === 'sold' ? 'VENDIDO' : 'EXPIRADO'}
                    </span>
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
