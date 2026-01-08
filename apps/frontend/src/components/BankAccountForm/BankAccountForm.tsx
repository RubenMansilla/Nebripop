import '../CardForm/CardForm.css';
import { useState } from 'react';

interface BankFormProps {
    onBack: () => void;
}

interface BankFormErrors {
    nombre: string;
    apellidos: string;
    iban: string;
    calle: string;
    piso: string;
    cp: string;
    ciudad: string;
}

export default function BankAccountForm({ onBack }: BankFormProps) {

    // Estado único para los campos del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        iban: '',
        calle: '',
        piso: '',
        cp: '',
        ciudad: ''
    });

    const [errors, setErrors] = useState<BankFormErrors>({
        nombre: '',
        apellidos: '',
        iban: '',
        calle: '',
        piso: '',
        cp: '',
        ciudad: ''
    });

    // Manejador genérico para inputs de texto simple
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof BankFormErrors]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Lógica específica para IBAN (Espacios cada 4 caracteres y mayúsculas)
    const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Limite estándar IBAN España (24 caracteres)
        if (value.length > 24) value = value.slice(0, 24);

        const formattedValue = value.replace(/(.{4})(?=.)/g, '$1 ');

        setFormData(prev => ({ ...prev, iban: formattedValue }));
        if (errors.iban) setErrors(prev => ({ ...prev, iban: '' }));
    };

    // Lógica para CP (Solo números, max 5)
    const handleCpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 5) value = value.slice(0, 5);

        setFormData(prev => ({ ...prev, cp: value }));
        if (errors.cp) setErrors(prev => ({ ...prev, cp: '' }));
    };

    const handleSubmit = () => {
        const newErrors: BankFormErrors = {
            nombre: '', apellidos: '', iban: '', calle: '', piso: '', cp: '', ciudad: ''
        };

        // Validaciones
        if (!formData.nombre.trim()) newErrors.nombre = 'Nombre requerido';
        if (!formData.apellidos.trim()) newErrors.apellidos = 'Apellidos requeridos';

        // Validación IBAN (Básica de longitud y formato ES)
        const cleanIban = formData.iban.replace(/\s/g, '');
        if (!cleanIban) {
            newErrors.iban = 'Introduce el IBAN';
        } else if (cleanIban.length < 24) {
            newErrors.iban = 'IBAN incompleto (mínimo 24 caracteres)';
        } else if (!/^[A-Z]{2}\d{22}$/.test(cleanIban)) {
            newErrors.iban = 'Formato de IBAN inválido';
        }

        if (!formData.calle.trim()) newErrors.calle = 'Dirección requerida';
        if (!formData.ciudad.trim()) newErrors.ciudad = 'Ciudad requerida';

        if (!formData.cp) {
            newErrors.cp = 'Código postal requerido';
        } else if (formData.cp.length < 5) {
            newErrors.cp = 'CP incompleto';
        }

        setErrors(newErrors);

        const isValid = !Object.values(newErrors).some(errorMsg => errorMsg !== '');

        if (isValid) {
            console.log("Datos bancarios válidos:", formData);
            onBack();
        }
    };

    return (
        <>
            <div className='form-header'>
                <svg onClick={onBack} style={{ cursor: 'pointer' }} xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 9"><path fill="#000000" d="M12.5 5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5" /><path fill="#000000" d="M6 8.5a.47.47 0 0 1-.35-.15l-3.5-3.5c-.2-.2-.2-.51 0-.71L5.65.65c.2-.2.51-.2.71 0s.2.51 0 .71L3.21 4.51l3.15 3.15c.2.2.2.51 0 .71c-.1.1-.23.15-.35.15Z" /></svg>
                <h3>Domiciliación Bancaria</h3>
            </div>

            <div className='card-form-container'>
                <div className='form-inputs'>

                    <div className="form-row">
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    name="nombre"
                                    className={`material-input ${errors.nombre ? 'error' : ''}`}
                                    placeholder=" "
                                    value={formData.nombre}
                                    onChange={handleChange}
                                />
                                <label className="material-label">Nombre</label>
                            </div>
                            {errors.nombre && <p className='error-form'>{errors.nombre}</p>}
                        </div>
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    name="apellidos"
                                    className={`material-input ${errors.apellidos ? 'error' : ''}`}
                                    placeholder=" "
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                />
                                <label className="material-label">Apellidos</label>
                            </div>
                            {errors.apellidos && <p className='error-form'>{errors.apellidos}</p>}
                        </div>
                    </div>

                    <div className="material-textfield">
                        <input
                            type="text"
                            className={`material-input ${errors.iban ? 'error' : ''}`}
                            placeholder=" "
                            value={formData.iban}
                            onChange={handleIbanChange}
                            maxLength={34} // Max lenght con espacios
                        />
                        <label className="material-label">IBAN (ESXX...)</label>
                        {errors.iban && <p className='error-form'>{errors.iban}</p>}
                    </div>

                    <div className="material-textfield">
                        <input
                            type="text"
                            name="calle"
                            className={`material-input ${errors.calle ? 'error' : ''}`}
                            placeholder=" "
                            value={formData.calle}
                            onChange={handleChange}
                        />
                        <label className="material-label">Calle y número</label>
                        {errors.calle && <p className='error-form'>{errors.calle}</p>}
                    </div>


                    <div className="form-row">
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    name="piso"
                                    className={`material-input ${errors.piso ? 'error' : ''}`}
                                    placeholder=" "
                                    value={formData.piso}
                                    onChange={handleChange}
                                />
                                <label className="material-label">Piso y puerta</label>
                            </div>
                        </div>
                        <div className="input-group-half">
                            <div className="material-textfield">
                                <input
                                    type="text"
                                    className={`material-input ${errors.cp ? 'error' : ''}`}
                                    placeholder=" "
                                    value={formData.cp}
                                    onChange={handleCpChange}
                                    inputMode="numeric"
                                />
                                <label className="material-label">Código Postal</label>
                            </div>
                            {errors.cp && <p className='error-form'>{errors.cp}</p>}
                        </div>
                    </div>

                    <div className="material-textfield">
                        <input
                            type="text"
                            name="ciudad"
                            className={`material-input ${errors.ciudad ? 'error' : ''}`}
                            placeholder=" "
                            value={formData.ciudad}
                            onChange={handleChange}
                        />
                        <label className="material-label">Ciudad</label>
                        {errors.ciudad && <p className='error-form'>{errors.ciudad}</p>}
                    </div>

                </div>

                <div className="ssl-info">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#5c7a89" viewBox="0 0 24 24"><path d="M12.75 15.55a1.5 1.5 0 1 0-1.5 0v1.7a.75.75 0 0 0 1.5 0z"></path><path fillRule="evenodd" d="M5.25 6v3.095A3 3 0 0 0 3 12v5.25c0 2.9 2.35 5.25 5.25 5.25h7.5c2.9 0 5.25-2.35 5.25-5.25V12a3 3 0 0 0-2.25-2.905V6a4.5 4.5 0 0 0-4.5-4.5h-4.5A4.5 4.5 0 0 0 5.25 6m4.5-3a3 3 0 0 0-3 3v3h1.5V6.75A2.25 2.25 0 0 1 10.5 4.5h3a2.25 2.25 0 0 1 2.25 2.25V9h1.5V6a3 3 0 0 0-3-3zm4.5 6V6.75A.75.75 0 0 0 13.5 6h-3a.75.75 0 0 0-.75.75V9zM6 10.5A1.5 1.5 0 0 0 4.5 12v5.25A3.75 3.75 0 0 0 8.25 21h7.5a3.75 3.75 0 0 0 3.675-3H18a.75.75 0 0 1 0-1.5h1.5v-2.25H18a.75.75 0 0 1 0-1.5h1.5V12a1.5 1.5 0 0 0-1.5-1.5z" clipRule="evenodd"></path></svg>
                    <span>Datos bancarios cifrados (SEPA)</span>
                </div>

                <button className="save-card-btn" onClick={handleSubmit}>
                    Guardar Cuenta
                </button>
            </div>
        </>
    );
}