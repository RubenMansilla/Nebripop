// Obtner reviews de un usuario
export async function getReviews(userId: number, sortOption: string) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/reviews/user/${userId}?sort=${sortOption}`
    );

    return res.json();
}