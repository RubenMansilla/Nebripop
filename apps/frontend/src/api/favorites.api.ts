/* ================= PRODUCTOS ================= */

export async function addFavorite(productId: number, token: string) {
  return fetch(`${import.meta.env.VITE_API_URL}/favorites/favorite/${productId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavorite(productId: number, token: string) {
  return fetch(`${import.meta.env.VITE_API_URL}/favorites/favorite/${productId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyFavoriteProducts(token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/favorites/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error obteniendo productos favoritos");
  return res.json();
}

/* ================= USUARIOS ================= */

export async function addFavoriteUser(userId: number, token: string) {
  return fetch(`${import.meta.env.VITE_API_URL}/favorites/users/${userId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function removeFavoriteUser(userId: number, token: string) {
  return fetch(`${import.meta.env.VITE_API_URL}/favorites/users/${userId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getMyFavoriteUsers(token: string) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/favorites/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Error obteniendo usuarios favoritos");
  return res.json();
}

export async function isFavoriteUser(userId: number, token: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/favorites/users/${userId}/is-favorite`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) return false;
  return res.json();
}
