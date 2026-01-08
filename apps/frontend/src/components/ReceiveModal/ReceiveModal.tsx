import { useEffect, useRef, useState } from 'react';
import { BiArrowBack } from "react-icons/bi";
import './ReceiveModal.css';
import ManualEntryModal from './ManualEntryModal/ManualEntryModal';

interface ReceiveModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {

    const videoRef = useRef<HTMLVideoElement>(null);
    const [streamActive, setStreamActive] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    const [showManualInput, setShowManualInput] = useState(false);

    useEffect(() => {
        let currentStream: MediaStream | null = null;

        if (isOpen) {
            setPermissionError(false);
            navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" }
            })
                .then((stream) => {
                    currentStream = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        setStreamActive(true);
                    }
                })
                .catch((err) => {
                    console.error("Error cámara:", err);
                    setPermissionError(true);
                });
        } else {
            setStreamActive(false);
            setShowManualInput(false)
        }

        return () => {
            if (currentStream) {
                currentStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    // Efecto para pausar/reanudar el video al abrir/cerrar la entrada manual
    useEffect(() => {
        const videoElement = videoRef.current;

        if (videoElement && streamActive) {
            if (showManualInput) {
                videoElement.pause();
            } else {
                videoElement.play().catch(e => console.log("Error al reanudar video:", e));
            }
        }
    }, [showManualInput, streamActive]);

    if (!isOpen) return null;

    return (
        <div className="walla-overlay" onClick={onClose}>
            <div className="walla-modal" onClick={(e) => e.stopPropagation()}>
                <div className="walla-header-section">
                    <div className="walla-nav">
                        <div className="walla-header-left">
                            <button onClick={onClose} className="walla-back-btn">
                                <BiArrowBack size={24} />
                            </button>
                            <span className="walla-nav-title">Cobra tu producto</span>
                        </div>
                        <button className="walla-help-btn">¿Dudas?</button>
                    </div>
                    <div className="walla-instructions">
                        <h2>Para cobrar tu producto en persona, escanea el código QR que ha generado el comprador</h2>
                        <div className="walla-manual-entry">
                            <span>¿Tienes problemas para escanear? </span>
                            <button className="walla-link-btn" onClick={() => setShowManualInput(true)}>Añadir código manual</button>
                        </div>
                    </div>
                </div>
                <div className="walla-camera-section">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`walla-video-feed ${streamActive ? 'active' : ''}`}
                    />
                    <div className="walla-camera-overlay">
                        <div className="scan-frame">
                            <div className="corner top-left"></div>
                            <div className="corner top-right"></div>
                            <div className="corner bottom-left"></div>
                            <div className="corner bottom-right"></div>
                            {(!streamActive || permissionError) && (
                                <p className="walla-camera-msg">
                                    {permissionError
                                        ? "Para poder escanear el código QR, debes permitir el acceso a la cámara"
                                        : "Para poder escanear el código QR, debes permitir el acceso a la cámara"
                                    }
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <ManualEntryModal
                    isOpen={showManualInput}
                    onClose={() => setShowManualInput(false)}
                />
            </div>
        </div>
    );
}