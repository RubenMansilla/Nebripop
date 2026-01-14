import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Product } from '../products.entity';

@Entity('product_views')
export class ProductView {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    productId: number;

    @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;

    @Column({ type: 'int', nullable: true })
    userId: number | null;

    @Column({ nullable: true })
    ip: string;

    @CreateDateColumn()
    viewedAt: Date;
}