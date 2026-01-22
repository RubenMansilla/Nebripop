
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyAuctions, getMyAuctionHistory, deleteAuction, getParticipatingAuctions } from '../../../api/auctions.api';
import { AuthContext } from '../../../context/AuthContext';
import './Auctions.css';

export default function AuctionsManager() {
    const { user } = useContext(AuthContext);
    const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
    const [participatingAuctions, setParticipatingAuctions] = useState<any[]>([]);
    const [historyAuctions, setHistoryAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'participating' | 'history'>('active');

    useEffect(() => {
        if (user) {
            setLoading(true);
            let fetchFn;

            if (activeTab === 'active') fetchFn = () => getMyAuctions(user.id);
            else if (activeTab === 'participating') fetchFn = () => getParticipatingAuctions(user.id);
            else fetchFn = () => getMyAuctionHistory(user.id);

            fetchFn()
                .then(data => {
                    if (activeTab === 'active') setActiveAuctions(data);
                    else if (activeTab === 'participating') setParticipatingAuctions(data);
                    else setHistoryAuctions(data);
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user, activeTab]);

    const handleDelete = async (auctionId: string | number) => {
        if (!window.confirm("¿Estás seguro de querer eliminar esta subasta? Esta acción no se puede deshacer.")) return;

        try {
            await deleteAuction(auctionId);
            setActiveAuctions(prev => prev.filter(a => a.id !== auctionId));
            alert("Subasta eliminada correctamente");
        } catch (error: any) {
            alert(error.message);
        }
    };

    // Helper calculate time
    const calculateTimeLeft = (endTime: string) => {
        const end = new Date(endTime).getTime();
        const now = new Date().getTime();
        const diff = end - now;
        if (diff <= 0) return 'Finalizada';
        const hours = Math.floor(diff / (1000 * 60 * 60));
        return `${hours}h rest`;
    };

    let currentAuctions: any[] = [];
    if (activeTab === 'active') currentAuctions = activeAuctions;
    else if (activeTab === 'participating') currentAuctions = participatingAuctions;
    else currentAuctions = historyAuctions;

    const getTitle = () => {
        if (activeTab === 'active') return 'Mis Subastas Creadas';
        if (activeTab === 'participating') return 'Subastas en las que participo';
        return 'Historial de Subastas';
    };

    const getDescription = () => {
        if (activeTab === 'active') return "Gestiona las subastas que has creado.";
        if (activeTab === 'participating') return "Consulta y sigue las subastas donde has pujado.";
        return "Consulta tus subastas finalizadas o canceladas.";
    };

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>{getTitle()}</h1>
                    </div>
                    <div className="description">
                        <p>{getDescription()}</p>
                    </div>
                </div>
            </div>

            <div className="info-selector">
                <div className="info-items">
                    <div
                        className={`info-item ${activeTab === 'active' ? 'active' : ''} `}
                        onClick={() => setActiveTab('active')}
                    >
                        <p>Mis Subastas</p>
                    </div>
                    <div
                        className={`info-item ${activeTab === 'participating' ? 'active' : ''} `}
                        onClick={() => setActiveTab('participating')}
                    >
                        <p>Subastas Activas</p>
                    </div>
                    <div
                        className={`info-item ${activeTab === 'history' ? 'active' : ''} `}
                        onClick={() => setActiveTab('history')}
                    >
                        <p>Historial</p>
                    </div>
                </div>
            </div>

            {/* Create Button floated */}
            {activeTab === 'active' && (
                <div style={{ maxWidth: '1440px', margin: '20px auto', padding: '0 25px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to="/profile/auctions/create">
                        <button className="btn-create">
                            + Nueva Subasta
                        </button>
                    </Link>
                </div>
            )}

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Cargando...</div>
            ) : currentAuctions.length === 0 ? (
                <div className="no-reviews">
                    <div style={{ textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '12px', margin: '0 20px' }}>
                        <p style={{ color: '#666', marginBottom: '20px' }}>No hay subastas en esta sección.</p>
                        {activeTab === 'active' &&
                            <Link to="/profile/auctions/create" style={{ color: '#00a0a0', fontWeight: 600 }}>¡Crea tu primera subasta!</Link>
                        }
                    </div>
                </div>
            ) : (
                <div className="product-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', padding: '20px', maxWidth: '1440px', margin: '0 auto' }}>
                    {currentAuctions.map(auction => (
                        <div key={auction.id} className="auction-card-public">
                            <div className="auction-card-img-wrapper" style={{ height: '220px' }}>
                                <img src={auction.product?.images?.[0]?.image_url || "/no-image.webp"} alt={auction.product?.name} />
                            </div>
                            <div className="auction-card-content">
                                <h3 className="auction-name" style={{ fontSize: '1rem' }}>{auction.product?.name}</h3>
                                <div className="auction-status-row">
                                    <span style={{ fontWeight: 'bold', color: '#00a0a0' }}>{auction.current_bid || auction.starting_price}€</span>
                                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {auction.status === 'active' ? calculateTimeLeft(auction.end_time) :
                                            auction.status === 'awaiting_payment' ? 'Esperando Pago' :
                                                auction.status === 'sold' ? 'VENDIDO' : 'EXPIRADO'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    <Link to={`/auction/${auction.id} `} style={{ flex: 1, textAlign: 'center', color: '#253238', fontWeight: 600, fontSize: '0.9rem', padding: '8px', background: '#f5f5f5', borderRadius: '8px', textDecoration: 'none' }}>Ver</Link>

                                    {activeTab === 'active' && (
                                        <button
                                            onClick={() => handleDelete(auction.id)}
                                            style={{ flex: 1, border: 'none', background: '#e5393520', color: '#e53935', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            Borrar
                                        </button>
                                    )}

                                    {activeTab === 'participating' && auction.status === 'awaiting_payment' && user && auction.winner_id === user.id && (
                                        <Link to={`/checkout?auctionId=${auction.id}`} style={{ flex: 1, textAlign: 'center', color: 'white', fontWeight: 600, fontSize: '0.9rem', padding: '8px', background: '#00a0a0', borderRadius: '8px', textDecoration: 'none' }}>
                                            Pagar
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

