import api from "../utils/axiosConfig";

// =========================
// USERS API
// =========================

export async function updateUser(data: any) {
  try {
    const res = await api.patch("/users/update", data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al actualizar datos");
  }
}

export async function uploadProfilePicture(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.patch("/users/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
    const res = await api.patch("/users/change-password", data);
    return res.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error al cambiar la contraseña");
  }
}

// =========================
// SEARCH USERS (CHAT)
// =========================
export async function searchUsers(query: string) {
  try {
    const res = await api.get("/users/search", {
      params: { q: query },
    });

    const raw =
      Array.isArray(res.data) ? res.data :
      Array.isArray(res.data?.users) ? res.data.users :
      Array.isArray(res.data?.data) ? res.data.data :
      Array.isArray(res.data?.results) ? res.data.results :
      [];

    return raw
      .filter(Boolean)
      .map((u: any) => ({
        id: Number(u.id),
        fullName: u.fullName ?? u.full_name ?? u.name ?? "",
        profilePicture:
          u.profilePicture ??
          u.profile_picture ??
          u.avatarUrl ??
          u.avatar_url ??
          undefined,
      }))
      .filter((u: any) => Number.isFinite(u.id) && u.fullName);
  } catch (error: any) {
    console.error("searchUsers error:", error?.response?.data || error?.message);
    throw new Error(error.response?.data?.message || "Error buscando usuarios");
  }
}
