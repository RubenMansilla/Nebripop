import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
export declare class PurchasesService {
    private purchaseRepo;
    constructor(purchaseRepo: Repository<Purchase>);
    hidePurchase(purchaseId: number, userId: string): Promise<Purchase>;
    hideSale(purchaseId: number, userId: string): Promise<Purchase>;
    findAllUserTransactions(userId: string, filter: 'all' | 'in' | 'out'): Promise<{
        transaction_type: string;
        display_sign: string;
        id: number;
        buyerId: string;
        sellerId: string;
        productId: number;
        price: number;
        deletedByBuyer: boolean;
        deletedBySeller: boolean;
        product: import("../products/products.entity").Product;
        purchasedAt: Date;
    }[]>;
}
