import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id', type: 'bigint' })
    userId: string;

    @Column({ default: 'transactions' })
    type: string;

    @Column()
    message: string;

    @Column({ name: 'product_id', type: 'int', nullable: true })
    productId: number | null;

    @Column({ name: 'is_read', default: false })
    isRead: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

}