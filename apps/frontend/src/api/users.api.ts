// services/userService.ts

export async function updateUser(data: any, token: string) {
    const res = await fetch("http://localhost:3001/users/update", {
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

    const res = await fetch("http://localhost:3001/users/profile-picture", {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });

    if (!res.ok) throw new Error("Error al subir imagen");

    return res.json(); // { profilePicture: url }
}
