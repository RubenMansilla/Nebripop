import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { ChatMessage } from "./chat-message.entity";

@Entity("chats")
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "buyer_id", type: "int8" })
  buyerId: number;

  @Column({ name: "seller_id", type: "int8" })
  sellerId: number;

  @Column({ name: "product_id", type: "int8", nullable: true })
  productId: number | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @OneToMany(() => ChatMessage, (msg) => msg.chat)
  messages: ChatMessage[];
}
