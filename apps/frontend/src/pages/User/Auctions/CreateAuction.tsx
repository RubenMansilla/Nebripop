import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAuction, getMyAuctions } from '../../../api/auctions.api';
import { getMyActiveProducts } from '../../../api/products.api';
import { AuthContext } from '../../../context/AuthContext';
import './Auctions.css';

export default function CreateAuction() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [startPrice, setStartPrice] = useState('');
    const [duration, setDuration] = useState('24');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            Promise.all([getMyActiveProducts(), getMyAuctions(user.id)])
                .then(([productsData, auctionsData]) => {
                    const auctionedProductIds = new Set(auctionsData.map((a: any) => a.product.id));
                    const availableProducts = productsData.filter((p: any) => !auctionedProductIds.has(p.id));
                    setProducts(availableProducts);
                })
                .catch(err => console.error("Error loading products", err));
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createAuction(selectedProduct, Number(startPrice), Number(duration));
            alert('Subasta creada con éxito!');
            navigate('/profile/auctions');
        } catch (error) {
            console.error(error);
            alert('Error al crear la subasta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auctions-container" style={{ maxWidth: '600px' }}>
            <h2 className="auctions-title">Crear nueva subasta</h2>
            <div className="bidding-box">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#333' }}>Selecciona un producto</label>
                        <select
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                            required
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        >
                            <option value="">-- Seleccionar --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {p.price}€</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>Solo se muestran tus productos activos que no se han vendido.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#333' }}>Precio de salida (€)</label>
                        <input
                            type="number"
                            value={startPrice}
                            onChange={e => setStartPrice(e.target.value)}
                            required
                            min="1"
                            className="bid-input"
                            placeholder="Ej. 50"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontWeight: 600, color: '#333' }}>Duración</label>
                        <select
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1rem' }}
                        >
                            <option value="12">12 Horas</option>
                            <option value="24">24 Horas</option>
                            <option value="48">48 Horas</option>
                            <option value="72">3 Días</option>
                            <option value="168">1 Semana</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selectedProduct}
                        className="bid-btn"
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? 'Creando...' : 'Comenzar Subasta'}
                    </button>
                </form>
            </div>
        </div>
    );
}
