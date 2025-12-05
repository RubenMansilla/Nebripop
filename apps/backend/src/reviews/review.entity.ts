import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/users.entity';
import { Product } from '../products/products.entity';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    rating: number;

    @Column()
    comment: string;

    @Column()
    created_at: Date;

    @Column()
    reviewer_id: number;

    @Column()
    reviewed_user_id: number;

    @Column()
    product_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;
}