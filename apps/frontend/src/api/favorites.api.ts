export async function addFavorite(productId: number, token: string) {
    return fetch(`${import.meta.env.VITE_API_URL}/favorites/favorite/${productId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function removeFavorite(productId: number, token: string) {
    return fetch(`${import.meta.env.VITE_API_URL}/favorites/favorite/${productId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}
