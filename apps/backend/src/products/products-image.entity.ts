// apps/backend/src/products/products-image.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "../products/products.entity";

@Entity("product_images")
export class ProductImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  product_id: number;

  @Column()
  image_url: string;

  // 👉 ruta interna en el bucket Supabase: "123/uuid.webp"
  
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_id" })
  product: Product;
}
