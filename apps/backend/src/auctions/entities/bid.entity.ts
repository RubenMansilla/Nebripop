import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Auction } from './auction.entity';
import { User } from '../../users/users.entity';

@Entity('bids')
export class Bid {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    auction_id: number;

    @ManyToOne(() => Auction, (auction) => auction.bids)
    @JoinColumn({ name: 'auction_id' })
    auction: Auction;

    @Column()
    bidder_id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'bidder_id' })
    bidder: User;

    @Column('numeric')
    amount: number;

    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;
}
