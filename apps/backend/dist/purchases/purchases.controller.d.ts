import { PurchasesService } from "./purchases.service";
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    hidePurchase(id: number, req: any): Promise<import("./purchase.entity").Purchase>;
    hideSale(id: number, req: any): Promise<import("./purchase.entity").Purchase>;
}
