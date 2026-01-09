// apps/backend/src/purchases/purchases.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Purchase } from './purchase.entity';
import { Product } from '../products/products.entity';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepo: Repository<Purchase>,

    @InjectRepository(Product)
    private productRepo: Repository<Product>,

    private walletService: WalletService,
  ) { }

  // =========================
  // CREAR COMPRA (PayPal / Monedero)
  // =========================
  async createPurchase(data: any, userId: number) {
    const {
      productId,
      paymentMethod,
      shippingEmail,
      shippingFullName,
      shippingAddress,
      shippingComplement,
      shippingCity,
      shippingProvince,
      shippingPostcode,
      shippingPhone,
      shippingCountry,
    } = data;

    if (!productId) {
      throw new BadRequestException('productId es obligatorio');
    }

    if (!['external', 'wallet'].includes(paymentMethod)) {
      throw new BadRequestException('Método de pago no válido');
    }

    // 1) Cargar producto
    const product = await this.productRepo.findOne({
      where: { id: Number(productId) },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (product.sold) {
      throw new BadRequestException('Este producto ya está vendido');
    }

    if (product.owner_id === userId) {
      throw new BadRequestException('No puedes comprar tu propio producto');
    }

    const productPrice = Number(product.price);
    const iva = productPrice * 0.21;      // 21 % de IVA
    const shippingCost = 1.99;            // envío fijo en España
    const totalToCharge = productPrice + iva + shippingCost;

    // 2) Si es monedero, comprobar saldo y retirar
    if (paymentMethod === 'wallet') {

      // ⬇️ aquí ahora se descuenta el TOTAL (precio + IVA + envío)
      await this.walletService.withdraw(userId, totalToCharge);
    }

    // 3) Marcar producto como vendido
    product.sold = true;
    await this.productRepo.save(product);

    // 4) Crear registro de compra
    const purchase = this.purchaseRepo.create({
      buyerId: userId as any,          // según cómo tengas el tipo de columna
      sellerId: product.owner_id as any,
      productId: product.id,
      price: totalToCharge,            // aquí guardo solo el precio del producto
      // si más adelante quieres guardar IVA / envío,
      // habría que añadir columnas nuevas a la tabla.
    });

    const saved = await this.purchaseRepo.save(purchase);
    return saved;
  }

  // =========================
  // OCULTAR COMPRA (Comprador)
  // =========================
  async hidePurchase(purchaseId: number, userId: string) {
    console.log('Hiding purchase:', purchaseId, 'for user:', userId);

    const purchase = await this.purchaseRepo.findOne({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (String(purchase.buyerId) === String(userId)) {
      purchase.deletedByBuyer = true;
      return this.purchaseRepo.save(purchase);
    }

    throw new UnauthorizedException('No eres el comprador en esta transacción');
  }

  // =========================
  // OCULTAR VENTA (Vendedor)
  // =========================
  async hideSale(purchaseId: number, userId: string) {
    const purchase = await this.purchaseRepo.findOne({
      where: { id: purchaseId },
    });

    if (!purchase) {
      throw new NotFoundException('Transacción no encontrada');
    }

    if (String(purchase.sellerId) === String(userId)) {
      purchase.deletedBySeller = true;
      return this.purchaseRepo.save(purchase);
    }

    throw new UnauthorizedException('No eres el vendedor en esta transacción');
  }

  // =========================
  // HISTORIAL (in/out/all)
  // =========================
  async findAllUserTransactions(
    userId: string,
    filter: 'all' | 'in' | 'out',
  ) {
    const query = this.purchaseRepo.createQueryBuilder('purchase');

    query.leftJoinAndSelect('purchase.product', 'product');
    query.leftJoinAndSelect('product.images', 'images');

    query.where(
      new Brackets((qb) => {
        if (filter === 'out' || filter === 'all') {
          qb.orWhere(
            '(purchase.buyerId = :userId AND purchase.deletedByBuyer = :false)',
            { userId, false: false },
          );
        }
        if (filter === 'in' || filter === 'all') {
          qb.orWhere(
            '(purchase.sellerId = :userId AND purchase.deletedBySeller = :false)',
            { userId, false: false },
          );
        }
      }),
    );

    query.orderBy('purchase.purchasedAt', 'DESC');

    const transactions = await query.getMany();

    return transactions.map((t) => {
      const isMyExpense = String(t.buyerId) === String(userId);

      return {
        ...t,
        transaction_type: isMyExpense ? 'expense' : 'income',
        display_sign: isMyExpense ? '-' : '+',
      };
    });
  }
}
