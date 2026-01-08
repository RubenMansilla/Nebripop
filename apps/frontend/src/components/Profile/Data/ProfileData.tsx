import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { updateUser, uploadProfilePicture } from "../../../api/users.api";
import imageCompression from "browser-image-compression";
import "./ProfileData.css";

interface ProfileDataProps {
    setHasUnsavedChanges: (value: boolean) => void;
}

export default function ProfileData({ setHasUnsavedChanges }: ProfileDataProps) {

    const { user, token, setUser } = useContext(AuthContext);

    const profilePic = user?.profilePicture;

    const [isUploading, setIsUploading] = useState(false);

    const defaultPic = "https://zxetwkoirtyweevvatuf.supabase.co/storage/v1/object/sign/userImg/Default_Profile_Picture.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9kYWMwYTY1NC1mOTY4LTQyNjYtYmVlYy1lYjdkY2EzNmI2NDUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ1c2VySW1nL0RlZmF1bHRfUHJvZmlsZV9QaWN0dXJlLnBuZyIsImlhdCI6MTc2NDU4MzQ3OSwiZXhwIjoxNzk2MTE5NDc5fQ.yJUBlEuws9Tl5BK9tIyMNtKp52Jj8reTF_y_a71oR1I";

    const [preview, setPreview] = useState(profilePic);
    const [name, setName] = useState(user?.fullName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [birthDate, setBirthDate] = useState(
        user?.birthDate ? user.birthDate.split("T")[0] : "2000-01-01"
    );
    const [gender, setGender] = useState(user?.gender || "");
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedFileRef = useRef<File | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            // Opciones de compresión
            const options = {
                maxSizeMB: 1,               // Máx. 1 MB por imagen
                maxWidthOrHeight: 1024,     // Suficiente para avatares
                useWebWorker: true,
            };

            // COMPRESIÓN
            const compressedFile = await imageCompression(file, options);

            // Guardamos el file comprimido para subir al backend
            selectedFileRef.current = new File(
                [compressedFile],
                file.name,
                { type: file.type }
            );

            // Previsualización sigue siendo igual
            const tempUrl = URL.createObjectURL(compressedFile);
            setPreview(tempUrl);

            setHasUnsavedChanges(true);
        } catch (err) {
            console.error("Error al comprimir imagen:", err);
        }
    };


    useEffect(() => {
        if (!isUploading) {
            setPreview(user?.profilePicture || defaultPic);
        }
    }, [user, isUploading]);

    const handleNameChange = (value: string) => {
        setName(value);
        setHasUnsavedChanges(true);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, name: "El nombre no puede estar vacío" }));
        } else {
            setErrors(prev => ({ ...prev, name: undefined }));
        }
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setHasUnsavedChanges(true);

        if (!value.trim()) {
            setErrors(prev => ({ ...prev, email: "El correo no puede estar vacío" }));
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setErrors(prev => ({ ...prev, email: "Introduce un correo válido" }));
        } else {
            setErrors(prev => ({ ...prev, email: undefined }));
        }
    };

    const validate = () => {
        const newErrors: { name?: string; email?: string } = {};

        if (!name.trim()) {
            newErrors.name = "El nombre no puede estar vacío";
        }

        if (!email.trim()) {
            newErrors.email = "El correo no puede estar vacío";
        } else {
            // Validar formato de correo
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                newErrors.email = "Introduce un correo válido";
            }
        }

        setErrors(newErrors);

        // Si no hay errores devolvemos true
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {

        // Si hay errores, no continuar
        if (!validate()) return;

        try {
            // Actualizar datos públicos + personales
            const body = {
                fullName: name,
                email,
                birthDate,
                gender,
            };

            const updatedUser = await updateUser(body);
            setUser(updatedUser);

            // Subir foto si existe
            if (selectedFileRef.current) {
                setIsUploading(true);

                const updatedPicUser = await uploadProfilePicture(
                    selectedFileRef.current
                );
                setUser(updatedPicUser);
                setPreview(updatedPicUser.profilePicture);
                setIsUploading(false);
            }
            setHasUnsavedChanges(false);
        } catch (err) {
            console.error("Error guardando datos:", err);
        }
    };

    return (
        <>
            {/* --- INFORMACIÓN PÚBLICA --- */}
            <div className="profile-info-container">
                <div className="public-info-content">
                    <div className="title-section">
                        <h3>Información pública</h3>
                    </div>
                    <div className="profile-photo-section">
                        <div className="photo-label">
                            <label>Foto de perfil</label>
                        </div>
                        <div className="photo-actions">
                            <div className="photo-preview">
                                <img src={preview} className="profile-photo" />
                            </div>
                            <div className="photo-buttons">
                                <div className="change-photo-btn-container">
                                    <button
                                        className="change-photo-btn"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Cambiar foto
                                    </button>
                                </div>
                                <p className="photo-hint">
                                    Formatos admitidos: .jpg y .png (máx. 50 MB)
                                </p>
                            </div>
                        </div>
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                    <div className="input-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className={errors.name ? "input-error" : "input-normal"}
                        />
                    </div>
                </div>

                {/* --- INFORMACIÓN PERSONAL --- */}
                <div className="personal-info-content">
                    <div className="title-section">
                        <h3>Información personal</h3>
                    </div>
                    {/* Fecha */}
                    <div className="input-group">
                        <label>Fecha de nacimiento</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="input-normal"
                        />
                    </div>

                    {/* Género */}
                    <div className="input-group">
                        <label>Sexo</label>
                        <div className="gender-options">
                            <div
                                className={`gender-option ${gender === "Hombre" ? "active" : ""}`}
                                onClick={() => setGender("Hombre")}
                            >
                                Hombre
                            </div>
                            <div
                                className={`gender-option ${gender === "Mujer" ? "active" : ""}`}
                                onClick={() => setGender("Mujer")}
                            >
                                Mujer
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <label>Correo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => handleEmailChange(e.target.value)}
                            className={errors.email ? "input-error" : "input-normal"}
                        />
                    </div>
                    <div className="save-btn-container">
                        <button className="save-btn" onClick={handleSave} disabled={isUploading}>
                            Guardar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
