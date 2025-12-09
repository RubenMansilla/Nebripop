import { Product } from "../products/products.entity";
export declare class ProductImage {
    id: number;
    product_id: number;
    image_url: string;
    product: Product;
}
