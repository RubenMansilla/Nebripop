import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Product } from "../products/products.entity";
import { User } from "../users/users.entity";

@Entity("favorites_products")
export class FavoriteProduct {

    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    product_id: number;

    @ManyToOne(() => Product, (product) => product.favorites)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

}
