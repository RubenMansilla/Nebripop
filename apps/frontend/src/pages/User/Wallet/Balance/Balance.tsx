import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Balance() {

    const navigate = useNavigate();
    const [selected, setSelected] = useState("monedero");

    useEffect(() => {
        if (selected === "datos") {
            navigate("/wallet/bank-details");
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
                <div className="info-items">
                    <div
                        className={`info-item ${selected === "monedero" ? "active" : ""}`}
                        onClick={() => setSelected("monedero")}
                    >
                        <p>Monedero</p>
                    </div>
                    <div
                        className={`info-item ${selected === "datos" ? "active" : ""}`}
                        onClick={() => setSelected("datos")}
                    >
                        <p>Datos</p>
                    </div>
                    <div
                        className={`info-item ${selected === "historial" ? "active" : ""}`}
                        onClick={() => setSelected("historial")}
                    >
                        <p>Historial</p>
                    </div>
                </div>
            </div>

        </>
    )
}