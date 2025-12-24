import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
export declare class WalletService {
    private walletRepo;
    constructor(walletRepo: Repository<Wallet>);
    getBalance(userId: number): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    deposit(userId: number, amount: number): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    withdraw(userId: number, amount: number): Promise<{
        balance: number;
        id: string;
        userId: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
