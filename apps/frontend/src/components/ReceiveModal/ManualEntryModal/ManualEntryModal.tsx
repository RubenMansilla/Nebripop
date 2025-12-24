import { useState } from 'react';
import { BiX } from "react-icons/bi"; // Icono de cierre
import './ManualEntryModal.css';

interface ManualEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ManualEntryModal({ isOpen, onClose }: ManualEntryModalProps) {

    const [code, setCode] = useState('');

    if (!isOpen) return null;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = event.target.value;
        setCode(value);
    };

    return (
        <div className="manual-overlay" onClick={onClose}>
            <div className="manual-box" onClick={(e) => e.stopPropagation()}>
                <button className="manual-close-btn" onClick={onClose}>
                    <BiX size={24} />
                </button>
                <h3 className="manual-title">
                    Añade el código manual situado en el código QR
                </h3>
                <div className="manual-input-wrapper">
                    <input
                        type="text"
                        placeholder="Código manual"
                        className="manual-input"
                        value={code}
                        onChange={handleChange}
                        autoFocus
                    />
                </div>
                <button
                    className="manual-add-btn"
                    onClick={() => { onClose(); }}
                    disabled={code.trim() === ''}
                >
                    Añadir
                </button>
            </div>
        </div >
    );
}