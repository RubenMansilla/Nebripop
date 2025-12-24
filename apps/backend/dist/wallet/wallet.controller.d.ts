import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getBalance(req: any): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deposit(req: any, body: {
        amount: number;
    }): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    withdraw(req: any, body: {
        amount: number;
    }): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
