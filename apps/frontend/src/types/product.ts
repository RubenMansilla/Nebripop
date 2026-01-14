export interface ProductImageType {
  id: number;
  image_url: string;
  storage_path?: string;
}

export interface ProductType {
  // --- COLUMNAS REALES DE LA TABLA PRODUCTS ---
  id: number;
  owner_id: number;
  summary?: string;
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
  created_at: string;
  sold: boolean;

  // --- RELACIONES ---
  images?: ProductImageType[];

  // --- CAMPOS DINÁMICOS ---
  isFavorite?: boolean;

  purchaseId?: number;
  soldPrice?: number;
  soldDate?: string;
}
