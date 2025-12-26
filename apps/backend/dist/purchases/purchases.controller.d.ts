import { PurchasesService } from "./purchases.service";
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    hidePurchase(id: number, req: any): Promise<import("./purchase.entity").Purchase>;
    hideSale(id: number, req: any): Promise<import("./purchase.entity").Purchase>;
    getMyTransactions(req: any, type?: string): Promise<{
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
