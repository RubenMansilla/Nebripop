import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';
export declare class PurchasesService {
    private purchaseRepo;
    constructor(purchaseRepo: Repository<Purchase>);
    hidePurchase(purchaseId: number, userId: number): Promise<Purchase>;
    hideSale(purchaseId: number, userId: number): Promise<Purchase>;
}
