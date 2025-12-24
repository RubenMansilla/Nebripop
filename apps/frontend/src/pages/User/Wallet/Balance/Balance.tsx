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

const toastStyles = {
    success: {
        style: {
            borderRadius: "14px",
            padding: "14px 18px",
            backgroundColor: "#f6fff8",
            color: "#114b2c",
            border: "1px solid #d5f3df",
            fontWeight: 500,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        },
        iconTheme: { primary: "#28c76f", secondary: "#fff" }
    },
    error: {
        style: {
            borderRadius: "14px",
            padding: "14px 18px",
            backgroundColor: "#fff5f5", // Fondo rojizo suave
            color: "#b91c1c", // Rojo oscuro
            border: "1px solid #fecaca",
            fontWeight: 500,
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        },
        iconTheme: { primary: "#ef4444", secondary: "#fff" }
    }
};

export default function Balance() {

    const [balance, setBalance] = useState(0);

    const { token } = useContext(AuthContext);

    const navigate = useNavigate();
    const [selected, setSelected] = useState("monedero");

    const [showModal, setShowModal] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [showReceive, setShowReceive] = useState(false);

    useEffect(() => {
        if (token) {
            getWalletBalance(token)
                .then((data) => {
                    setBalance(Number(data.balance));
                })
                .catch((err) => console.error("Error cargando saldo:", err));
        }
    }, [token]);

    useEffect(() => {
        if (selected === "datos") navigate("/wallet/bank-details");
        if (selected === "historial") navigate("/wallet/history");
    }, [selected, navigate]);


    // LÓGICA DE RECARGA
    const handleRechargeConfirm = async (amount: number) => {
        if (!token) return toast.error("Error de sesión", toastStyles.error);
        try {
            const updatedWallet = await depositMoney(amount, token);
            setBalance(Number(updatedWallet.balance));

            // Notificación de Éxito
            toast.success(`¡Has recargado ${amount.toFixed(2)}€ correctamente!`, toastStyles.success);
        } catch (error) {
            console.error(error);
            // Notificación de Error
            toast.error("Error al recargar el monedero", toastStyles.error);
        }
    };

    // LÓGICA DE RETIRO (CONECTADA AL BACK)
    const handleWithdraw = async (amountToWithdraw: number) => {
        if (!token) return alert("Error de autenticación");
        try {
            const updatedWallet = await withdrawMoney(amountToWithdraw, token);
            setBalance(Number(updatedWallet.balance));

            // Notificación de Éxito
            toast.success(`Has retirado ${amountToWithdraw.toFixed(2)}€ exitosamente`, toastStyles.success);

            // Cerramos el modal de retiro (pasamos esto como prop o dejamos que ATMWithdraw se cierre solo)
            setShowWithdraw(false);

        } catch (error: any) {
            console.error(error);
            // Notificación de Error (Muestra el mensaje del backend si existe, ej: "Fondos insuficientes")
            toast.error(error.message || "Error al retirar el dinero", toastStyles.error);
        }
    };

    const balanceFixed = balance.toFixed(2);
    const [integerPart, decimalPart] = balanceFixed.split('.');
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