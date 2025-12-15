export interface ProductType {
    // --- COLUMNAS REALES DE LA TABLA PRODUCTS ---
    id: number;
    owner_id: number;
    summary?: string; // El ? indica que puede venir vacío o null
    name: string;
    description: string;
    price: number;
    condition: string;
    brand?: string;
    color?: string;
    material?: string;
    width_cm?: number;
    height_cm?: number;
    depth_cm?: number;
    category_id: number;
    subcategory_id: number;
    shipping_active: boolean;
    shipping_size?: string;
    shipping_weight?: number;
    postal_code?: string;
    latitude?: number;
    longitude?: number;
    created_at: string; // Las fechas suelen venir como string ISO del backend
    sold: boolean;

    // --- RELACIONES (No son columnas, pero el backend las incluye) ---
    // El backend suele mandar un array de imágenes con la propiedad image_url
    images?: { image_url: string }[];

    // Campo calculado para saber si el usuario le dio like
    isFavorite?: boolean;

    // --- CAMPOS DINÁMICOS (Solo existen en Ventas/Compras) ---
    // Estos son los que arreglan tu error TS2339.
    // Solo vienen cuando llamas a los endpoints de historial, no en el catálogo normal.
    purchaseId?: number;  // ID de la transacción en la tabla 'purchases'
    soldPrice?: number;   // Precio final al que se vendió
    soldDate?: string;    // Fecha de la venta
}