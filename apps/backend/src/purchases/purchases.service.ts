import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Purchase } from './purchase.entity';

@Injectable()
export class PurchasesService {

    constructor(
        @InjectRepository(Purchase)
        private purchaseRepo: Repository<Purchase>,
    ) { }

    // Ocultar compra (Lógica de Comprador)
    async hidePurchase(purchaseId: number, userId: string) {
        const purchase = await this.purchaseRepo.findOne({ where: { id: purchaseId } });

        if (!purchase) {
            throw new NotFoundException('Transacción no encontrada');
        }

        if (purchase.buyerId === userId) {
            purchase.deletedByBuyer = true;
            return this.purchaseRepo.save(purchase);
        }

        throw new UnauthorizedException('No eres el comprador en esta transacción');
    }

    // Ocultar venta (Lógica de Vendedor)
    async hideSale(purchaseId: number, userId: string) {
        const purchase = await this.purchaseRepo.findOne({ where: { id: purchaseId } });

        if (!purchase) {
            throw new NotFoundException('Transacción no encontrada');
        }

        if (purchase.sellerId === userId) {
            purchase.deletedBySeller = true;
            return this.purchaseRepo.save(purchase);
        }

        throw new UnauthorizedException('No eres el vendedor en esta transacción');
    }

    async findAllUserTransactions(userId: string, filter: 'all' | 'in' | 'out') {
        const query = this.purchaseRepo.createQueryBuilder('purchase');

        query.leftJoinAndSelect('purchase.product', 'product');
        query.leftJoinAndSelect('product.images', 'images');

        query.where(new Brackets((qb) => {
            if (filter === 'out' || filter === 'all') {
                qb.orWhere('(purchase.buyerId = :userId AND purchase.deletedByBuyer = :false)', { userId, false: false });
            }
            if (filter === 'in' || filter === 'all') {
                qb.orWhere('(purchase.sellerId = :userId AND purchase.deletedBySeller = :false)', { userId, false: false });
            }
        }));

        query.orderBy('purchase.purchasedAt', 'DESC');

        const transactions = await query.getMany();

        return transactions.map(t => {
            const isMyExpense = String(t.buyerId) === String(userId);

            return {
                ...t,
                transaction_type: isMyExpense ? 'expense' : 'income',
                display_sign: isMyExpense ? '-' : '+'
            };
        });
    }
}