import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("favorites_products")
export class FavoriteProduct {

    @PrimaryColumn()
    user_id: number;

    @PrimaryColumn()
    product_id: number;
}
