import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";

import { ProductImage } from "../products/products-image.entity";
import { Category } from "../categories/categories.entity";
import { Subcategory } from "../subcategories/subcategories.entity";
import { FavoriteProduct } from "../favorites/favorite-product.entity";
import { Chat } from "../chat/chat.entity";
import { User } from "../users/users.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  owner_id: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: "owner_id" })
  seller: User;

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

  // ======================
  // CATEGORÍAS (FK)
  // ======================
  @Column({ nullable: true })
  category_id: number;

  @Column({ nullable: true })
  subcategory_id: number;

  // ======================
  // RELACIONES
  // ======================
  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: "category_id" })
  category: Category;

  @ManyToOne(() => Subcategory, { nullable: true })
  @JoinColumn({ name: "subcategory_id" })
  subcategory: Subcategory;

  // ======================
  // ENVÍO
  // ======================
  @Column({ default: false })
  shipping_active: boolean;

  @Column({ nullable: true })
  shipping_size: string;

  @Column({ nullable: true })
  shipping_weight: string;

  // ======================
  // UBICACIÓN
  // ======================
  @Column({ nullable: true })
  postal_code: string;

  @Column("numeric", { nullable: true })
  latitude: number;

  @Column("numeric", { nullable: true })
  longitude: number;

  // ======================
  // ESTADO
  // ======================
  @Column({ default: false })
  sold: boolean;

  @DeleteDateColumn({ name: "deleted_at", select: false })
  deletedAt: Date;

  // ======================
  // IMÁGENES
  // ======================
  @OneToMany(() => ProductImage, (img) => img.product)
  images: ProductImage[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @Column({ type: 'int', default: 0 })
  views_count: number;

  @OneToMany(() => FavoriteProduct, (fav) => fav.product)
  favorites: FavoriteProduct[];

  @ManyToMany(() => Chat, (chat) => chat.products)
  chats: Chat[];

}