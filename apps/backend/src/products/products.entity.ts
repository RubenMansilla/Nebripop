import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity('products')  // 👈 Usar nombre EXACTO de la tabla en Supabase
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @Column({ nullable: true })
  summary: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column("numeric")
  price: number;

  @Column({ nullable: true })
  condition: string;

  @Column({ nullable: true })
  brand: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  material: string;

  @Column("numeric", { nullable: true })
  width_cm: number;

  @Column("numeric", { nullable: true })
  height_cm: number;

  @Column("numeric", { nullable: true })
  depth_cm: number;

  @Column({ nullable: true })
  category_id: number;

  @Column({ nullable: true })
  subcategory_id: number;

  @Column({ default: false })
  shipping_active: boolean;

  @Column({ nullable: true })
  shipping_size: string;

  @Column({ nullable: true })
  shipping_weight: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column("numeric", { nullable: true })
  latitude: number;

  @Column("numeric", { nullable: true })
  longitude: number;
}
