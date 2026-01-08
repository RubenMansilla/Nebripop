import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/products.entity';

@Entity('purchases')
export class Purchase {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column({ name: 'buyer_id', type: 'uuid' })
    buyerId: string;

    @Column({ name: 'seller_id', type: 'uuid' })
    sellerId: string;

    @Column({ name: 'product_id' })
    productId: number;

    @Column('decimal')
    price: number;

    @Column({ name: 'deleted_by_buyer', default: false })
    deletedByBuyer: boolean;

    @Column({ name: 'deleted_by_seller', default: false })
    deletedBySeller: boolean;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn({ name: 'purchased_at' })
    purchasedAt: Date;
}