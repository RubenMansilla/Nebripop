
import api from "../utils/axiosConfig";

// =========================
// USERS API
// =========================

export async function updateUser(data: any) {
    try {
        // Axios serializa el JSON automáticamente
        const res = await api.patch('/users/update', data);
        return res.data;
    } catch (error: any) {
        // Capturamos el mensaje del backend limpio
        throw new Error(error.response?.data?.message || "Error al actualizar datos");
    }
}

export async function uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await api.patch('/users/profile-picture', formData);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al subir imagen");
    }
}

// =========================
// PERFIL PÚBLICO – USER
// =========================

export async function getPublicUser(userId: number) {
    try {
        const res = await api.get(`/users/public/${userId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error obteniendo usuario público");
    }
}

// Cambiar contraseña
export async function changePassword(data: { oldPassword: string; newPassword: string }) {
    try {
        const res = await api.patch('/users/change-password', data);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al cambiar la contraseña");
    }
}