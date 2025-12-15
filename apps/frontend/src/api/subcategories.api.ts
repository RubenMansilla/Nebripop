// apps/frontend/src/api/subcategories.api.ts

const API_URL = import.meta.env.VITE_API_URL;

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
}

/**
 * Obtener subcategorías de una categoría concreta
 */
export async function getSubcategoriesByCategory(
  categoryId: number
): Promise<Subcategory[]> {
  const res = await fetch(
    `${API_URL}/subcategories/by-category/${categoryId}`
  );

  if (!res.ok) {
    throw new Error("Error al obtener subcategorías");
  }

  return res.json();
}
