import './BankDetails.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CardForm from '../../../../components/CardForm/CardForm';
import BankAccountForm from '../../../../components/BankAccountForm/BankAccountForm';

export default function BankDetails() {

    const navigate = useNavigate();
    const [selected, setSelected] = useState("datos");
    const [view, setView] = useState("menu");

    useEffect(() => {
        if (selected === "monedero") {
            navigate("/wallet/balance");
        }
        if (selected === "historial") {
            navigate("/wallet/history");
        }
    }, [selected, navigate]);


    return (
        <>
            <div className="info-section">
                <div className="info-container">
                    <div className="title">
                        <h1>Monedero</h1>
                    </div>
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
            <div className='details-content'>
                {view === "menu" && (
                    <div className='details-card'>
                        <div className='details-header'>
                            <h3>Datos bancarios</h3>
                        </div>
                        <div className='details-body'>
                            <div className='details-form'>
                                <div className='details-label'>
                                    <p>Tarjeta bancaria</p>
                                </div>
                                <div className='details-box' onClick={() => setView("add-card")}>
                                    <p>Añadir tarjeta</p>
                                </div>
                            </div>
                            <div className='details-form'>
                                <div className='details-label'>
                                    <p>Cuenta bancaria</p>
                                </div>
                                <div className='details-box' onClick={() => setView("add-bank")}>
                                    <p>Añadir cuenta bancaria</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {view === "add-card" && (
                    <CardForm onBack={() => setView("menu")} />
                )}
                {view === "add-bank" && (
                    <BankAccountForm onBack={() => setView("menu")} />
                )}
            </div>
        </>
    )
}