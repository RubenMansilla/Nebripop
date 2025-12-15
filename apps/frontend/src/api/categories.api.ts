// apps/frontend/src/api/categories.api.ts

const API_URL = import.meta.env.VITE_API_URL;

export interface Category {
  id: number;
  name: string;
}

/**
 * Obtener todas las categorías
 */
export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories`);

  if (!res.ok) {
    throw new Error("Error al obtener categorías");
  }

  return res.json();
}
