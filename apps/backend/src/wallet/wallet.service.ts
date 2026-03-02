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
            wallet = this.walletRepo.create({ userId, balance: 0, heldBalance: 0 });
            await this.walletRepo.save(wallet);
        }

        return {
            ...wallet,
            balance: Number(wallet.balance),
            heldBalance: Number(wallet.heldBalance),
        };
    }

    async deposit(userId: number, amount: number) {
        if (amount <= 0) throw new BadRequestException('La cantidad debe ser positiva');

        await this.getBalance(userId); // ensure wallet exists

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

    // ─── RETENCIÓN ───────────────────────────────────────────────────────────

    /**
     * Mueve `amount` de balance disponible a balance retenido.
     * Se llama al pujar en una subasta.
     */
    async holdFunds(userId: number, amount: number): Promise<Wallet> {
        if (amount <= 0) throw new BadRequestException('La cantidad a retener debe ser positiva');

        const wallet = await this.getBalance(userId);

        if (Number(wallet.balance) < amount) {
            throw new BadRequestException(
                `Saldo insuficiente para participar. Necesitas ${amount.toFixed(2)}€ disponibles como garantía.`
            );
        }

        const newBalance = Number(wallet.balance) - amount;
        const newHeld = Number(wallet.heldBalance) + amount;

        await this.walletRepo.update({ userId }, {
            balance: newBalance,
            heldBalance: newHeld,
        });

        return this.getBalance(userId) as any;
    }

    /**
     * Devuelve `amount` de balance retenido a balance disponible.
     * Se llama cuando el usuario es superado en la puja.
     */
    async releaseFunds(userId: number, amount: number): Promise<Wallet> {
        const wallet = await this.getBalance(userId);

        // Protección: nunca liberar más de lo retenido
        const toRelease = Math.min(amount, Number(wallet.heldBalance));
        if (toRelease <= 0) return wallet as any;

        const newBalance = Number(wallet.balance) + toRelease;
        const newHeld = Number(wallet.heldBalance) - toRelease;

        await this.walletRepo.update({ userId }, {
            balance: newBalance,
            heldBalance: newHeld,
        });

        return this.getBalance(userId) as any;
    }

    /**
     * Elimina `amount` de balance retenido sin devolverlo al disponible.
     * Se usa si los fondos retenidos se aplican a otro cobro (actualmente no se usa en el pago,
     * ya que el pago real lo gestiona PurchasesService, pero disponible para uso futuro).
     */
    async chargeHeldFunds(userId: number, amount: number): Promise<Wallet> {
        const wallet = await this.getBalance(userId);

        if (Number(wallet.heldBalance) < amount) {
            throw new BadRequestException('Saldo retenido insuficiente');
        }

        const newHeld = Number(wallet.heldBalance) - amount;
        await this.walletRepo.update({ userId }, { heldBalance: newHeld });

        return this.getBalance(userId) as any;
    }
}