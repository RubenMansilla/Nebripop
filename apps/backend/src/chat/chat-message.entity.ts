import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from "typeorm";
import { Chat } from "./chat.entity";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "chat_id", type: "int8" })
  chatId: number;

  @Column({ name: "sender_id", type: "int8" })
  senderId: number;

  @Column({ type: "text" })
  message: string;

  @CreateDateColumn({ name: "sent_at" })
  sentAt: Date;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: "chat_id" })
  chat: Chat;
}
