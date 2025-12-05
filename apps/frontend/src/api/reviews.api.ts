// Obtner reviews de un usuario
export async function getReviews(userId: number, sortOption: string) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/user/${userId}?sort=${sortOption}`
    );

    return res.json();
}

// Obtener resumen de valoración de un usuario (media + total)
export async function getUserReviewSummary(userId: number) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/user/${userId}/summary`
    );

    if (!res.ok) {
        throw new Error("Error obteniendo la media de reviews");
    }

    return res.json();
}