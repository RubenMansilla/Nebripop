import { Product } from '../products/products.entity';
export declare class Chat {
    id: number;
    buyerId: number;
    sellerId: number;
    productId: number;
    product: Product;
    createdAt: Date;
}
