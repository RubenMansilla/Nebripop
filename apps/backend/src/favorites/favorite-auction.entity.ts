import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Auction } from "../auctions/entities/auction.entity";
import { User } from "../users/users.entity";

@Entity("favorite_auctions")
export class FavoriteAuction {

    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    auction_id: number;

    @ManyToOne(() => Auction, (auction) => auction.favorites)
    @JoinColumn({ name: 'auction_id' })
    auction: Auction;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

}
