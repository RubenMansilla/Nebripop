
import { useState, useEffect, useContext } from 'react';
import { createAuction, getMyAuctions } from '../../../../api/auctions.api';
import { getMyActiveProducts } from '../../../../api/products.api';
import { AuthContext } from '../../../../context/AuthContext';
import './CreateAuctionModal.css';

interface CreateAuctionModalProps {
    onClose: () => void;
    onAuctionCreated: () => void;
}

export default function CreateAuctionModal({ onClose, onAuctionCreated }: CreateAuctionModalProps) {
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
            onAuctionCreated();
            onClose();
        } catch (error) {
            console.error(error);
            alert('Error al crear la subasta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-auction-card modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={onClose}><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m16.192 6.344-4.243 4.242-4.242-4.242-1.414 1.414L10.535 12l-4.242 4.242 1.414 1.414 4.242-4.242 4.243 4.242 1.414-1.414L13.364 12l4.242-4.242z"></path></svg></button>
                <h2 className="create-auction-title">Crear nueva subasta</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div className="create-form-group">
                        <label className="create-form-label">Selecciona un producto</label>
                        <select
                            className="create-form-select"
                            value={selectedProduct}
                            onChange={e => setSelectedProduct(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar producto</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} - {p.price}€</option>
                            ))}
                        </select>
                        <p className="create-form-helper">Solo se muestran tus productos activos que no se han vendido.</p>
                    </div>

                    <div className="create-form-group">
                        <label className="create-form-label">Precio de salida (€)</label>
                        <input
                            type="number"
                            className="create-form-input"
                            value={startPrice}
                            onChange={e => setStartPrice(e.target.value)}
                            required
                            min="1"
                            placeholder="Ej. 50"
                        />
                    </div>

                    <div className="create-form-group">
                        <label className="create-form-label">Duración</label>
                        <select
                            className="create-form-select"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
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
                        disabled={loading || !selectedProduct || !startPrice}
                        className="btn-create-auction"
                    >
                        Comenzar Subasta
                    </button>
                </form>
            </div>
        </div>
    );
}
