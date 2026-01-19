import api from "../utils/axiosConfig";

export interface ReviewData {
    owner_id: string | number;
    rating: number;
    comment: string;
    product_id?: number;
}

// Obtener reviews de un usuario
export async function getReviews(userId: number, sortOption: string) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/user/${userId}?sort=${sortOption}`
    );

    if (!res.ok) {
        throw new Error("Error obteniendo reviews");
    }

    return res.json();
}

// Obtener resumen de reviews de un usuario
export async function getUserReviewSummary(userId: number) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/user/${userId}/summary`
    );

    if (!res.ok) {
        throw new Error("Error obteniendo resumen de reviews");
    }

    return res.json();
}

// Crear una nueva review
export const createReview = async (reviewData: ReviewData) => {
    try {
        const response = await api.post("/reviews", reviewData);
        return response.data;
    } catch (error: any) {
        console.error("Error creating review:", error);
        throw new Error(error.response?.data?.message || "Error al enviar la reseña");
    }
};