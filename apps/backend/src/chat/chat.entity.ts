import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/products.entity';
// Importa tu User entity si la tienes, aquí asumo relaciones por ID para simplificar
import { User } from '../users/users.entity';

@Entity('chats')
export class Chat {
    @PrimaryGeneratedColumn('increment') // o 'uuid' según tu BDD
    id: number;

    @Column({ name: 'buyer_id' })
    buyerId: number;

    @Column({ name: 'seller_id' })
    sellerId: number;

    @Column({ name: 'product_id' })
    productId: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}