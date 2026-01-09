// apps/backend/src/purchases/purchase.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Product } from "../products/products.entity";

@Entity("purchases")
export class Purchase {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "buyer_id", type: "uuid" })
  buyerId: string;

  @Column({ name: "seller_id", type: "uuid" })
  sellerId: string;

  @Column({ name: "product_id" })
  productId: number;

  @Column("decimal")
  price: number;

  @Column({ name: "deleted_by_buyer", default: false })
  deletedByBuyer: boolean;

  @Column({ name: "deleted_by_seller", default: false })
  deletedBySeller: boolean;

  // =====================
  // MÉTODO DE PAGO
  // =====================
  @Column({ name: "payment_method", default: "external" })
  paymentMethod: string; // "external" | "wallet"

  // =====================
  // DATOS DE ENVÍO
  // =====================
  @Column({ name: "shipping_email", nullable: true })
  shippingEmail: string;

  @Column({ name: "shipping_full_name", nullable: true })
  shippingFullName: string;

  @Column({ name: "shipping_address", nullable: true })
  shippingAddress: string;

  @Column({ name: "shipping_complement", nullable: true })
  shippingComplement: string;

  @Column({ name: "shipping_city", nullable: true })
  shippingCity: string;

  @Column({ name: "shipping_province", nullable: true })
  shippingProvince: string;

  @Column({ name: "shipping_postcode", nullable: true })
  shippingPostcode: string;

  @Column({ name: "shipping_phone", nullable: true })
  shippingPhone: string;

  @Column({ name: "shipping_country", nullable: true })
  shippingCountry: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @CreateDateColumn({ name: "purchased_at" })
  purchasedAt: Date;
}
