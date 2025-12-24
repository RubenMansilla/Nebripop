import "./Balance.css";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BiPlus, BiQrScan, BiBuildingHouse } from "react-icons/bi";
import RechargeModal from "../../../../components/RechargeModal/RechargeModal";
import ATMWithdraw from "../../../../components/ATMWithdraw/ATMWithdraw";

export default function Balance() {

    const [balance, setBalance] = useState(1000);

    const navigate = useNavigate();
    const [selected, setSelected] = useState("monedero");
    const [showModal, setShowModal] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);

    useEffect(() => {
        if (selected === "datos") navigate("/wallet/bank-details");
        if (selected === "historial") navigate("/wallet/history");
    }, [selected, navigate]);

    const handleRechargeConfirm = (amount: number) => {
        console.log(`Procesando recarga de: ${amount}€`);
        setBalance(prev => prev + amount);
    };

    // Función que actualiza el estado principal
    const handleWithdraw = (amountToWithdraw: number) => {
        setBalance(prevBalance => prevBalance - amountToWithdraw);
    };

    // 1. Convertimos el número a string con 2 decimales fijos (ej: "1000.00" o "1000.50")
    const balanceFixed = balance.toFixed(2);

    // 2. Separamos por el punto (JavaScript usa punto internamente)
    const [integerPart, decimalPart] = balanceFixed.split('.');

    // 3. Formateamos la parte entera para que tenga puntos de miles (ej: 1.000)
    const integerFormatted = Number(integerPart).toLocaleString('es-ES');

    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title"><h1>Monedero</h1></div>
                    <div className="description">
                        <p>Gestiona tu monedero y controla tus finanzas personales de manera sencilla y segura.</p>
                    </div>
                </div>
            </div>

            <div className="info-selector">
                <div className="info-items-wallet">
                    <div className={`info-item-wallet ${selected === "monedero" ? "active" : ""}`} onClick={() => setSelected("monedero")}><p>Monedero</p></div>
                    <div className={`info-item-wallet ${selected === "datos" ? "active" : ""}`} onClick={() => setSelected("datos")}><p>Datos</p></div>
                    <div className={`info-item-wallet ${selected === "historial" ? "active" : ""}`} onClick={() => setSelected("historial")}><p>Historial</p></div>
                </div>
            </div>

            <div className="balance-content">
                <div className="balance-total">
                    <span className="amount-integer">{integerFormatted}</span>
                    <span className="amount-decimal">,{decimalPart}€</span>
                </div>

                <div className="balance-actions">
                    <div className="action-btn-container" onClick={() => setShowModal(true)}>
                        <button className="circle-btn"><BiPlus size={32} /></button>
                        <span className="action-label">Recargar</span>
                    </div>
                    <div className="action-btn-container">
                        <button className="circle-btn"><BiQrScan size={28} /></button>
                        <span className="action-label">Cobrar</span>
                    </div>
                    <div className="action-btn-container" onClick={() => setShowWithdraw(true)}>
                        <button className="circle-btn"><BiBuildingHouse size={28} /></button>
                        <span className="action-label">Retirar</span>
                    </div>
                </div>
            </div>

            <RechargeModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleRechargeConfirm}
            />

            <ATMWithdraw
                isOpen={showWithdraw}
                onClose={() => setShowWithdraw(false)}
                balance={balance}
                onWithdraw={handleWithdraw}
            />
        </>
    )
}