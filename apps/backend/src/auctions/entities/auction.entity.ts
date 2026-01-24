import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToMany,
} from 'typeorm';
import { Product } from '../../products/products.entity';
import { User } from '../../users/users.entity';
import { Bid } from './bid.entity';
import { FavoriteAuction } from '../../favorites/favorite-auction.entity';

@Entity('auctions')
export class Auction {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    product_id: number;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column()
    seller_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'seller_id' })
    seller: User;

    @Column('numeric')
    starting_price: number;

    @Column('numeric', { default: 0 })
    current_bid: number;

    @Column()
    end_time: Date;

    @Column({ default: 'active' }) // active, awaiting_payment, sold, expired, cancelled
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @OneToMany(() => Bid, (bid) => bid.auction)
    bids: Bid[];

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'winner_id' })
    winner: User | null;

    @Column({ name: 'winner_id', nullable: true })
    winner_id: number | null;

    @Column({ name: 'payment_deadline', type: 'timestamp', nullable: true })
    payment_deadline: Date | null;

    @Column({ name: 'notifications_sent', type: 'jsonb', default: {} })
    notifications_sent: Record<string, boolean>;

    @OneToMany(() => FavoriteAuction, (favorite) => favorite.auction)
    favorites: FavoriteAuction[];
}
