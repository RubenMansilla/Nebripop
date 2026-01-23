import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getMyAuctions, deleteAuction } from '../../../../api/auctions.api';
import { AuthContext } from '../../../../context/AuthContext';
import AuctionCard from './AuctionCard';
import noReviewsImg from '../../../../assets/profile/pop-nothing-for-auction.png';

export default function MyAuctions() {
    const { user } = useContext(AuthContext);
    const [auctions, setAuctions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setLoading(true);
            getMyAuctions(user.id)
                .then(data => setAuctions(data))
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user]);

    const handleDelete = async (auctionId: string | number) => {
        if (!window.confirm("¿Estás seguro de querer eliminar esta subasta? Esta acción no se puede deshacer.")) return;

        try {
            await deleteAuction(auctionId);
            setAuctions(prev => prev.filter(a => a.id !== auctionId));
            alert("Subasta eliminada correctamente");
        } catch (error: any) {
            alert(error.message);
        }
    };

    if (loading) return <div className="loading-container">Cargando...</div>;

    return (
        <>

            {auctions.length === 0 ? (

                <div className="no-reviews" style={{ marginTop: '15px' }}>
                    <img
                        src={noReviewsImg}
                        alt="Sin valoraciones"
                        className="no-reviews-img"
                    />
                    <h3>Nada subastado todavía</h3>
                    <Link to="/profile/auctions/create" className="create-auction-link">¡Crea tu primera subasta aquí!</Link>
                </div>
            ) : (
                <div className="product-container auctions-grid-internal">
                    {auctions.map(auction => (
                        <AuctionCard
                            key={auction.id}
                            auction={auction}
                            user={user}
                            mode="my_auctions"
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
