import './CardForm.css';
import { useState } from 'react';
import VisaLogo from '../../assets/logos/Visa_Inc._logo.svg.png';
import MasterCardLogo from '../../assets/logos/Mastercard-Logo.png';

interface CardFormProps {
    onBack: () => void;
}

interface FormErrors {
    name: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
}

export default function CardForm({ onBack }: CardFormProps) {

    // Estados para controlar los inputs
    const [name, setName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');

    const [errors, setErrors] = useState<FormErrors>({
        name: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    // Lógica para permitir solo letras y espacios
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');

        setName(value);
        if (errors.name) setErrors({ ...errors, name: '' });
    };

    // Lógica tarjeta con espacios cada 4 dígitos
    const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.slice(0, 16);
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');

        setCardNumber(formattedValue);
        if (errors.cardNumber) setErrors({ ...errors, cardNumber: '' });
    };

    // Lógica para MM/AA (Solo números y añade barra automática)
    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 3) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        setExpiry(value);
        if (errors.expiry) setErrors({ ...errors, expiry: '' });
    };

    // Lógica para CVV (Solo 3 números)
    const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        setCvv(value);
        if (errors.cvv) setErrors({ ...errors, cvv: '' });
    };

    const handleSubmit = () => {
        const newErrors: FormErrors = {
            name: '',
            cardNumber: '',
            expiry: '',
            cvv: ''
        };

        // Validar Nombre
        if (name.trim() === '') {
            newErrors.name = 'Introducir nombre y apellidos';
        } else if (name.trim().length < 3) {
            newErrors.name = 'El nombre es muy corto';
        }

        // Validar Tarjeta
        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length === 0) {
            newErrors.cardNumber = 'Introduce el número de tarjeta';
        } else if (cleanNumber.length < 16) {
            newErrors.cardNumber = 'El número de tarjeta es incompleto';
        }

        // Validar Fecha (MM/AA)
        if (expiry.length === 0) {
            newErrors.expiry = 'Introduce fecha';
        } else if (expiry.length < 5) {
            newErrors.expiry = 'Fecha incompleta';
        } else {
            const month = parseInt(expiry.slice(0, 2));
            if (month < 1 || month > 12) {
                newErrors.expiry = 'Mes inválido';
            }
        }

        // Validar CVV
        if (cvv.length === 0) {
            newErrors.cvv = 'Introducir CVV';
        } else if (cvv.length < 3) {
            newErrors.cvv = 'CVV incompleto';
        }

        setErrors(newErrors);

        const isValid = !Object.values(newErrors).some(errorMsg => errorMsg !== '');

        if (isValid) {
            console.log("Formulario válido, enviando datos...");
            onBack();
        }
    };

    return (
        <>
            <div className='form-header'>
                <svg onClick={onBack} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 9"><path fill="#000000" d="M12.5 5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5" /><path fill="#000000" d="M6 8.5a.47.47 0 0 1-.35-.15l-3.5-3.5c-.2-.2-.2-.51 0-.71L5.65.65c.2-.2.51-.2.71 0s.2.51 0 .71L3.21 4.51l3.15 3.15c.2.2.2.51 0 .71c-.1.1-.23.15-.35.15Z" /></svg>
                <h3>Añade tu tarjeta</h3>
            </div>
            <div className='card-form-container'>
                <div className='form-inputs'>
                    <div className="material-textfield">
                        <input
                            type="text"
                            className={`material-input ${errors.name ? 'error' : ''}`}
                            placeholder=" "
                            value={name}
                            onChange={handleNameChange}
                        />
                        <label className="material-label">Nombre y apellidos</label>
                        {errors.name && <p className='error-form'>{errors.name}</p>}
                    </div>
                    <div className="material-textfield">
                        <input
                            type="text"
                            className={`material-input ${errors.cardNumber ? 'error' : ''}`}
                            placeholder=" "
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                        />
                        <label className="material-label">Número de tarjeta</label>
                        {errors.cardNumber && <p className='error-form'>{errors.cardNumber}</p>}
                    </div>
                    <div className="form-row">
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    className={`material-input ${errors.expiry ? 'error' : ''}`}
                                    placeholder=" "
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    maxLength={5}
                                    inputMode="numeric"
                                />
                                <label className="material-label">MM/AA</label>
                            </div>
                            {errors.expiry && <p className='error-form'>{errors.expiry}</p>}
                        </div>
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    className={`material-input ${errors.cvv ? 'error' : ''}`}
                                    placeholder=" "
                                    value={cvv}
                                    onChange={handleCvvChange}
                                    maxLength={3}
                                    inputMode="numeric"
                                />
                                <label className="material-label">CVV</label>
                            </div>
                            {errors.cvv && <p className='error-form'>{errors.cvv}</p>}
                        </div>
                    </div>
                </div>
                <div className="ssl-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#5c7a89" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12.75 15.55a1.5 1.5 0 1 0-1.5 0v1.7a.75.75 0 0 0 1.5 0z"></path><path fill-rule="evenodd" d="M5.25 6v3.095A3 3 0 0 0 3 12v5.25c0 2.9 2.35 5.25 5.25 5.25h7.5c2.9 0 5.25-2.35 5.25-5.25V12a3 3 0 0 0-2.25-2.905V6a4.5 4.5 0 0 0-4.5-4.5h-4.5A4.5 4.5 0 0 0 5.25 6m4.5-3a3 3 0 0 0-3 3v3h1.5V6.75A2.25 2.25 0 0 1 10.5 4.5h3a2.25 2.25 0 0 1 2.25 2.25V9h1.5V6a3 3 0 0 0-3-3zm4.5 6V6.75A.75.75 0 0 0 13.5 6h-3a.75.75 0 0 0-.75.75V9zM6 10.5A1.5 1.5 0 0 0 4.5 12v5.25A3.75 3.75 0 0 0 8.25 21h7.5a3.75 3.75 0 0 0 3.675-3H18a.75.75 0 0 1 0-1.5h1.5v-2.25H18a.75.75 0 0 1 0-1.5h1.5V12a1.5 1.5 0 0 0-1.5-1.5z" clip-rule="evenodd"></path></svg>
                    <span>Cifrado SSL seguro</span>
                    <div className="card-icons">
                        <div className='icon-card'>
                            <img className='visa-logo' src={VisaLogo} alt="Visa Logo" />
                        </div>
                        <div className='icon-card'>
                            <img className='mastercad-logo' src={MasterCardLogo} alt="Mastercard Logo" />
                        </div>
                    </div>
                </div>
                <button className="save-card-btn" onClick={handleSubmit}>
                    Añadir tarjeta
                </button>
            </div>
        </>
    );
}