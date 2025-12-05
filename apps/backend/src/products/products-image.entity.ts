import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { ManyToOne, JoinColumn } from "typeorm";
import { Product } from "../products/products.entity";

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  image_url: string;

  @ManyToOne(() => Product, (product) => product.images)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
