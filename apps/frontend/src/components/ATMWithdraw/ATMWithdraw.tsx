import React, { useState, useEffect } from 'react';
import './ATMWithdraw.css';
import { BiX } from "react-icons/bi";

interface ATMWithdrawProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    onWithdraw: (amount: number) => void;
}

export default function ATMWithdraw({ isOpen, onClose, balance, onWithdraw }: ATMWithdrawProps) {

    const [amount, setAmount] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setErrorMsg('');
        }
    }, [isOpen]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;

        const regex = /^\d*([.,]\d{0,2})?$/;

        if (value === '' || regex.test(value)) {
            setAmount(value);
        }
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const normalizedAmount = amount.replace(',', '.');
        const withdrawValue = Number(normalizedAmount);
        if (!withdrawValue || withdrawValue <= 0) {
            setErrorMsg('El monto debe ser mayor a 0');
            return;
        }

        if (withdrawValue > balance) {
            setErrorMsg('Fondos insuficientes');
            return;
        }

        onWithdraw(withdrawValue);

        setAmount('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="atm-overlay" onClick={onClose}>
            <div className="atm-modal" onClick={(e) => e.stopPropagation()}>

                <button className="atm-close-btn" onClick={onClose}>
                    <BiX size={24} />
                </button>

                <h2 className="atm-title">Retirar Fondos</h2>

                <div className="atm-balance-container">
                    <div className="atm-balance-pill">
                        <span>Saldo disponible:</span>
                        <strong>{balance.toFixed(2).replace('.', ',')}€</strong>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="atm-input-wrapper">
                        <input
                            type="text"
                            inputMode="decimal"
                            className="atm-input"
                            value={amount}
                            onChange={handleChange}
                            placeholder="0,00"
                            autoFocus
                            autoComplete="off"
                        />
                        <span className="atm-currency-symbol">€</span>
                    </div>

                    <button
                        type="submit"
                        className="atm-submit-btn"
                        disabled={!amount || Number(amount.replace(',', '.')) <= 0}
                    >
                        Confirmar Retiro
                    </button>
                </form>

                {errorMsg && (
                    <div className="atm-status error">
                        {errorMsg}
                    </div>
                )}
            </div>
        </div>
    );
}