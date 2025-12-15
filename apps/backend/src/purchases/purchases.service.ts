import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Purchase } from './purchase.entity';

@Injectable()
export class PurchasesService {

    constructor(
        @InjectRepository(Purchase)
        private purchaseRepo: Repository<Purchase>,
    ) { }

    // Ocultar compra (Lógica de Comprador)
    async hidePurchase(purchaseId: number, userId: number) {
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
    async hideSale(purchaseId: number, userId: number) {
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
}