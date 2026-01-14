import api from "../utils/axiosConfig";

/* ================= PRODUCTOS ================= */

export async function addFavorite(productId: number) {
    try {
        const res = await api.post(`/favorites/favorite/${productId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al añadir a favoritos");
    }
}

export async function removeFavorite(productId: number) {
    try {
        const res = await api.delete(`/favorites/favorite/${productId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al eliminar de favoritos");
    }
}

export async function getMyFavoriteProducts() {
    try {
        const res = await api.get('/favorites/products');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error obteniendo productos favoritos");
    }
}

/* ================= USUARIOS ================= */

export async function addFavoriteUser(userId: number) {
    try {
        const res = await api.post(`/favorites/users/${userId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al añadir usuario a favoritos");
    }
}

export async function removeFavoriteUser(userId: number) {
    try {
        const res = await api.delete(`/favorites/users/${userId}`);
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error al eliminar usuario de favoritos");
    }
}

export async function getMyFavoriteUsers() {
    try {
        const res = await api.get('/favorites/users');
        return res.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Error obteniendo usuarios favoritos");
    }
}

export async function isFavoriteUser(userId: number) {
    try {
        const res = await api.get(`/favorites/users/${userId}/is-favorite`);
        return res.data;
    } catch (error: any) {
        console.error("Error comprobando favorito:", error);
        return false;
    }
}