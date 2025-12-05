import { ProductImage } from "../products/products-image.entity";
export declare class Product {
    id: number;
    owner_id: number;
    summary: string;
    name: string;
    description: string;
    price: number;
    condition: string;
    brand: string;
    color: string;
    material: string;
    width_cm: number;
    height_cm: number;
    depth_cm: number;
    category_id: number;
    subcategory_id: number;
    shipping_active: boolean;
    shipping_size: string;
    shipping_weight: string;
    postal_code: string;
    latitude: number;
    longitude: number;
    images: ProductImage[];
}
