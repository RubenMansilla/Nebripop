import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, placeBid, payAuction } from '../../api/auctions.api';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CategoriesBar from '../../components/CategoriesBar/CategoriesBar';
import { AuthContext } from '../../context/AuthContext';
import { useLoginModal } from '../../context/LoginModalContext';
import '../User/Auctions/Auctions.css';

export default function AuctionDetail() {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const { openLogin } = useLoginModal();

    const [auction, setAuction] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');

    useEffect(() => {
        if (id) {
            loadAuction();
        }
    }, [id]);

    const loadAuction = () => {
        getAuctionById(id!)
            .then(data => setAuction(data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleBid = async (e: React.FormEvent) => {
        e.preventDefault();
        setBidError('');

        if (!user) {
            openLogin();
            return;
        }

        const currentVal = Number(auction.current_bid || auction.starting_price);
        const amount = Number(bidAmount);

        if (amount <= currentVal) {
            setBidError('La puja debe ser mayor a la actual');
            return;
        }

        try {
            await placeBid(auction.id, amount, user);
            setBidAmount('');
            alert('Puja realizada con éxito');
            loadAuction(); // Refresh data
        } catch (error: any) {
            setBidError(error.message || 'Error al realizar la puja');
        }
    };

    const handlePayment = async () => {
        if (!confirm('¿Confirmar pago de la subasta?')) return;
        try {
            await payAuction(auction.id);
            alert('Pago realizado con éxito');
            loadAuction();
        } catch (error: any) {
            alert(error.message || 'Error al procesar el pago');
        }
    };

    const calculateTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;
        if (diff <= 0) return 'Finalizada';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (loading) return <div>Cargando...</div>;
    if (!auction) return <div>Subasta no encontrada</div>;

    const currentPrice = auction.current_bid > 0 ? auction.current_bid : auction.starting_price;
    const minBid = Number(currentPrice) + 1;

    return (
        <>
            <Navbar />
            <CategoriesBar />

            <div className="auction-detail-container">
                {/* Gallery */}
                <div className="detail-gallery">
                    <img
                        src={auction.product?.images?.[0]?.image_url || "/no-image.webp"}
                        alt="Producto"
                    />
                </div>

                {/* Info */}
                <div className="detail-info">
                    <h1 className="detail-product-name">{auction.product?.name}</h1>
                    <p className="detail-desc">{auction.product?.description || "Sin descripción disponible."}</p>

                    <div className="bidding-box">
                        <div className="bid-header">
                            <div>
                                <p className="bid-label">Oferta actual</p>
                                <p className="bid-value">{currentPrice}€</p>
                            </div>
                            <div>
                                <p className="bid-label" style={{ textAlign: 'right' }}>
                                    {auction.status === 'active' ? 'Tiempo restante' : 'Estado'}
                                </p>
                                <div className="time-left-badge" style={{ marginTop: '5px', fontSize: '1rem', color: auction.status === 'active' ? 'black' : '#e53935' }}>
                                    {auction.status === 'active' ? calculateTimeLeft(auction.end_time) :
                                        auction.status === 'awaiting_payment' ? 'Esperando Pago' :
                                            auction.status === 'sold' ? 'VENDIDO' : 'EXPIRADO'}
                                </div>
                            </div>
                        </div>

                        {auction.status === 'active' && (
                            <>
                                <form className="bid-form" onSubmit={handleBid}>
                                    <input
                                        className="bid-input"
                                        type="number"
                                        placeholder={`Pujar ${minBid}€ o más`}
                                        value={bidAmount}
                                        onChange={e => setBidAmount(e.target.value)}
                                        min={minBid}
                                    />
                                    <button className="bid-btn" type="submit">
                                        Pujar
                                    </button>
                                </form>
                                {bidError && <p style={{ color: '#e53935', marginTop: '10px', fontSize: '0.9rem' }}>{bidError}</p>}
                            </>
                        )}

                        {auction.status === 'awaiting_payment' && (
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                {user && auction.winner_id === user.id ? (
                                    <>
                                        <p style={{ color: '#00a0a0', fontWeight: 'bold', marginBottom: '10px' }}>¡Has ganado la subasta!</p>
                                        <button
                                            className="bid-btn"
                                            style={{ backgroundColor: '#00a0a0' }}
                                            onClick={handlePayment}
                                        >
                                            Pagar Ahora
                                        </button>
                                    </>
                                ) : (
                                    <p style={{ color: '#666' }}>El ganador está procesando el pago.</p>
                                )}
                            </div>
                        )}

                        {auction.status === 'sold' && (
                            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#2e7d32', fontWeight: 'bold', fontSize: '1.2rem' }}>¡Vendido!</p>
                            </div>
                        )}
                    </div>

                    <div className="bid-history-list">
                        <h3 className="history-title">Historial de pujas ({auction.bids?.length || 0})</h3>
                        {(!auction.bids || auction.bids.length === 0) ? (
                            <p style={{ color: '#888' }}>Sé el primero en pujar por este artículo.</p>
                        ) : (
                            <div>
                                {auction.bids.map((bid: any) => (
                                    <div key={bid.id} className="history-item">
                                        <span className="history-user">{bid.bidder?.fullName || "Usuario"}</span>
                                        <div className="history-meta">
                                            <span>{new Date(bid.created_at).toLocaleTimeString()}</span>
                                            <span className="history-amount">{bid.amount}€</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}
