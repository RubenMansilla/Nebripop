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

export async function getMyFavoriteProducts(token: string) {
    const res = await fetch(
        `${import.meta.env.VITE_API_URL}/favorites/products`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    );

    if (!res.ok) throw new Error("Error fetching favorite products");

    return res.json();
}
