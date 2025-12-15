import { Product } from '../products/products.entity';
export declare class Purchase {
    id: number;
    buyerId: number;
    sellerId: number;
    productId: number;
    price: number;
    deletedByBuyer: boolean;
    deletedBySeller: boolean;
    product: Product;
    purchasedAt: Date;
}
