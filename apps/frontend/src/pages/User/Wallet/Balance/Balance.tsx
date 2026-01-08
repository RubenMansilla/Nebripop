import "./Balance.css";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import { BiPlus, BiQrScan, BiBuildingHouse } from "react-icons/bi";
import RechargeModal from "../../../../components/RechargeModal/RechargeModal";
import ATMWithdraw from "../../../../components/ATMWithdraw/ATMWithdraw";
import ReceiveModal from "../../../../components/ReceiveModal/ReceiveModal";
import { getWalletBalance, depositMoney, withdrawMoney } from "../../../../api/wallet.api";
import { AuthContext } from "../../../../context/AuthContext";
import { toast } from "react-toastify";
import { useNotificationSettings } from '../../../../context/NotificationContext';

export default function Balance() {

    const { notify } = useNotificationSettings();

    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const { token } = useContext(AuthContext);

    const navigate = useNavigate();
    const [selected, setSelected] = useState("monedero");

    const [showModal, setShowModal] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showReceive, setShowReceive] = useState(false);

    useEffect(() => {
        if (token) {
            setLoading(true);
            getWalletBalance(token)
                .then((data) => {
                    setBalance(Number(data.balance));
                })
                .catch((err) => {
                    console.error("Error cargando saldo:", err);
                    toast.error("Error al cargar el saldo del monedero");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [token]);

    useEffect(() => {
        if (selected === "datos") navigate("/wallet/bank-details");
        if (selected === "historial") navigate("/wallet/history");
    }, [selected, navigate]);


    // LÓGICA DE RECARGA
    const handleRechargeConfirm = async (amount: number) => {
        if (!token) return toast.error("Error de sesión");
        try {
            const updatedWallet = await depositMoney(amount, token);
            setBalance(Number(updatedWallet.balance));

            // Notificación de Éxito
            notify('accountUpdates', `Has recargado ${amount.toFixed(2)}€ en tu monedero.`, 'success');
        } catch (error) {
            // Notificación de Error
            toast.error("Error al recargar el monedero");
        }
    };

    // LÓGICA DE RETIRO
    const handleWithdraw = async (amountToWithdraw: number) => {
        if (!token) return alert("Error de autenticación");
        try {
            const updatedWallet = await withdrawMoney(amountToWithdraw, token);
            setBalance(Number(updatedWallet.balance));

            // Notificación de Éxito
            notify('accountUpdates', `Has retirado ${amountToWithdraw.toFixed(2)}€ de tu monedero.`, 'success');

            setShowWithdraw(false);

        } catch (error: any) {
            // Notificación de Error
            toast.error("Error al retirar el dinero");
        }
    };

    const balanceFixed = balance.toFixed(2);
    const [integerPart, decimalPart] = balanceFixed.split('.');
    const integerFormatted = Number(integerPart).toLocaleString('es-ES');

    const displayInteger = loading ? "---" : integerFormatted;
    const displayDecimal = loading ? ",--" : `,${decimalPart}`;

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
                <div className={`balance-total ${loading ? 'balance-loading' : 'balance-visible'}`}>
                    <span className="amount-integer">{displayInteger}</span>
                    <span className="amount-decimal">{displayDecimal}€</span>
                </div>

                <div className="balance-actions">
                    <div className="action-btn-container" onClick={() => setShowModal(true)}>
                        <button className="circle-btn"><BiPlus size={32} /></button>
                        <span className="action-label">Recargar</span>
                    </div>
                    <div className="action-btn-container" onClick={() => setShowReceive(true)}>
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

            <ReceiveModal
                isOpen={showReceive}
                onClose={() => setShowReceive(false)}
            />
        </>
    )
}