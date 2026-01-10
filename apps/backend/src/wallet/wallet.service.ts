import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepo: Repository<Wallet>,
    ) { }

    async getBalance(userId: number) {
        let wallet = await this.walletRepo.findOne({ where: { userId } });

        if (!wallet) {
            wallet = this.walletRepo.create({ userId, balance: 0 });
            await this.walletRepo.save(wallet);
        }

        return { ...wallet, balance: Number(wallet.balance) };
    }

    async deposit(userId: number, amount: number) {
        if (amount <= 0) throw new BadRequestException('La cantidad debe ser positiva');

        await this.getBalance(userId);

        await this.walletRepo.increment({ userId }, 'balance', amount);

        return this.getBalance(userId);
    }

    async withdraw(userId: number, amount: number) {
        if (amount <= 0) throw new BadRequestException('La cantidad debe ser positiva');

        const wallet = await this.getBalance(userId);

        if (Number(wallet.balance) < amount) {
            throw new BadRequestException('Fondos insuficientes');
        }

        await this.walletRepo.decrement({ userId }, 'balance', amount);

        return this.getBalance(userId);
    }
}