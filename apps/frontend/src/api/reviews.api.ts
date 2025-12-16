// =========================
// REVIEWS API
// =========================

export async function getReviews(userId: number, sortOption: string) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/reviews/user/${userId}?sort=${sortOption}`
  );

  if (!res.ok) {
    throw new Error("Error obteniendo reviews");
  }

  return res.json();
}

export async function getUserReviewSummary(userId: number) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/reviews/user/${userId}/summary`
  );

  if (!res.ok) {
    throw new Error("Error obteniendo resumen de reviews");
  }

  return res.json();
}
