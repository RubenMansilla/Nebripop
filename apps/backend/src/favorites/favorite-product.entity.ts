import { Entity, Column, PrimaryColumn, ManyToOne } from "typeorm";
import { JoinColumn } from "typeorm";
import { Product } from "../products/products.entity";

@Entity("favorites_products")
export class FavoriteProduct {

    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    product_id: number;

    @ManyToOne(() => Product, (product) => product.favorites)
    @JoinColumn({ name: 'product_id' }) // Le decimos que use la columna 'product_id' para unir
    product: Product;

}
