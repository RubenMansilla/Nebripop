import { useState, useEffect } from 'react';
import { BiX, BiCreditCard } from "react-icons/bi";
import "./RechargeModal.css";

interface RechargeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number) => void;
}

export default function RechargeModal({ isOpen, onClose, onConfirm }: RechargeModalProps) {

    const [amount, setAmount] = useState("");
    const quickAmounts = ["20", "50", "100"];

    useEffect(() => {
        if (isOpen) {
            setAmount("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount) {
            onConfirm(Number(amount));
            onClose();
        }
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const regex = /^\d*(\.\d{0,2})?$/;
        if (regex.test(val)) {
            setAmount(val);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const invalidChars = ["-", "+", "e", "E"];
        if (invalidChars.includes(e.key)) {
            e.preventDefault();
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <div className="modal-header">
                    <h3>Recargar saldo</h3>
                    <button className="close-btn-simple" onClick={onClose}>
                        <BiX size={26} />
                    </button>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="modal-form">
                        <div>
                            <label className="input-label">Importe a añadir</label>
                            <div className="currency-input-container">
                                <span className="currency-prefix">€</span>
                                <input
                                    className="currency-input"
                                    type="number"
                                    placeholder="0"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    onKeyDown={handleKeyDown}
                                    step="0.01"
                                    min="0"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="quick-select">
                            {quickAmounts.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className="quick-btn"
                                    onClick={() => setAmount(val)}
                                >
                                    {val} €
                                </button>
                            ))}
                        </div>

                        <div className="payment-method-info">
                            <div className="card-icon">
                                <BiCreditCard size={24} />
                            </div>
                            <div className="card-details">
                                <span className="card-name">Tarjeta **** 4242</span>
                                <span className="card-sub">Sin comisiones</span>
                            </div>
                            <span className="change-btn">Cambiar</span>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-secondary" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="submit" className="btn-primary-recharge" disabled={!amount}>
                                Confirmar pago
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}