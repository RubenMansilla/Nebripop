// =========================
// USERS API
// =========================

export async function updateUser(data: any, token: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/update`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al actualizar datos");
    return res.json();
}

export async function uploadProfilePicture(file: File, token: string) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/profile-picture`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        }
    );

    if (!res.ok) throw new Error("Error al subir imagen");
    return res.json();
}

// =========================
// PERFIL PÚBLICO – USER
// =========================

export async function getPublicUser(userId: number) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/users/public/${userId}`
    );

    if (!res.ok) {
        throw new Error("Error obteniendo usuario público");
    }

    return res.json();
}

// Cambiar contraseña
export async function changePassword(data: { oldPassword: string; newPassword: string }, token: string) {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/change-password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) {
        throw new Error(responseData.message || "Error al cambiar la contraseña");
    }

    return responseData;
}
