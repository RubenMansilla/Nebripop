import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('product_images')
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  image_url: string;
}
