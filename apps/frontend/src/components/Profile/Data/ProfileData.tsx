import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { updateUser, uploadProfilePicture } from "../../../api/users.api";
import "./ProfileData.css";

export default function ProfileData() {
    const { user, token, setUser } = useContext(AuthContext);

    console.log("TOKEN ENVIADO:", token);

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

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const selectedFileRef = useRef<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        selectedFileRef.current = file;
        const tempUrl = URL.createObjectURL(file);
        setPreview(tempUrl);
    };

    const handleSavePublic = async () => {
        try {
            // 1️⃣ Actualizar nombre
            const updated = await updateUser({ fullName: name }, token!);
            setUser(updated);

            // 2️⃣ Subir imagen si existe
            if (selectedFileRef.current) {
                setIsUploading(true); // 🚀 Evita que el preview vuelva a la foto antigua

                const updatedUser = await uploadProfilePicture(
                    selectedFileRef.current,
                    token!
                );

                setUser(updatedUser);
                setPreview(updatedUser.profilePicture);

                setIsUploading(false);
            }

        } catch (err) {
            console.error("Error actualizando perfil:", err);
        }
    };

    useEffect(() => {
        if (!isUploading) {
            setPreview(user?.profilePicture || defaultPic);
        }
    }, [user, isUploading]);


    const handleSavePersonal = async () => {
        try {
            const body = { email, birthDate, gender };

            const updated = await updateUser(body, token!);
            setUser(updated);

        } catch (err) {
            console.error("Error actualizando datos personales:", err);
        }
    };

    console.log("USER EN CONTEXTO:", user);

    return (
        <>
            {/* --- INFORMACIÓN PÚBLICA --- */}
            <div className="profile-info-container">
                <div className="title-section">
                    <h3>Información pública</h3>
                </div>

                <div className="public-info-content">
                    <div className="profile-photo-section">
                        <img src={preview} className="profile-photo" />
                        <div>
                            <button
                                className="change-photo-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Cambiar foto
                            </button>
                            <p className="photo-hint">
                                Formatos admitidos: .jpg y .png (máx. 50 MB)
                            </p>
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
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <button className="save-btn" onClick={handleSavePublic}>
                        Guardar
                    </button>
                </div>
            </div>

            {/* --- INFORMACIÓN PERSONAL --- */}
            <div className="profile-info-container">
                <div className="title-section">
                    <h3>Información personal</h3>
                </div>

                <div className="personal-info-content">
                    {/* Fecha */}
                    <div className="input-group">
                        <label>Fecha de nacimiento</label>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
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
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button className="save-btn" onClick={handleSavePersonal}>
                        Guardar
                    </button>
                </div>
            </div>
        </>
    );
}
